---
'@envsemble/envui': major
---

Dialog's side panel is a new component, Drawer, and Dialog takes `width`.

- Drawer is a full-height panel at the `start` or `end` edge of the window (`side`, default `end`), which follows the text direction: it slides in from its edge, and closes with a swipe toward it on a touch screen. It takes Dialog's `title`, `description`, `actions`, `trigger`, `modal`, `disablePointerDismissal`, `pending`, `initialFocus` and `finalFocus`, and adds `aria-label` for a drawer without a visible title, `closeButton`, and `width`: `md` (24 rem, the default), `lg` (44 rem) or any CSS length. Its close button is a CloseButton. Opened by keyboard or mouse, focus starts on the first element inside that takes Tab; opened by touch, or with nothing inside that takes focus, on the drawer itself, so a field inside doesn't open the on-screen keyboard.
- Dialog's `placement` is `center` or `top`; `placement="right"` is `<Drawer side="end">`. Dialog's `size` is `width`: `standard` is `md`, the default, and `wide` is `lg`.
- `onOpenChange` of Dialog and Drawer receives the reason as its second argument, such as `escape-key` or `close-press`; `initialFocus` and `finalFocus` also take a function of the interaction. Dialog and DialogClose take `ref` as a prop.
- The dialog's surface class `env-modal-pane` is `env-dialog-popup`; a drawer's is `env-drawer-popup`, and both carry `env-dialog-surface`.

Migrate with the codemods: `envui-codemods v1-structure` turns a `<Dialog placement="right">` into a `<Drawer side="end">`, with its `size` as `width`, and reports a `placement` that is an expression; `v1-props` turns Dialog's `size` into `width`; `v1-classes` renames `env-modal-pane`.

Migration guide: [Overlays and feedback](../../docs/migration.md#overlays-and-feedback).
