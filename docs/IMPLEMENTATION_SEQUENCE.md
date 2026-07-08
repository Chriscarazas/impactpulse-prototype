# Implementation Sequence

## Priority 1: Foundation

- Product vision
- Design constitution
- User flows
- Page specifications
- Data visualization rules
- Content style guide
- Accessibility standard
- Design review process
- Decision log
- Centralized design tokens

## Priority 2: Legacy Pilot Page

- Build the first representative analytical page.
- Include project context, step rail, governed method context, evidence quality, sensitivity, assumptions, SDG claims, and next actions.
- Add challenge workflow before approval.
- Superseded by Priority 10 for fortified-roadmap work: Impact Account is now the default decision surface.

## Priority 3: Review Automation

- Start app in test environment.
- Capture desktop, tablet, and mobile screenshots.
- Detect horizontal page overflow and obvious layout failures.
- Run accessibility checks.
- Preserve review artifacts.
- Fail clearly on critical issues.

## Priority 4: Full Product Spine

- Add route-driven app shell.
- Define route map for the core MVP journey and later platform areas.
- Keep the same demo data across every route.
- Add Upload-to-First-Insight as the flagship entry flow.
- Audit every route in the spine.

## Priority 5: Evidence Review Queue

Build the upstream evidence review page next. It should include source inventory, extracted claims, data quality, conflicts, gaps, AI suggestions, human approval, and assignment states.

## Priority 6: Reusable Component Extraction

Extract components only after patterns are proven across at least two pages:

- Project header
- SROI step rail
- Status/claim label
- Evidence lineage panel
- Assumption row
- Accessible chart block
- Review task list

## Priority 7: Supabase Backend Foundation

- Apply the RLS-first Supabase schema.
- Seed the Workforce Pathways demo records.
- Keep browser writes disabled until auth and memberships exist.
- Use demo fallback data whenever Supabase is not configured.
- Hydrate prototype pages only after the first deterministic render.

## Priority 8: Outcomes Workspace

Build `/outcomes/` as the first backend-aware workspace. It should connect stakeholders, outcomes, indicators, evidence readiness, valuation readiness, materiality, validation gaps, review tasks, and backend state.

## Priority 9: Auth and Evidence Storage

- Add Supabase magic-link auth for evidence upload.
- Add private evidence file storage with organization-prefixed paths.
- Connect upload metadata to `evidence_sources`.
- Add Supabase Auth and organization onboarding.
- Create membership invitation and role management flows.
- Preserve audit events for evidence, assumptions, approvals, and report snapshots.

## Priority 10: Impact Account Default and SROI Safety Baseline

- Implement the first fortified-roadmap migration phase without deleting current functionality or data.
- Make `/` an Impact Account default view.
- Reframe `/portfolio/` as an Organization Impact Account.
- Reframe `/valuation/` as the Method and Valuation Gate.
- Reframe `/assurance/` as a multidimensional Assurance Matrix.
- Add visible safeguards for SROI eligibility, stakeholder legitimacy, harm review, proxy quality, benchmark comparability, and intended use.
- Keep SROI visible only as exploratory governed method context until eligibility review is complete.
- Add feature flags for the reversible UI migration.
- Add a methodology safety check to prevent unsupported ratio-led copy and route regressions.
- No database migration is required for this non-destructive migration phase.
- Rollback by restoring the previous `/` renderer and disabling the new methodology feature flags while preserving Supabase data and migrations.
