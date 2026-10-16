---
'@envsemble/envui': major
---

`Theme` and `ThemePreferenceProvider` take a `contrast`: `high` for the high-contrast colors, `standard` to keep the standard ones even when the system asks for more contrast, or `system` to follow `prefers-contrast: more`. Left out, a Theme takes the contrast of the Theme around it, and `system` outside any. Nested Themes and envUI's popups, such as menus, Select lists, tooltips, toasts and dialogs, keep the contrast of the boundary they open from, as they keep its color scheme. With `applyToDocument`, the provider writes the contrast on the document root too.

`useTheme()` returns `{ theme, contrast }` instead of the color scheme alone: read the scheme as `const { theme } = useTheme()`, and re-theme an application's own portal with `<Theme {...useTheme()}>`.
