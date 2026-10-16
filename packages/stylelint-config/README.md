# @envsemble/stylelint-config-envui

A Stylelint config for applications built with envUI. It reports style rules that select envUI's private markup, raw colors, literal stacking order, and px where the size should follow the reader's font size. Each message says what to use instead. The [ESLint plugin](../eslint-plugin/README.md) does the same for components, class names and inline styles.

## Install

The config is published to GitHub Packages with envUI, in the same `@envsemble` scope, and has the same version number. Install the same version as `@envsemble/envui`. It needs Stylelint 17.

```sh
npm install --save-dev --save-exact @envsemble/stylelint-config-envui@<the version of @envsemble/envui>
```

## Use

```js
// stylelint.config.js
export default {
  extends: ['stylelint-config-standard', '@envsemble/stylelint-config-envui'],
};
```

The config sets only the rules below and extends nothing, so it goes after whatever base config the application uses. It sets built-in rules that take a single list of options, as noted below; an application that sets one of them itself should put its own options after this config and include envUI's.

An application's own palette or brand colors belong in one file of custom properties; turn the color rules off there, as envUI does for its token file. Elsewhere, disable a rule on one line and say why:

```js
export default {
  extends: ['@envsemble/stylelint-config-envui'],
  overrides: [
    {
      files: ['src/styles/brand.css'],
      rules: {
        'color-no-hex': null,
        'color-named': null,
        'declaration-property-value-disallowed-list': null,
      },
    },
  ],
};
```

```css
/* stylelint-disable-next-line color-no-hex -- the logo keeps its brand color */
.logo {
  fill: #0b57d0;
}
```

## Rules

### envui/no-private-classes

envUI's markup and its `env-` class names are private: they change in any release, as the 1.0 renames change nearly all of them. `envui/no-private-classes`, a rule this package adds, reports selectors that target them: `.env-…` anywhere in a selector, including `:global(.env-dialog)`, `:has()`, `:not()` and nesting, attribute selectors on `class` such as `[class*="env-button"]`, and `@scope` boundaries. Use the component's props and envUI's tokens, or style a class of your own on your own element.

`.env-theme`, the theme boundary on which the setup guide has applications set envUI's tokens, is allowed, and so are the `data-env-theme` attributes. Option: `allow`, the envUI classes that may be selected; the config sets `['env-theme']`.

### Raw colors

Colors come from envUI's tokens, `var(--env-color-…)`, so they follow the theme and keep their contrast in light, dark and high contrast.

- `color-no-hex` reports hex colors.
- `color-named` reports named colors such as `red`.
- `declaration-property-value-disallowed-list` reports color functions with literal channels: `rgb()`, `hsl()`, `hwb()`, `lab()`, `lch()`, `oklab()`, `oklch()` and `color()`. A relative color derived from a token, `hsl(from var(--env-color-fg-link) h s calc(l - 10))`, passes, as does `color-mix()` of tokens. This rule takes one list of options.

Custom properties are checked too, including inline overrides of envUI's own tokens.

### Stacking order

`declaration-property-value-allowed-list` allows `z-index` only as `auto` or a custom property (`var(--…)`, also inside `calc()`), such as envUI's stacking tokens, `var(--env-z-…)`. Layers then keep one order with envUI's popups, dialogs and notifications. This rule takes one list of options.

### Units

`unit-disallowed-list` reports `px` outside hairlines, mirroring envUI's own style sheets. Type, spacing, control and row heights, icon sizes, radii and media queries use `rem`, so they follow the reader's font size. `px` stays for what must not scale:

- border, outline and column-rule widths, but not radii;
- `box-shadow`, `text-shadow` and `filter` offsets;
- `text-decoration-thickness` and `text-underline-offset`;
- custom properties named for them, such as `--card-border-width` or `--focus-ring-offset`.

Values inside `env()` and custom property fallbacks in `var()` are in CSS pixels and pass. This rule takes one list of options. The root font size is the reader's: don't set it on `html`.

## Development

Run from the envUI repository root:

```sh
npm test --workspace @envsemble/stylelint-config-envui
```

The root `npm test` runs these tests too. envUI's own style sheets select its classes and define its tokens, so the repository lints them with its own config rather than this one.
