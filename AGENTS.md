# AGENTS.md

This repository is the working product and design-system foundation for ImpactPulse.

## Operating Principles

- Preserve existing product behavior and visual identity before adding new patterns.
- Read `docs/PRODUCT_VISION.md`, `docs/DESIGN_CONSTITUTION.md`, and `docs/DESIGN_DECISIONS.md` before significant interface work.
- Search for an existing component, token, page pattern, or documented rule before creating a new one.
- Use centralized design tokens from `src/styles/tokens.css` and `src/design-tokens.json`.
- Keep every screen tied to ImpactPulse's decision questions: change, people affected, evidence, assumptions, value, confidence, and next decision.
- Prefer calm analytical hierarchy over decorative dashboards.
- Do not add a new UI library, charting library, framework, or paid dependency without documenting the reason in `docs/DESIGN_DECISIONS.md`.

## Before Changing UI

1. Identify the target page, user role, and decision question.
2. Inspect nearby patterns and reusable components.
3. Confirm the relevant page specification in `docs/PAGE_SPECIFICATIONS.md`.
4. Check accessibility requirements in `docs/ACCESSIBILITY_STANDARD.md`.
5. Use tokens for color, spacing, typography, radius, shadow, motion, charts, and statuses.
6. Include loading, empty, error, and incomplete-data states when the component can encounter them.
7. Verify keyboard behavior and mobile layout.
8. Run `pnpm quality` before claiming the change is ready.

## Component Governance

- Extend existing patterns when the semantics match.
- Create a new component only when the existing pattern would make the product less clear, less accessible, or less maintainable.
- Name components by user purpose, not visual appearance.
- Document genuinely new interaction or data-display patterns in `docs/DESIGN_DECISIONS.md`.
- Avoid arbitrary one-off CSS values. Add a token when a value is expected to recur.

## Accessibility Gate

- Pages need a logical heading order, named landmarks, visible focus states, accessible form labels, and non-color-only status communication.
- Charts require text summaries, direct labels, and data alternatives.
- Workflow-critical actions must be reachable and understandable by keyboard and screen reader users.

## Review Standard

Every review should ask:

- Can a new user tell whether they are reviewing the Impact Account, method context, or a specific workflow step within five seconds?
- Can any value claim be traced to evidence, assumptions, and methodological eligibility?
- Is confidence or uncertainty visible beside the result?
- Are harms, excluded groups, and weak evidence surfaced near claims?
- Does the page state the next recommended decision or action?

