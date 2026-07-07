insert into public.organizations (id, name, sector)
values ('00000000-0000-4000-8000-000000000001', 'ImpactPulse Demo Organization', 'Workforce development')
on conflict (id) do update
set name = excluded.name,
    sector = excluded.sector;

insert into public.projects (
  id,
  organization_id,
  name,
  reporting_period,
  location,
  readiness_status,
  analysis_type,
  currency_code
)
values (
  '00000000-0000-4000-8000-000000000101',
  '00000000-0000-4000-8000-000000000001',
  'Workforce Pathways 2026',
  'FY 2026 forecast',
  '3 sites, Midwest US',
  'needs_review',
  'sroi',
  'USD'
)
on conflict (id) do update
set name = excluded.name,
    reporting_period = excluded.reporting_period,
    location = excluded.location,
    readiness_status = excluded.readiness_status;

insert into public.stakeholders (id, organization_id, project_id, name, segment, estimated_count, inclusion_note)
values
  (
    '00000000-0000-4000-8000-000000000201',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000101',
    'Adult job seekers',
    'Participants',
    820,
    'Rural participants need additional validation before equity claims are approved.'
  ),
  (
    '00000000-0000-4000-8000-000000000202',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000101',
    'Local employers',
    'Hiring partners',
    46,
    'Employer benefit is supporting context, not counted as primary social value yet.'
  )
on conflict (id) do update
set name = excluded.name,
    segment = excluded.segment,
    estimated_count = excluded.estimated_count,
    inclusion_note = excluded.inclusion_note;

insert into public.evidence_sources (
  id,
  organization_id,
  project_id,
  title,
  source_type,
  permission_status,
  quality_status,
  source_date
)
values
  (
    '00000000-0000-4000-8000-000000000301',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000101',
    'Monitoring dataset',
    'dataset',
    'approved',
    'estimated',
    '2026-06-30'
  ),
  (
    '00000000-0000-4000-8000-000000000302',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000101',
    'Stakeholder interviews',
    'interviews',
    'needs_review',
    'needs_review',
    '2026-06-15'
  ),
  (
    '00000000-0000-4000-8000-000000000303',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000101',
    'FY 2026 budget',
    'budget',
    'approved',
    'conflict',
    '2026-05-31'
  )
on conflict (id) do update
set title = excluded.title,
    source_type = excluded.source_type,
    permission_status = excluded.permission_status,
    quality_status = excluded.quality_status,
    source_date = excluded.source_date;

insert into public.outcomes (
  id,
  organization_id,
  project_id,
  stakeholder_id,
  name,
  description,
  change_type,
  materiality_score,
  evidence_status,
  valuation_readiness,
  decision_note,
  sort_order
)
values
  (
    '00000000-0000-4000-8000-000000000401',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000201',
    'Sustained employment',
    'Participants remain employed six months after completing training.',
    'positive',
    92,
    'needs_review',
    'needs_review',
    'Collect missing follow-up before public SROI reporting.',
    1
  ),
  (
    '00000000-0000-4000-8000-000000000402',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000201',
    'Wage progression',
    'Participants increase hourly wages after placement.',
    'positive',
    78,
    'approved',
    'approved',
    'Use approved local wage proxy for central case.',
    2
  ),
  (
    '00000000-0000-4000-8000-000000000403',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000201',
    'Reduced emergency support reliance',
    'Participants need fewer short-term emergency supports after stable employment.',
    'positive',
    63,
    'estimated',
    'draft',
    'Keep as draft until source strength improves.',
    3
  ),
  (
    '00000000-0000-4000-8000-000000000404',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000201',
    'Transport burden for rural participants',
    'Program participation may increase travel time and cost for some rural participants.',
    'negative',
    71,
    'needs_review',
    'blocked',
    'Validate rural sample before equity or SDG 10.2 claim language.',
    4
  )
on conflict (id) do update
set name = excluded.name,
    description = excluded.description,
    change_type = excluded.change_type,
    materiality_score = excluded.materiality_score,
    evidence_status = excluded.evidence_status,
    valuation_readiness = excluded.valuation_readiness,
    decision_note = excluded.decision_note,
    sort_order = excluded.sort_order;

insert into public.indicators (
  id,
  organization_id,
  project_id,
  outcome_id,
  name,
  unit,
  baseline_value,
  target_value,
  observed_value,
  collection_frequency,
  evidence_source_id
)
values
  (
    '00000000-0000-4000-8000-000000000501',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000401',
    'Participants employed at six months',
    'participants',
    0,
    410,
    351,
    'six-month follow-up',
    '00000000-0000-4000-8000-000000000301'
  ),
  (
    '00000000-0000-4000-8000-000000000502',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000402',
    'Average hourly wage lift',
    'USD per hour',
    0,
    3.25,
    2.90,
    'placement review',
    '00000000-0000-4000-8000-000000000301'
  ),
  (
    '00000000-0000-4000-8000-000000000503',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000404',
    'Rural participants reporting transport barrier',
    'percent',
    0,
    20,
    31,
    'stakeholder interview round',
    '00000000-0000-4000-8000-000000000302'
  )
on conflict (id) do update
set name = excluded.name,
    unit = excluded.unit,
    baseline_value = excluded.baseline_value,
    target_value = excluded.target_value,
    observed_value = excluded.observed_value,
    collection_frequency = excluded.collection_frequency,
    evidence_source_id = excluded.evidence_source_id;

insert into public.evidence_claims (
  id,
  organization_id,
  project_id,
  evidence_source_id,
  outcome_id,
  claim,
  status,
  affects,
  review_note
)
values
  (
    '00000000-0000-4000-8000-000000000601',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000301',
    '00000000-0000-4000-8000-000000000401',
    '351 sustained employment outcomes',
    'needs_review',
    array['SROI range', 'confidence', 'report disclosure'],
    'Follow-up coverage is partial and lower for rural participants.'
  ),
  (
    '00000000-0000-4000-8000-000000000602',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000101',
    '00000000-0000-4000-8000-000000000302',
    '00000000-0000-4000-8000-000000000404',
    'Transport is a material rural barrier',
    'needs_review',
    array['equity', 'SDG 10.2', 'next action'],
    'Interview sample is too small for publication.'
  )
on conflict (id) do update
set claim = excluded.claim,
    status = excluded.status,
    affects = excluded.affects,
    review_note = excluded.review_note;

insert into public.quality_profiles (
  id,
  organization_id,
  project_id,
  evidence_coverage_score,
  sufficiency_score,
  conflict_count,
  assurance_gap_count,
  publication_status,
  treatment_summary
)
values (
  '00000000-0000-4000-8000-000000000701',
  '00000000-0000-4000-8000-000000000001',
  '00000000-0000-4000-8000-000000000101',
  74,
  68,
  2,
  4,
  'blocked',
  'Internal planning is allowed with caveats; publication waits for follow-up and boundary treatment.'
)
on conflict (id) do update
set evidence_coverage_score = excluded.evidence_coverage_score,
    sufficiency_score = excluded.sufficiency_score,
    conflict_count = excluded.conflict_count,
    assurance_gap_count = excluded.assurance_gap_count,
    publication_status = excluded.publication_status,
    treatment_summary = excluded.treatment_summary;

insert into public.review_tasks (
  id,
  organization_id,
  project_id,
  title,
  task_type,
  priority,
  status,
  due_on,
  affected_area
)
values
  (
    '00000000-0000-4000-8000-000000000801',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000101',
    'Complete six-month follow-up',
    'collection',
    1,
    'needs_review',
    '2026-07-12',
    'Sustained employment'
  ),
  (
    '00000000-0000-4000-8000-000000000802',
    '00000000-0000-4000-8000-000000000001',
    '00000000-0000-4000-8000-000000000101',
    'Validate rural transport barrier',
    'stakeholder_validation',
    2,
    'needs_review',
    '2026-07-16',
    'Transport burden'
  )
on conflict (id) do update
set title = excluded.title,
    task_type = excluded.task_type,
    priority = excluded.priority,
    status = excluded.status,
    due_on = excluded.due_on,
    affected_area = excluded.affected_area;
