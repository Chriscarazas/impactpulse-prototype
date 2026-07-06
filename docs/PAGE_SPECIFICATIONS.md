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

## Pilot Page: SROI Results

Route: `/`

Primary role:

- Impact advisor, evaluator, analyst, executive reviewer

Primary questions:

- What social value may have been created?
- What evidence do we have?
- What assumptions are we making?
- How confident should we be?
- What decision should happen next?

Required content:

- Persistent project header with project name, lifecycle state, reporting period, location, readiness, collaborators, and last approved version.
- Ten-step SROI rail with the active SROI step visible.
- Headline SROI result with range, confidence, analysis type, investment, social value, NPV, payback, and probability SROI exceeds 1.
- Evidence coverage and quality label beside the headline result.
- Gross-to-net value bridge showing investment, gross value, deadweight, attribution, displacement, drop-off, and net social value.
- Stakeholder and outcome distribution.
- Sensitivity summary with the most influential assumptions.
- Assumption register preview with value, source, confidence, and approval state.
- SDG target claims with claim ladder, confidence, trade-offs, reviewer, and approval status.
- Decision recommendation and next actions.
- "Challenge this analysis" action before approval.

Required states:

- Loading: skeleton structure for headline, chart, table, and actions.
- Empty: no approved outcomes or valuation proxies yet, with next data task.
- Error: calculation cannot run, showing blocking missing inputs.
- Incomplete data: result visible only as draft, with evidence gaps and no publish action.

## Next Page Candidate: Evidence Review Queue

Reason:

- It is the upstream source of trust for SROI Results.
- It exercises source provenance, data quality, conflicts, evidence gaps, review states, AI suggestions, and assignment flows.
- It should become the next pilot after the SROI Results page because defects in evidence review weaken every downstream claim.

