---
'@envsemble/envui': patch
---

Links keep 4.5:1 on tints, and toast labels on their hover and press fills.

- The new `--env-color-fg-link-on-tint` tokens, with `-hover` and `-pressed`, are the link colors for a tint, where `--env-color-fg-link` falls below 4.5:1 in the light theme: alerts, list rows under the pointer or pressed and unselected interactive table rows under the pointer or holding focus point the link tokens at them, so links and text buttons there stay readable. Links an application puts on `--env-color-bg-brand-muted` take them too.
- The hover and pressed fills of success and information toasts are a grade darker, so white text on them keeps 4.5:1, as on the toast itself.
