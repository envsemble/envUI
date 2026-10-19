---
'@envsemble/envui': major
---

CommandPalette is built on Base UI's autocomplete and announces its results.

- `query`, `onQueryChange`, `onSelect` and `closeOnSelect` are `inputValue`, `onInputValueChange`, `onAction` and `closeOnAction`; `CommandPaletteSelectOptions` is `CommandPaletteActionOptions`.
- An item's `detail` and `trailing` are `description` and `end`, and an item can be `disabled`. Options are list rows, with the description under the label.
- A polite status announces the number of results as they change (`messages.commandPalette.results`) and says the empty message when nothing matches.
- `className`, `style`, `ref` and data attributes reach the palette's surface.

Migrate with the codemods: `envui-codemods v1-props` renames the props and `v1-names` the type. Rename the items' `detail` and `trailing` by hand; the type checker reports them where the array is typed.

Migration guide: [Overlays and feedback](https://github.com/envsemble/envUI/blob/main/docs/migration.md#overlays-and-feedback).
