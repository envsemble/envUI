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

Colors come from envUI's semantic color tokens, so they follow the theme and keep their contrast in light, dark and high contrast: text colors such as `var(--env-color-fg-default)`, backgrounds such as `var(--env-color-bg-default)` and boundaries such as `var(--env-color-border-default)`. Where the property says which, the message suggests that family, such as `var(--color-bg-…)` for `background`.

- `color-no-hex` reports hex colors.
- `color-named` reports named colors such as `red`.
- `declaration-property-value-disallowed-list` reports color functions with a channel that is not a custom property: `rgb()`, `hsl()`, `hwb()`, `lab()`, `lch()`, `oklab()`, `oklch()` and `color()`. A relative color derived from a token, `hsl(from var(--env-color-fg-link) h s calc(l - 10))`, passes, as does `color-mix()` of tokens, and so does a function whose channels all come from custom properties, each channel a `var()` whose fallback, if any, is `var()`s too, whose own fallbacks are `var()`s in turn, as in `rgb(var(--…, var(--…, var(--…))))`, up to eight levels of fallbacks deep, as the ESLint plugin's `no-raw-colors` reads them, with or without an alpha after the `/` or as the last of two or four comma-separated arguments that is a literal number or percentage, or one `var()` whose fallbacks are `var()`s as a channel's are, `rgb(var(--…) / 50%)` and `rgba(var(--…), var(--…))` alike, and one `var()` that holds all three channels, `rgb(var(--…))`. Any other channel is reported: a number, `none`, `calc(255)` or a fallback such as `var(--…, 255 0 0)`, and so is any other alpha, such as `none` or `calc(1 - var(--…))`, and so are fallbacks nested nine levels deep or more, which `no-raw-colors` reports too. `color-no-hex` and `color-named` report hex and named colors in a `var()` fallback too. Colors inside `url()`, such as those a data URL's image spells, and inside strings, such as `content: "rgb(1 2 3)"`, pass too. This rule takes one list of options. Its pattern is exported as `rawColorFunction`.

Custom properties are checked too, including inline overrides of envUI's own tokens.

The token names in the messages come from [`data/tokens.json`](data/tokens.json). Before every pack, `scripts/SyncTokens.mjs` rewrites it from the library's generated token list (`packages/ui/src/generated/tokens.json` in the envUI repository), so a release names the tokens of the same envUI release, and the tests fail when a message or this README names a token that does not exist.

### Stacking order

`declaration-property-value-allowed-list` allows `z-index` only as `auto`, a global keyword such as `inherit`, or a custom property (`var(--…)`, also inside `calc()`); the list is exported as `stackingValues`. envUI has no stacking tokens yet, so until it has, keep an application's few z-index values in documented custom properties of its own, such as `var(--app-z-header)`, and the order of its layers stays in one place. Once a release has stacking tokens, the message names them. This rule takes one list of options.

### Units

`unit-disallowed-list` reports `px` outside hairlines, mirroring envUI's own style sheets. Type, spacing, control and row heights, icon sizes, radii and media queries use `rem`, so they follow the reader's font size. `px` stays for what must not scale:

- border, outline and column-rule widths and the outline offset, but not radii or `border-spacing`;
- `box-shadow`, `text-shadow`, `filter` and `backdrop-filter` offsets and blurs;
- SVG `stroke-width`;
- `text-decoration-thickness` and `text-underline-offset`;
- custom properties whose name ends in one of them: `--…-border-width`, `--…-ring-offset`, `--…-shadow` or `--…-hairline`, such as `--card-border-width` or `--focus-ring-offset`. A `--card-border-radius` takes rem.

Values inside `env()` and custom property fallbacks in `var()` are in CSS pixels and pass. This rule takes one list of options. The list of properties where px passes is exported as `hairlineProperties`, for a config that sets `unit-disallowed-list` itself; envUI's own style sheets are linted with the same list. The root font size is the reader's: don't set it on `html`.

## Development

Run from the envUI repository root:

```sh
npm test --workspace @envsemble/stylelint-config-envui
```

The root `npm test` runs these tests too. envUI's own style sheets select its classes and define its tokens, so the repository lints them with its own config rather than this one.
