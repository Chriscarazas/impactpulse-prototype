# ImpactPulse Prototype

ImpactPulse is a social-impact measurement and SROI decision platform. This prototype now has a route-driven product spine: governance docs, design-system tokens, shared demo data, representative SROI and evidence screens, Upload-to-First-Insight, and automated visual/accessibility review.

## Current Stack

- Route-driven static HTML, CSS, and JavaScript
- CSS custom properties for design tokens
- Node static server for local preview
- Playwright-based design audit for screenshots, responsive checks, and accessibility checks

No UI framework or paid dependency has been introduced. This keeps the first pass reviewable while the product architecture is still taking shape.

## Run Locally

```bash
pnpm install
pnpm start
```

Then open:

- `http://127.0.0.1:4173` for SROI Results
- `http://127.0.0.1:4173/quick-start/` for Upload to First Insight
- `http://127.0.0.1:4173/evidence/` for Evidence Review Queue

## Review Workflows

```bash
pnpm design:audit
pnpm test:visual
pnpm test:accessibility
pnpm quality
```

The audit starts the app, visits the route spine, captures screenshots at 1440x1000, 1280x800, 768x1024, 390x844, and 360x800, checks for page overflow and layout failures, runs accessibility checks, and writes artifacts under `artifacts/design-audit/latest`.

## Product Spine

Every page should help answer at least one of:

1. What are we trying to change?
2. Who experiences the change?
3. What evidence do we have?
4. What assumptions are we making?
5. What social value may have been created?
6. How confident should we be?
7. What decision should happen next?
