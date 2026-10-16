---
'@envsemble/envui': major
---

Buttons take a `variant` for their emphasis and a `tone` for their meaning. `variant` is `primary`, `secondary`, `outline`, `ghost` or `text`, and `tone` is `neutral`, the default, `accent` or `danger`, in the designed pairs: a primary button takes any tone, outline, ghost and text buttons take neutral or danger, and a secondary button is neutral. This applies to Button, IconButton, ConfirmButton, CopyButton, DialogClose, ThemeToggle and Pagination.

- `variant="important"` is `variant="primary" tone="accent"`, with the same square corners and fill.
- `variant="destructive"` is `variant="primary" tone="danger"`.
- `variant="outlined"` is `variant="outline"`, and `variant="quiet"` is `variant="ghost"`.
- New: outline, ghost and text buttons in the danger tone, which take the danger color; `fullWidth`, which makes a labelled button as wide as its container; and `ButtonTone` and `ButtonEmphasisProps`.
- A Button or IconButton without a `variant` takes the one its container gives, such as `ghost` inside a Toolbar, and else primary (secondary for IconButton).
- The modifier classes become attributes on `.env-button`: `env-button-primary` is `[data-variant='primary'][data-tone='neutral']`, `env-button-important` `[data-variant='primary'][data-tone='accent']`, `env-button-destructive` `[data-variant='primary'][data-tone='danger']`, `env-button-secondary` `[data-variant='secondary']`, `env-button-outlined` `[data-variant='outline']`, `env-button-text` `[data-variant='text']`, `env-button-quiet` `[data-variant='ghost']` and `env-button-underlined` `[data-underline]`.

Migrate with the codemods: `envui-codemods v1-props` rewrites each literal `variant` (an expression is reported), and `envui-codemods v1-classes` rewrites the classes in style sheets and selector strings with the specificity they had, and reports them in `className`, where the props set them now.
