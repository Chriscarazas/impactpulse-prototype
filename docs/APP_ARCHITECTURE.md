# App Architecture

ImpactPulse now uses a lightweight route-driven prototype shell without introducing a frontend framework.

## Why This Architecture

The product needs a coherent route system, shared state, mock data, and reusable screen patterns before it needs a heavier framework. The current approach keeps the prototype easy to inspect while proving the full product spine.

## Files

- `index.html`: shared app shell for routed prototype views.
- `evidence/index.html`: static fallback shell for the evidence route.
- `src/app.js`: route definitions, demo data, shared renderers, view renderers, and interactions.
- `src/backend/supabase.js`: narrow Supabase read adapter for backend-aware prototype screens.
- `src/styles/tokens.css`: design tokens.
- `src/styles/app.css`: shared layout, component, and page styles.
- `scripts/design-audit.mjs`: route-aware screenshot, layout, and accessibility review.
- `supabase/migrations/`: RLS-first database schema.
- `supabase/seed.sql`: deterministic Workforce Pathways demo records.

## Route Spine

- `/`: SROI Results
- `/quick-start/`: Upload to First Insight
- `/evidence/`: Evidence Review Queue
- `/data-quality/`: Data Quality Overview
- `/outcomes/`: Outcomes and Indicators
- `/valuation/`: Financial Proxy Workspace
- `/assumptions/`: Assumptions Lab
- `/decision/`: Decision Room
- `/reports/`: Report Storyboard
- `/portfolio/`: Organization Impact Overview
- `/benchmarks/`: Benchmark Cohort Builder
- `/sdg/`: SDG Target Mapping
- `/assurance/`: Assurance Readiness

## Build Rule

Every route should use the same project evidence graph and demo data until a real backend exists. Do not create isolated mock numbers that contradict the workforce-development scenario.

## Backend Boundary

Supabase is the planned backend for organization-scoped records, evidence lineage, outcome models, assumptions, financial proxies, SROI runs, quality profiles, review tasks, reports, and audit events.

The current frontend renders from demo data first. Backend-aware screens may hydrate from Supabase after initial render, but must keep a demo fallback so audits and GitHub previews stay deterministic.

Runtime config is served from `/config.js` by `scripts/serve.mjs`. Only the Supabase URL, public anon key, schema, and demo project ID are exposed to the browser. Service-role keys must never be used in frontend code.

## When To Add a Framework

Add React, Vue, Svelte, or another framework only when the prototype needs state complexity, component composition, data fetching, authentication flows, or interaction depth that the current route renderer can no longer handle cleanly. Document the decision in `docs/DESIGN_DECISIONS.md`.
