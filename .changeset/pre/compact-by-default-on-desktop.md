---
'@envsemble/envui': minor
---

The app scale defaults to `system`, a third value of `ThemeScale`: compact where the primary pointer is fine, such as a mouse or trackpad, and comfortable on touch. The stylesheet decides with `@media (pointer: fine)`, so a server render and the first paint already have the scale and nothing changes as the page hydrates. A `Theme` or `ThemePreferenceProvider` outside any Theme takes `system`, and `useTheme().scale` returns it; Theme writes `data-env-scale="system"`, and a root without a `data-env-scale` is `system` too. An explicit `scale="comfortable"` or `scale="compact"` wins on every pointer, and nested Themes and popups keep their boundary's scale as before. `createThemeBootstrapScript` takes `scale: 'comfortable'` as well as `'compact'`, and writes either to the root before the first paint; `system`, its default, writes nothing.

**Migration:** an app that wants the comfortable sizes with a mouse too sets `scale="comfortable"` on its root `Theme` or `ThemePreferenceProvider`, and passes `scale: 'comfortable'` to `createThemeBootstrapScript` if it renders on the server ([Spacing & density](https://github.com/envsemble/envUI/blob/main/docs/foundations/spacing.md)).
