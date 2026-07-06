# Design Review Process

## 1. Product Fit

- Which user role is this for?
- Which decision question does the screen answer?
- What SROI step or portfolio workflow does it support?
- What evidence, assumptions, and confidence are required?

## 2. Pattern Fit

- Is there an existing component or page pattern?
- Does the design use current tokens?
- Are loading, empty, error, and incomplete-data states covered?
- Is terminology consistent with the content style guide?

## 3. Trust Review

- Can a result be traced to approved evidence?
- Are AI suggestions labeled and reviewable?
- Are harms, exclusions, and negative outcomes visible?
- Are SDG claims limited by the approved evidence level?
- Are benchmark limitations and comparability visible?

## 4. Accessibility Review

- Keyboard-only operation works.
- Focus order follows the visual and task order.
- Charts have text and table alternatives.
- Color is not the only status signal.
- The page works at 1440, 1280, 768, 390, and 360 widths.

## 5. Automated Gate

Run:

```bash
pnpm quality
```

Review the generated markdown report and screenshots in `artifacts/design-audit/latest`.

