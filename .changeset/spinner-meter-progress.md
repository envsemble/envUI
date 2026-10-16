---
'@envsemble/envui': major
---

Spinner, Meter and Progress take the 1.0 sizes and classes, and read their values right.

- Spinner's `size` is `sm`, `md` (the default) or `lg`, set as `data-size` where the class `env-spinner-{size}` was. Its drawing is hidden from assistive technology also when it has a label.
- Meter and Progress emit their own classes, `env-meter*` and `env-progress*`, where both emitted `env-bar*`, and take `className`, `style`, `ref` and data attributes on their root. Without `aria-valuetext` the formatted value stays, in the provider's locale; an indeterminate Progress is read as Loading, and its sweep runs toward the end of the line in right-to-left text.
- New: Progress `segments`, which splits the track into steps that fill in turn.
- LoadingState's name defaults to `messages.common.loading`.

Migrate with the codemods: `envui-codemods v1-props` maps Spinner's `size`; `v1-classes` renames `env-bar` to `env-meter` and the Spinner size classes; rename a Progress's `env-bar` selectors to `env-progress` by hand.
