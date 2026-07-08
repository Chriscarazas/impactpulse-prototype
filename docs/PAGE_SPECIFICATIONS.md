# Page Specifications

## Principal Navigation

Global navigation:

- Home
- Projects
- Portfolio
- Evidence
- Insights
- Reports
- Govern

## Route Spine

- `/`: Impact Account.
- `/quick-start/`: Upload to First Insight.
- `/evidence/`: Evidence Review Queue.
- `/data-quality/`: Data Quality Overview.
- `/outcomes/`: Outcomes and Indicators.
- `/valuation/`: Method and Valuation Gate.
- `/assumptions/`: Assumptions Lab.
- `/decision/`: Decision Room.
- `/reports/`: Report Storyboard.
- `/portfolio/`: Organization Impact Account.
- `/benchmarks/`: Benchmark Cohort Builder.
- `/sdg/`: SDG Target Mapping.
- `/assurance/`: Assurance Matrix.

Every route must use the same workforce-development demo scenario until a backend exists.

## Migration Phase: Impact Account Default and SROI Safety Baseline

Objective:

- Reframe ImpactPulse as a defensible impact decision system before extending feature depth.
- Make the Impact Account the default route and executive review model.
- Treat SROI as optional governed method context, not the universal product default.
- Block public reporting, benchmark comparison, allocation optimization, and assurance-ready claims while SROI eligibility is not assessed.

Required safeguards:

- SROI appears only as governed method context until the eligibility gate is complete.
- The product must show stakeholder legitimacy, harm review, proxy quality, counterfactual credibility, benchmark comparability, and intended-use status near SROI language.
- The value bridge may remain visible for continuity, but it must be labeled exploratory and internal.
- No database migration is required for this non-destructive migration phase.
- Feature flags must make the reframing reversible while later phases add durable method-selection and eligibility data models.

Rollback:

- Disable or remove the `impactAccountDefault` and `sroiSafetyBaseline` route guards.
- Restore `/` to the previous SROI Results renderer only if the fortified-roadmap review accepts the methodological risk.
- Keep all existing Supabase data, migrations, and demo records intact.

## Upload to First Insight

Route: `/quick-start/`

Primary role:

- Advisor, evaluator, analyst, program manager

Primary questions:

- What are we trying to change?
- Who experiences the change?
- What evidence do we have?
- What assumptions are we making?
- What decision should happen next?

Required content:

- Upload surface for proposal, evaluation, budget, dataset, and stakeholder notes.
- Supabase readiness panel showing demo mode, sign-in needed, or upload-ready state.
- Magic-link request control for reviewer sign-in.
- Evidence file queue that remains useful without backend credentials.
- Signed-in upload path that creates private Storage objects and `evidence_sources` metadata.
- First insight containing candidate people affected, outcomes, evidence sources, gaps, comparable evidence, SDG suggestions, critical assumptions, and next action.
- Clear labels that generated insight is draft and requires human review.
- Route map into Evidence Review Queue, Outcomes, Valuation, Assumptions, Decision, and Report.

Project-level contextual navigation:

- Guided Process
- Dashboard
- Evidence
- Data Quality
- Delivery
- Place
- Assumptions
- Decisions
- Reports

Required states:

- Loading: selected files show processing status without shifting the upload surface.
- Empty: no files selected, with sample workspace still available.
- Error: magic-link or upload failure preserves selected file names and shows the failed state.
- Incomplete data: uploaded sources remain `needs_review` until extraction, permission, and evidence quality are reviewed.

## Default Page: Impact Account

Route: `/`

Primary role:

- Impact advisor, evaluator, analyst, executive reviewer

Primary questions:

- What are we trying to change?
- Who experiences the change?
- What evidence do we have?
- What assumptions are we making?
- What social value may have been created?
- How confident should we be?
- What decision should happen next?

Required content:

- Persistent project header with project name, lifecycle state, reporting period, location, readiness, collaborators, and last approved version.
- Impact Account sections for outcomes, people affected, harms, equity, evidence distribution, total investment, uncertainty, unmonetized material outcomes, reporting period, and decision implication.
- SROI eligibility snapshot with stakeholder legitimacy, harm review, proxy quality, counterfactual credibility, benchmark comparability, and intended-use status.
- Exploratory value bridge labeled as internal method context, not a publishable claim.
- Evidence coverage and quality labels beside the account summary.
- Assumption register preview with source, confidence, and approval state.
- SDG target claims with claim ladder, confidence, trade-offs, reviewer, and approval status.
- Decision recommendation and next actions.
- "Challenge this analysis" action before approval.

Required states:

- Loading: skeleton structure for headline, chart, table, and actions.
- Empty: no approved outcomes or valuation proxies yet, with next data task.
- Error: calculation cannot run, showing blocking missing inputs.
- Incomplete data: Impact Account remains visible, while exploratory SROI context is blocked from publication, benchmarking, assurance-ready claims, or allocation optimization.

## Evidence Review Queue

Route: `/evidence/`

Primary role:

- M&E specialist, impact analyst, SROI practitioner, finance reviewer

Primary questions:

- What evidence do we have?
- Who experiences the change?
- What assumptions are we making?
- How confident should we be?
- What decision should happen next?

Required content:

- It is the upstream source of trust for the Impact Account, method context, SDG claims, benchmark eligibility, reports, and assurance readiness.
- It exercises source provenance, data quality, conflicts, evidence gaps, review states, AI suggestions, and assignment flows.
- Source inventory with provenance, permission, freshness, quality, and supported claims.
- Extracted claim review across reach, costs, outcomes, indicators, proxies, assumptions, SDG mappings, and benchmark inputs.
- Evidence quality statuses: observed, derived, estimated, AI suggested, human approved, independently verified, needs review, and conflict.
- Gap prioritization by materiality, method effect, confidence effect, decision value, effort, feasibility, ethical risk, and participant burden.
- Conflict resolution showing disagreeing sources, affected calculation, required reviewer, and decision path.
- Downstream impact view showing affected SROI eligibility, Impact Account sections, SDG claims, report sections, and assurance readiness.

Required states:

- Loading: source, claim, and priority regions reserve layout while extraction runs.
- Empty: no sources connected, with upload and sample-workspace paths.
- Error: ingestion failed, with retry and preserved upload status.
- Incomplete data: claims can be reviewed, but affected results and reports remain draft.

## Data Quality Overview

Route: `/data-quality/`

Primary role:

- M&E specialist, impact analyst, SROI practitioner, finance reviewer, assurance reviewer

Primary questions:

- What evidence do we have?
- What assumptions are we making?
- How confident should we be?
- What decision should happen next?

Required content:

- Evidence quality profile with coverage, sufficiency, conflict exposure, and assurance gaps.
- Quality matrix for completeness, representativeness, validity, provenance, permission, and reproducibility.
- Each quality dimension must show current finding, downstream effect, treatment, and owner.
- Collection plan ranked by materiality, method effect, confidence effect, effort, and participant burden.
- Approval gates showing what is allowed, blocked, or allowed only with caveats.
- Treatment log showing how missing, conflicting, partial, or transformed data is handled.

Required states:

- Loading: reserve quality score, matrix, collection plan, and treatment log regions.
- Empty: no connected evidence, with upload and sample workspace entry points.
- Error: profiling failed, with retry and source-preservation path.
- Incomplete data: evidence can inform internal planning, but publication and assurance are blocked.

## Outcomes and Indicators

Route: `/outcomes/`

Primary role:

- Impact analyst, evaluator, program manager, SROI practitioner, funder reviewer

Primary questions:

- What are we trying to change?
- Who experiences the change?
- What evidence do we have?
- What assumptions are we making?
- What social value may have been created?
- How confident should we be?
- What decision should happen next?

Required content:

- Outcome model canvas connecting inputs, people affected, material outcomes, evidence, and value readiness.
- Outcome register showing stakeholder, indicator, evidence status, valuation readiness, and decision effect.
- Indicator mapping with observed value, unit, collection cadence, and evidence source.
- Stakeholder validation view showing represented, underrepresented, and intentionally excluded groups.
- Review queue ranked by materiality, method effect, confidence effect, and participant burden.
- Backend status showing whether rows are loaded from Supabase or demo fallback.

Required states:

- Loading: show demo rows first, then announce Supabase hydration status.
- Empty: keep model guidance visible and explain which Supabase project has no rows.
- Error: preserve demo rows and show the failed backend read state.
- Incomplete data: block valuation and publication for outcomes without sufficient evidence or stakeholder validation.
