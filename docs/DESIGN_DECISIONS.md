# Design Decisions

## 2026-07-06: Start With a Framework-Free Prototype

Decision:

Use static HTML, CSS, and JavaScript for the first pass.

Reason:

The GitHub repository was empty. A framework-free baseline lets the team review product language, information architecture, tokens, visual rules, and automated QA before committing to a heavier frontend architecture.

Consequence:

The app is easy to inspect and run. Future work can migrate the same tokens and page specifications into React, Vue, Svelte, or another stack if needed.

## 2026-07-06: Pilot the SROI Results Page

Decision:

Use SROI Results as the first representative page.

Reason:

It exercises the core ImpactPulse promise: evidence, assumptions, social value, confidence, sensitivity, SDG claims, and decision readiness. It also reveals whether the design system can hold analytical depth without becoming crowded.

## 2026-07-06: Tokenize Before Expanding Components

Decision:

Centralize color, type, spacing, widths, radii, borders, shadows, motion, breakpoints, chart semantics, and status semantics before building additional pages.

Reason:

The master brief requires consistent improvement over time and prohibits arbitrary visual variation.

## 2026-07-06: Use Custom Visual QA Instead of a UI Library

Decision:

Add a Playwright audit script for screenshots, overflow checks, major layout checks, and accessibility checks.

Reason:

The first pass needs an enforceable design-review loop more than a component library. No paid dependency or UI kit is justified yet.

## 2026-07-06: Add Evidence Review Queue as Second Page

Decision:

Build `/evidence/` before adding another results or dashboard page.

Reason:

Evidence review is the trust layer for SROI results, assumptions, SDG target claims, benchmark eligibility, reports, and assurance readiness. The page makes source quality, extracted claims, unresolved gaps, conflicts, and downstream effects visible before users approve or publish analytical outputs.

## 2026-07-06: Move to a Route-Driven Prototype Spine

Decision:

Use a lightweight JavaScript route renderer for the full prototype spine instead of adding a frontend framework immediately.

Reason:

The product needs shared route definitions, demo data, reusable layout patterns, and audit coverage across the full journey. The current prototype can support that without adding React, Vue, Svelte, or a build system yet.

Consequence:

Routes can now be expanded consistently from `src/app.js`, and the audit workflow covers the whole spine. A framework can still be introduced later if state, component reuse, or data-fetching complexity makes the lightweight renderer too limiting.

## 2026-07-07: Build Data Quality Before More Dashboards

Decision:

Make `/data-quality/` the next full product screen after Evidence Review Queue.

Reason:

ImpactPulse depends on trust gates before results, SDG claims, reports, benchmarks, and assurance packages can be used. Data Quality turns evidence gaps and conflicts into sufficiency scores, treatments, owners, and allowed/blocked product claims.

## 2026-07-07: Adopt Supabase as the Backend Spine

Decision:

Use Supabase Postgres, Auth, Storage, and Row Level Security as the planned backend foundation for ImpactPulse.

Reason:

The product requires organization-scoped workspaces, evidence uploads, reviewer roles, transparent lineage, audit trails, SROI calculation records, report snapshots, and tenant-safe collaboration. Supabase gives the prototype a real Postgres/RLS path without forcing a custom backend before the domain model stabilizes.

Consequence:

The repository now includes an RLS-first Supabase migration, deterministic seed data, env-safe local config, and a narrow read adapter. Browser writes remain disabled until authentication, membership onboarding, and reviewer workflows are designed.

## 2026-07-07: Hydrate Outcomes Before Enabling Writes

Decision:

Make `/outcomes/` the first Supabase-aware page, using demo data first and then read-only Supabase hydration when configured.

Reason:

Outcomes sit upstream of valuation, SROI, SDG claims, reports, and assurance. Proving the outcome model against a real backend gives the product a useful data contract while preserving the deterministic prototype review loop.

Consequence:

The current static renderer stays in place. A frontend framework or `@supabase/supabase-js` should be introduced only when auth, writes, subscriptions, or larger data-fetching complexity justify the build-system change.
