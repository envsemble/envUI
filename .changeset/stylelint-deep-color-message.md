---
'@envsemble/stylelint-config-envui': patch
---

A raw color whose `var()` fallbacks nest nine levels deep or more is named whole in the message, such as `rgb(var(--a, var(--b, …)))`, rather than by its first characters, `rgb(var`.
