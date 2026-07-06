# Accessibility Standard

ImpactPulse targets WCAG 2.2 AA as the product baseline.

## Required

- Logical heading order.
- Named landmarks for header, navigation, main content, complementary panels, and footer when present.
- Visible focus indicator on all interactive elements.
- Keyboard access for navigation, panels, dialogs, tabs, segmented controls, and forms.
- Form controls with persistent labels and useful help text.
- Error text that identifies the field, cause, and next action.
- Text contrast of at least 4.5:1 for normal text and 3:1 for large text.
- Non-text contrast of at least 3:1 for meaningful controls and chart marks.
- Charts with accessible names, descriptions, and table alternatives.
- Motion that respects `prefers-reduced-motion`.
- Responsive layouts that do not require horizontal page scrolling at 360px wide.

## Cognitive Accessibility

- Explain technical SROI terms near the point of use.
- Use plain-language summaries before detailed methodology.
- Keep primary actions stable.
- Make incomplete data explicit.
- Use progressive disclosure instead of dense forms.

## Audit Gate

`pnpm quality` must run before UI work is considered ready. It captures screenshots, checks responsive overflow, and runs accessibility checks. Critical failures block release.

