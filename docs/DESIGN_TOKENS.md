# Design Tokens

Design tokens live in:

- `src/styles/tokens.css`
- `src/design-tokens.json`

Use CSS custom properties in production UI. Use the JSON file for tooling, audits, and future framework integrations.

## Token Categories

- Color roles
- Typography
- Spacing
- Widths
- Radii
- Borders
- Shadows
- Motion
- Responsive breakpoints
- Chart semantics
- Status semantics

## Rule

Do not introduce arbitrary values in page CSS. If a value must recur, add it to the token system and document the reason in `docs/DESIGN_DECISIONS.md`.

