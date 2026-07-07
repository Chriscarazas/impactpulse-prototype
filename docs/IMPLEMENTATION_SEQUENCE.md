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

## Priority 2: Pilot Page

- Build SROI Results as the representative page.
- Include project context, step rail, headline SROI, evidence quality, sensitivity, assumptions, SDG claims, and next actions.
- Add challenge workflow before approval.

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
