---
'@envsemble/envui': minor
'@envsemble/eslint-plugin-envui': minor
'@envsemble/stylelint-config-envui': minor
---

Themes take two settings for their look besides color and scale, on `Theme`, in the theme `ThemePreferenceProvider` takes, and from `useTheme()`. Each boundary writes them as `data-env-selection` and `data-env-corners`, nested Themes and popups keep them, and they work through the tokens, so every component follows:

- `selection`: `'neutral'`, the default, or `'accent'`. **The selection is neutral by default now**: `--env-color-bg-selected`, `-hover` and `-pressed` are a gray deeper than the surfaces in every theme and contrast, and `--env-color-fg-on-selected` is the default text color. The blue selection is `selection="accent"`, and its values are the new tokens `--env-color-bg-selected-accent`, `-accent-hover`, `-accent-pressed` and `--env-color-fg-on-selected-accent`. An application that overrode the four selection tokens to make them neutral can drop that.
- `corners`: `'sharp'`, `'rounded'`, the default, or `'round'`. Sharp corners are near square, `--env-radius-full` included; round ones are larger. Parts that are always circles stay circles.

`--env-icon-size` is a public token again, the size of the icons in a place: 1 rem at the root, and a component that sizes its icons, such as a button or a navigation item, sets it on its own element, so content can line up with it.

A Badge, a count or a DiffStat inside a Button keeps its own colors: the button no longer recolors its content.

Breaking changes:

- **One theme definition.** `defineTheme({ storageKey, defaultPreference, contrast, scale, selection, corners })` defines an application's theme once, and both `<ThemePreferenceProvider theme={theme}>` and `createThemeBootstrapScript(theme)` take it, so the first paint and the application can't drift apart. ThemePreferenceProvider's `storageKey`, `defaultPreference`, `contrast` and `scale` props are gone: write `<ThemePreferenceProvider theme={defineTheme({ storageKey: 'app-theme', scale: 'compact' })}>` instead of `<ThemePreferenceProvider storageKey="app-theme" scale="compact">`. The bootstrap script now also writes the selection and corners to the root before the first paint.
- `ThemeBootstrapOptions` is renamed `ThemeDefinition`.
- The selection tokens are neutral by default, as above; write `selection: 'accent'` for the blue selection.
- The button's label, icons and end are each wrapped in a part of their own, `env-button-label`, `env-button-start-icon`, `env-button-end-icon` and `env-button-end`, which only place what they hold. A label is one line of text in its own part, so a badge in it sits in the line, a word space after the text, rather than the button's gap away.

See [Setup](https://github.com/envsemble/envUI/blob/main/docs/setup.md#theme-preference).
