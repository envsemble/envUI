---
'@envsemble/envui': minor
---

New: `EnvUIProvider`, `Toolbar`, `Field` and `CloseButton`.

- `EnvUIProvider` sets the `locale` envUI formats in, overrides of its built-in English strings through `messages`, per namespace, and the text direction for keyboard and placement logic through `dir`. envUI works without it. `useLocale()` returns the provider's locale, and `@envsemble/envui/messages` exports `defaultMessages`, every namespace and key with its English default. ConfirmButton, CopyButton, Dialog's close button and ThemeToggle read their strings from it; ThemeToggle takes an `aria-label` of its own too.
- `Toolbar.Root`, `Toolbar.Group`, `Toolbar.Separator`, `Toolbar.Button` and `Toolbar.Link`: a row or column of controls for one subject, one tab stop moved through with the arrow keys, on Base UI's Toolbar. Its buttons are icon-only, named by their label in a tooltip with their shortcut, and take `pressed` for a toggle; buttons inside take the ghost variant.
- `Field.Root`, `Field.Label`, `Field.Control`, `Field.Description` and `Field.Error`: the parts of a labelled field for a control envUI has no field for, on Base UI's Field, with the outlined control look.
- `CloseButton`: the ghost icon button that closes, dismisses or removes what it sits in, named Close in the provider's language, with a touch-size hit area under a coarse pointer.
