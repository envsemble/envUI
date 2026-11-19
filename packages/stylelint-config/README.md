# @envsemble/stylelint-config-envui

A Stylelint config for applications built with envUI. Each rule reports a value that skips envUI's tokens, and its message says what to write instead. Every rule is an error. The [ESLint plugin](https://github.com/envsemble/envUI/tree/main/packages/eslint-plugin) does the same for components and inline styles.

## Install

Install the version of `@envsemble/envui` you use; the rules know that release's tokens. It needs Stylelint 17 or 18.

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

It extends nothing, so it goes after the application's base config. The file that defines the application's own palette turns the color rules off by file:

```js
export default {
  extends: ['@envsemble/stylelint-config-envui'],
  overrides: [{ files: ['src/styles/brand.css'], rules: { 'color-no-hex': null } }],
};
```

envUI's part classes (`env-<component>-<part>`), state attributes (`data-*`) and public colour properties, listed in the package's `docs/generated/parts.json`, are the styling contract; selecting and setting them passes.

## Rules

### Raw colors

`color-no-hex`, `color-named` and `declaration-property-value-disallowed-list` (color functions whose channels aren't custom properties; the pattern is exported as `rawColorFunction`).

```text
Raw color oklch(0.6 0.15 250) in background: use an envUI color token instead, such as var(--env-color-bg-default) or another var(--env-color-bg-…) role, so the color follows the theme and keeps its contrast.
```

### Stacking order

`declaration-property-value-allowed-list` allows `z-index` only from a custom property, such as `var(--env-z-modal)` or `calc(var(--env-z-sticky) + 1)`, or a keyword (exported as `stackingValues`).

```text
Literal z-index 999: use an envUI stacking token (--env-z-…) instead, such as var(--env-z-sticky) for a sticky header or var(--env-z-modal) for a modal layer, with calc() for a step between two, so the application's layers keep one order with envUI's popups and dialogs.
```

### envui/no-px

px outside hairline properties (border and outline widths, shadows, focus-ring offsets; exported as `hairlineProperties`) and outside `var()` fallbacks and `env()`. A position offset of 1px or less, in `inset*`, `top`, `right`, `bottom` or `left`, passes too, such as `top: -1px` to overlap a border. `--fix` writes rem at a 16px root, except for 1px or less.

```text
24px: write 1.5rem instead, so the size follows the reader's font size; px is only for hairlines: border and outline widths, focus-ring offsets and shadow offsets.
```

### envui/no-off-scale-values

A rem or px length in `gap`, `padding*`, `margin*` or `border-*radius`; `0`, `auto`, a hairline of 1px or less, such as `margin: -1px` to overlap borders, other units, calculations with another unit or a token pass. Positions such as `inset*` and sizes such as `inline-size` aren't checked. A radius past the largest step points to `var(--env-radius-full)`.

```text
0.5rem in gap: write var(--env-space-2) instead, envUI's spacing step of that size.
```

### envui/no-unknown-custom-properties

An `--env-*` name, used or set, that isn't one of envUI's tokens or public properties ([`src/data/customProperties.json`](src/data/customProperties.json)).

```text
--env-color-fg-defualt is not an envUI token or public property: write var(--env-color-fg-default) instead.
```

### envui/no-contrast-breaking-pairs

In one rule, a text color for a fill, such as `var(--env-color-fg-on-emphasis)`, on a background that isn't one of those fills; a `var(--env-color-fg-…)` token as a whole background in a rule that also sets a text property, `color`, `font…`, `line-height` or `text-…`, the sign that text sits on it, unless it sets a mask, or a `var(--env-color-bg-…)` token as a whole `color`. A shape with no text that matches the text beside it, such as a status dot or a separator filled with `var(--env-color-fg-muted)`, passes.

```text
--env-color-fg-on-emphasis is made for the emphasis fills, not --env-color-bg-default: write one of the emphasis fills, such as var(--env-color-bg-accent-emphasis), or a text color made for --env-color-bg-default.
```

### envui/no-focus-outline-removal

`outline: none`, `outline: 0` or `outline-style: none` on a `:focus-visible` element when nothing in the style sheet draws another ring.

```text
outline: none on :focus-visible removes the focus ring: leave envUI's focus ring, or draw another ring, such as box-shadow: 0 0 0 2px var(--env-color-border-focus).
```

## Development

```sh
npm test --workspace @envsemble/stylelint-config-envui
npm run tokens:build    # rewrites src/data from the token list, the handwritten tokens and parts.json
```
