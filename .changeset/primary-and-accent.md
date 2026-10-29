---
'@envsemble/envui': major
---

The color roles are named for one meaning each: the blues are primary, and the purple is accent.

- Tokens: the blue `--env-color-bg-brand-*` and `--env-color-bg-accent-*` are `--env-color-bg-primary-*`, `--env-color-fg-accent` is `--env-color-fg-primary` and `--env-color-border-accent-*` is `--env-color-border-primary-*`. The solid accent badge fill is `--env-color-bg-primary-solid` and its soft tint `--env-color-bg-primary-soft`; `--env-color-bg-brand-muted` is `--env-color-bg-primary-muted`, the info alerts' tint. The purple `--env-color-bg-important-strong` is `--env-color-bg-accent-strong`, and `--env-color-fg-accent`, `--env-color-bg-accent-soft`, `-muted`, `-subtle` and `-solid` and `--env-color-border-accent` are its new purple tones.
- Badge takes `tone="primary"`, the blue that `tone="accent"` was; `tone="accent"` is purple now, as Button's accent tone is. CalendarHeatmap's default tone is `primary`, the same blue, and it takes `accent` too.
