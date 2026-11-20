---
'@envsemble/envui': major
---

ThemePreferenceProvider leaves where the theme preference is kept to the application: it takes `preference`, `defaultPreference` and `onPreferenceChange`, so an application keeps the choice in a cookie, so a server-rendered page matches it, or in the user's account, so it follows them across devices. The provider no longer reads or writes localStorage. `@envsemble/envui/theme-storage` keeps it in localStorage for an application that wants that: `useStoredThemePreference` returns the props to spread on the provider and follows a choice made in another tab, and `createStoredThemeBootstrapScript` reads it before the first paint. See [Setup](https://github.com/envsemble/envUI/blob/main/docs/setup.md#theme-preference).

Breaking changes:

- ThemePreferenceProvider no longer stores the preference. To keep it in localStorage as before, write `const storedTheme = useStoredThemePreference({ storageKey: 'app-theme' })` and `<ThemePreferenceProvider theme={theme} {...storedTheme}>`, with `useStoredThemePreference` from `@envsemble/envui/theme-storage`; to keep it elsewhere, pass `preference` and `onPreferenceChange`.
- `ThemeDefinition` and `defineTheme` no longer take `storageKey` and `defaultPreference`. Pass the storage key to `useStoredThemePreference` and `createStoredThemeBootstrapScript` as `{ storageKey }`, and the default as ThemePreferenceProvider's `defaultPreference` prop or the storage options' `defaultPreference`.
- `createThemeBootstrapScript` no longer reads localStorage: it paints the preference given as `createThemeBootstrapScript(theme, { preference })`, or the system theme. For the stored preference, write `createStoredThemeBootstrapScript(theme, { storageKey })` from `@envsemble/envui/theme-storage` in its place.
