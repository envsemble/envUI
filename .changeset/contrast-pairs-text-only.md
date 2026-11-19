---
'@envsemble/stylelint-config-envui': minor
---

`no-contrast-breaking-pairs` reports a `var(--env-color-fg-…)` token as a whole background only in a rule that also sets `color`, the sign that text sits on it. A shape with no text, such as a status dot, a separator or a sparkline bar filled with `var(--env-color-fg-success)` to match the text beside it, passes. See [no-contrast-breaking-pairs](https://github.com/envsemble/envUI/tree/main/packages/stylelint-config#envuino-contrast-breaking-pairs).
