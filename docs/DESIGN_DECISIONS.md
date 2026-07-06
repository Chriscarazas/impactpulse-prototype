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

