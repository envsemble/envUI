---
'@envsemble/envui': major
'@envsemble/envui-codemods': major
---

IconButton is the one icon-only button, and the one close button.

- CloseButton and `CloseButtonProps` are gone: a close, dismiss or remove button is an IconButton with `variant="ghost"`, `icon={<Close />}` and an `aria-label` in the application's language, as the Button page's close and remove section shows. Dialog, Sheet, Panes, Alert, Toast, Combobox, DocumentTabs and PanelDock render theirs that way. The small ones, Alert's and Toast's dismiss, Combobox's chip remove, and DocumentTabs' and PanelDock's tab close, keep CloseButton's touch-size hit area under a coarse pointer through IconButton's new hook `--env-icon-button-hit-area`, which they set to the touch size; Dialog's, Sheet's and Panes' close buttons are full size and need none. An application's own small close button sets the hook to keep the hit area. The part class `env-close-button` goes, and so does `messages.common.close`, which only CloseButton read.
- `Button iconOnly` is gone: `<IconButton icon aria-label>` replaces it, and takes `href` for an icon-only link.
- `v1-structure` rewrites `<CloseButton>` into the IconButton, importing `Close` from `@envsemble/envui/icons/Close`, and writes `aria-label="Close"` where it had no name, which it reports to translate. It rewrites `<Button iconOnly>` into `<IconButton>`, reporting those without a `variant`, which were primary where IconButton is secondary, and those that set `fullWidth`, `underline` or a `tone` without a `variant`, which IconButton doesn't take; a structure case's `reportProps` reports such props. `v1-classes` reports `env-close-button`. A structure case can now add a component imported from another module, such as an icon.

Migration guide: [Folded components and patterns](https://github.com/envsemble/envUI/blob/main/docs/migration.md).
