# Supabase Backend Foundation

ImpactPulse uses Supabase as the planned backend for organization-scoped impact workspaces, evidence lineage, outcome models, SROI calculations, reports, and audit trails.

## Current Integration Level

The prototype is still framework-free. Supabase is integrated as:

- SQL migration under `supabase/migrations/`.
- Demo seed data under `supabase/seed.sql`.
- Local runtime config served from `/config.js`.
- A narrow read-only browser adapter in `src/backend/supabase.js`.
- The `/outcomes/` page renders demo data first, then hydrates from Supabase when configured.

This avoids a premature framework or build-system migration while proving the data model and RLS shape.

## Environment

Create `.env.local` from `.env.example`:

```bash
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-public-anon-key
SUPABASE_SCHEMA=public
SUPABASE_DEMO_PROJECT_ID=00000000-0000-4000-8000-000000000101
```

Never commit `.env.local`, the service-role key, database passwords, or access tokens.

## Schema Scope

The first migration creates:

- `organizations`
- `organization_memberships`
- `projects`
- `stakeholders`
- `evidence_sources`
- `outcomes`
- `indicators`
- `evidence_claims`
- `assumptions`
- `financial_proxies`
- `sroi_runs`
- `quality_profiles`
- `review_tasks`
- `reports`
- `audit_events`

Every project-level table carries `organization_id` and `project_id` so results, evidence, assumptions, reports, and tasks stay tenant-scoped.

## Row Level Security

RLS is enabled on all application tables. Access is based on `organization_memberships`:

- Members can read organization-scoped records.
- Owners and admins can update organization records and manage memberships.
- Owners, admins, analysts, and reviewers can write analytical and review records.
- Funders/viewers are read-oriented until explicit collaboration rules are designed.

Direct browser organization creation and owner self-assignment are intentionally omitted. For the prototype, seed or create organizations administratively. Product onboarding should be implemented through a security-definer RPC or trusted server path after authentication, invitations, and reviewer role flows are designed.

## Applying Locally

Use the Supabase CLI or SQL editor:

```bash
supabase db push
supabase db seed
```

If using the hosted SQL editor, apply the migration first, then the seed data.

## Frontend Behavior

When Supabase is not configured:

- The app runs entirely on demo data.
- `/outcomes/` shows "Demo fallback".
- Visual and accessibility audits remain deterministic.

When Supabase is configured:

- `/config.js` exposes only `SUPABASE_URL`, `SUPABASE_ANON_KEY`, schema, and demo project ID.
- `/outcomes/` attempts to read `outcomes`, `indicators`, `stakeholders`, and `review_tasks`.
- If RLS blocks the read or rows are missing, the page keeps demo rows visible and reports the backend state.

## Next Backend Decisions

- Add Supabase Auth and organization onboarding before enabling writes.
- Add evidence file storage with organization-prefixed paths.
- Introduce `@supabase/supabase-js` when the frontend moves to a bundled framework or Vite build.
- Add server-side calculation functions only after the SROI model stabilizes in the prototype.
