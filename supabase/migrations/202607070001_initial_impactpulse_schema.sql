create extension if not exists "pgcrypto";

do $$
begin
  create type public.membership_role as enum ('owner', 'admin', 'analyst', 'reviewer', 'viewer', 'funder');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.review_status as enum ('draft', 'needs_review', 'approved', 'blocked', 'archived');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.evidence_status as enum ('observed', 'derived', 'estimated', 'ai_suggested', 'approved', 'verified', 'needs_review', 'conflict');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sector text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.organization_memberships (
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role public.membership_role not null default 'viewer',
  created_at timestamptz not null default now(),
  primary key (organization_id, user_id)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  reporting_period text not null,
  location text,
  readiness_status public.review_status not null default 'draft',
  analysis_type text not null default 'sroi',
  currency_code text not null default 'USD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stakeholders (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  segment text,
  estimated_count integer,
  inclusion_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.evidence_sources (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  source_type text not null,
  permission_status public.review_status not null default 'draft',
  quality_status public.evidence_status not null default 'needs_review',
  storage_path text,
  source_date date,
  uploaded_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.outcomes (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  stakeholder_id uuid references public.stakeholders(id) on delete set null,
  name text not null,
  description text,
  change_type text not null default 'positive',
  materiality_score numeric(5,2) not null default 0,
  evidence_status public.evidence_status not null default 'needs_review',
  valuation_readiness public.review_status not null default 'draft',
  decision_note text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.indicators (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  outcome_id uuid not null references public.outcomes(id) on delete cascade,
  name text not null,
  unit text,
  baseline_value numeric,
  target_value numeric,
  observed_value numeric,
  collection_frequency text,
  evidence_source_id uuid references public.evidence_sources(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.evidence_claims (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  evidence_source_id uuid references public.evidence_sources(id) on delete set null,
  outcome_id uuid references public.outcomes(id) on delete set null,
  claim text not null,
  status public.evidence_status not null default 'needs_review',
  affects text[] not null default '{}',
  reviewer_id uuid references auth.users(id) on delete set null,
  review_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assumptions (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  outcome_id uuid references public.outcomes(id) on delete set null,
  name text not null,
  value_numeric numeric,
  value_text text,
  unit text,
  confidence_score numeric(5,2),
  effect_level text not null default 'medium',
  status public.review_status not null default 'needs_review',
  source_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.financial_proxies (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  outcome_id uuid references public.outcomes(id) on delete set null,
  label text not null,
  amount numeric(14,2) not null,
  currency_code text not null default 'USD',
  price_year integer,
  geography text,
  source text,
  approval_status public.review_status not null default 'needs_review',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sroi_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  scenario_name text not null,
  investment_amount numeric(14,2) not null,
  social_value_amount numeric(14,2) not null,
  sroi_ratio numeric(8,2) not null,
  low_ratio numeric(8,2),
  high_ratio numeric(8,2),
  confidence_score numeric(5,2),
  status public.review_status not null default 'draft',
  calculated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.quality_profiles (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  evidence_coverage_score numeric(5,2) not null default 0,
  sufficiency_score numeric(5,2) not null default 0,
  conflict_count integer not null default 0,
  assurance_gap_count integer not null default 0,
  publication_status public.review_status not null default 'blocked',
  treatment_summary text,
  profiled_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.review_tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  task_type text not null,
  priority integer not null default 3,
  status public.review_status not null default 'needs_review',
  assigned_to uuid references auth.users(id) on delete set null,
  due_on date,
  affected_area text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  audience text not null,
  status public.review_status not null default 'draft',
  snapshot jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  actor_user_id uuid references auth.users(id) on delete set null,
  event_type text not null,
  entity_table text not null,
  entity_id uuid,
  summary text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.is_org_member(target_org_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_memberships membership
    where membership.organization_id = target_org_id
      and membership.user_id = auth.uid()
  );
$$;

create or replace function public.has_org_role(target_org_id uuid, allowed_roles public.membership_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.organization_memberships membership
    where membership.organization_id = target_org_id
      and membership.user_id = auth.uid()
      and membership.role = any(allowed_roles)
  );
$$;

do $$
declare
  table_name text;
begin
  foreach table_name in array array[
    'organizations',
    'projects',
    'stakeholders',
    'evidence_sources',
    'outcomes',
    'indicators',
    'evidence_claims',
    'assumptions',
    'financial_proxies',
    'review_tasks',
    'reports'
  ]
  loop
    execute format(
      'drop trigger if exists %I on public.%I',
      'set_' || table_name || '_updated_at',
      table_name
    );
    execute format(
      'create trigger %I before update on public.%I for each row execute function public.touch_updated_at()',
      'set_' || table_name || '_updated_at',
      table_name
    );
  end loop;
end $$;

alter table public.organizations enable row level security;
alter table public.organization_memberships enable row level security;
alter table public.projects enable row level security;
alter table public.stakeholders enable row level security;
alter table public.evidence_sources enable row level security;
alter table public.outcomes enable row level security;
alter table public.indicators enable row level security;
alter table public.evidence_claims enable row level security;
alter table public.assumptions enable row level security;
alter table public.financial_proxies enable row level security;
alter table public.sroi_runs enable row level security;
alter table public.quality_profiles enable row level security;
alter table public.review_tasks enable row level security;
alter table public.reports enable row level security;
alter table public.audit_events enable row level security;

drop policy if exists "Organizations are visible to their members" on public.organizations;
create policy "Organizations are visible to their members"
on public.organizations for select
using (public.is_org_member(id));

drop policy if exists "Authenticated users can create organizations" on public.organizations;
-- Direct organization creation is intentionally omitted until onboarding is designed.
-- Use the service role, Supabase dashboard, or a future security-definer RPC.

drop policy if exists "Organization admins can update organizations" on public.organizations;
create policy "Organization admins can update organizations"
on public.organizations for update
using (public.has_org_role(id, array['owner', 'admin']::public.membership_role[]))
with check (public.has_org_role(id, array['owner', 'admin']::public.membership_role[]));

drop policy if exists "Memberships are visible to organization members" on public.organization_memberships;
create policy "Memberships are visible to organization members"
on public.organization_memberships for select
using (public.is_org_member(organization_id));

drop policy if exists "Users can create their owner membership" on public.organization_memberships;
-- Direct owner self-assignment is intentionally omitted. Membership creation
-- should happen through invitation/onboarding flows after auth is implemented.

drop policy if exists "Organization admins manage memberships" on public.organization_memberships;
create policy "Organization admins manage memberships"
on public.organization_memberships for all
using (public.has_org_role(organization_id, array['owner', 'admin']::public.membership_role[]))
with check (public.has_org_role(organization_id, array['owner', 'admin']::public.membership_role[]));

drop policy if exists "Members can read projects" on public.projects;
create policy "Members can read projects" on public.projects for select using (public.is_org_member(organization_id));
drop policy if exists "Analysts can write projects" on public.projects;
create policy "Analysts can write projects" on public.projects for all
using (public.has_org_role(organization_id, array['owner', 'admin', 'analyst']::public.membership_role[]))
with check (public.has_org_role(organization_id, array['owner', 'admin', 'analyst']::public.membership_role[]));

drop policy if exists "Members can read stakeholders" on public.stakeholders;
create policy "Members can read stakeholders" on public.stakeholders for select using (public.is_org_member(organization_id));
drop policy if exists "Analysts can write stakeholders" on public.stakeholders;
create policy "Analysts can write stakeholders" on public.stakeholders for all
using (public.has_org_role(organization_id, array['owner', 'admin', 'analyst']::public.membership_role[]))
with check (public.has_org_role(organization_id, array['owner', 'admin', 'analyst']::public.membership_role[]));

drop policy if exists "Members can read evidence sources" on public.evidence_sources;
create policy "Members can read evidence sources" on public.evidence_sources for select using (public.is_org_member(organization_id));
drop policy if exists "Analysts can write evidence sources" on public.evidence_sources;
create policy "Analysts can write evidence sources" on public.evidence_sources for all
using (public.has_org_role(organization_id, array['owner', 'admin', 'analyst']::public.membership_role[]))
with check (public.has_org_role(organization_id, array['owner', 'admin', 'analyst']::public.membership_role[]));

drop policy if exists "Members can read outcomes" on public.outcomes;
create policy "Members can read outcomes" on public.outcomes for select using (public.is_org_member(organization_id));
drop policy if exists "Analysts can write outcomes" on public.outcomes;
create policy "Analysts can write outcomes" on public.outcomes for all
using (public.has_org_role(organization_id, array['owner', 'admin', 'analyst']::public.membership_role[]))
with check (public.has_org_role(organization_id, array['owner', 'admin', 'analyst']::public.membership_role[]));

drop policy if exists "Members can read indicators" on public.indicators;
create policy "Members can read indicators" on public.indicators for select using (public.is_org_member(organization_id));
drop policy if exists "Analysts can write indicators" on public.indicators;
create policy "Analysts can write indicators" on public.indicators for all
using (public.has_org_role(organization_id, array['owner', 'admin', 'analyst']::public.membership_role[]))
with check (public.has_org_role(organization_id, array['owner', 'admin', 'analyst']::public.membership_role[]));

drop policy if exists "Members can read evidence claims" on public.evidence_claims;
create policy "Members can read evidence claims" on public.evidence_claims for select using (public.is_org_member(organization_id));
drop policy if exists "Analysts can write evidence claims" on public.evidence_claims;
create policy "Analysts can write evidence claims" on public.evidence_claims for all
using (public.has_org_role(organization_id, array['owner', 'admin', 'analyst', 'reviewer']::public.membership_role[]))
with check (public.has_org_role(organization_id, array['owner', 'admin', 'analyst', 'reviewer']::public.membership_role[]));

drop policy if exists "Members can read assumptions" on public.assumptions;
create policy "Members can read assumptions" on public.assumptions for select using (public.is_org_member(organization_id));
drop policy if exists "Analysts can write assumptions" on public.assumptions;
create policy "Analysts can write assumptions" on public.assumptions for all
using (public.has_org_role(organization_id, array['owner', 'admin', 'analyst', 'reviewer']::public.membership_role[]))
with check (public.has_org_role(organization_id, array['owner', 'admin', 'analyst', 'reviewer']::public.membership_role[]));

drop policy if exists "Members can read financial proxies" on public.financial_proxies;
create policy "Members can read financial proxies" on public.financial_proxies for select using (public.is_org_member(organization_id));
drop policy if exists "Analysts can write financial proxies" on public.financial_proxies;
create policy "Analysts can write financial proxies" on public.financial_proxies for all
using (public.has_org_role(organization_id, array['owner', 'admin', 'analyst']::public.membership_role[]))
with check (public.has_org_role(organization_id, array['owner', 'admin', 'analyst']::public.membership_role[]));

drop policy if exists "Members can read SROI runs" on public.sroi_runs;
create policy "Members can read SROI runs" on public.sroi_runs for select using (public.is_org_member(organization_id));
drop policy if exists "Analysts can write SROI runs" on public.sroi_runs;
create policy "Analysts can write SROI runs" on public.sroi_runs for all
using (public.has_org_role(organization_id, array['owner', 'admin', 'analyst']::public.membership_role[]))
with check (public.has_org_role(organization_id, array['owner', 'admin', 'analyst']::public.membership_role[]));

drop policy if exists "Members can read quality profiles" on public.quality_profiles;
create policy "Members can read quality profiles" on public.quality_profiles for select using (public.is_org_member(organization_id));
drop policy if exists "Analysts can write quality profiles" on public.quality_profiles;
create policy "Analysts can write quality profiles" on public.quality_profiles for all
using (public.has_org_role(organization_id, array['owner', 'admin', 'analyst', 'reviewer']::public.membership_role[]))
with check (public.has_org_role(organization_id, array['owner', 'admin', 'analyst', 'reviewer']::public.membership_role[]));

drop policy if exists "Members can read review tasks" on public.review_tasks;
create policy "Members can read review tasks" on public.review_tasks for select using (public.is_org_member(organization_id));
drop policy if exists "Members can write review tasks" on public.review_tasks;
create policy "Members can write review tasks" on public.review_tasks for all
using (public.has_org_role(organization_id, array['owner', 'admin', 'analyst', 'reviewer']::public.membership_role[]))
with check (public.has_org_role(organization_id, array['owner', 'admin', 'analyst', 'reviewer']::public.membership_role[]));

drop policy if exists "Members can read reports" on public.reports;
create policy "Members can read reports" on public.reports for select using (public.is_org_member(organization_id));
drop policy if exists "Analysts can write reports" on public.reports;
create policy "Analysts can write reports" on public.reports for all
using (public.has_org_role(organization_id, array['owner', 'admin', 'analyst', 'reviewer']::public.membership_role[]))
with check (public.has_org_role(organization_id, array['owner', 'admin', 'analyst', 'reviewer']::public.membership_role[]));

drop policy if exists "Members can read audit events" on public.audit_events;
create policy "Members can read audit events" on public.audit_events for select using (public.is_org_member(organization_id));
drop policy if exists "System and analysts can write audit events" on public.audit_events;
create policy "System and analysts can write audit events" on public.audit_events for insert
with check (public.has_org_role(organization_id, array['owner', 'admin', 'analyst', 'reviewer']::public.membership_role[]));

create index if not exists projects_organization_idx on public.projects(organization_id);
create index if not exists stakeholders_project_idx on public.stakeholders(project_id);
create index if not exists evidence_sources_project_idx on public.evidence_sources(project_id);
create index if not exists outcomes_project_sort_idx on public.outcomes(project_id, sort_order);
create index if not exists indicators_outcome_idx on public.indicators(outcome_id);
create index if not exists evidence_claims_project_idx on public.evidence_claims(project_id);
create index if not exists assumptions_project_idx on public.assumptions(project_id);
create index if not exists financial_proxies_project_idx on public.financial_proxies(project_id);
create index if not exists sroi_runs_project_idx on public.sroi_runs(project_id, calculated_at desc);
create index if not exists quality_profiles_project_idx on public.quality_profiles(project_id, profiled_at desc);
create index if not exists review_tasks_project_idx on public.review_tasks(project_id, priority, due_on);
create index if not exists audit_events_project_idx on public.audit_events(project_id, created_at desc);
