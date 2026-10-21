---
'@envsemble/envui': minor
---

`PortalContainer` renders the popups, menus, tooltips, dialogs, sheets and toasts inside it into another element than the document's body, such as one in a shadow root or an iframe's document. With `contained`, they are part of that element, as in a preview of an interface with its overlays open: a modal one neither locks the page's scroll, traps focus nor hides the rest of the page, none takes focus as it opens, a popup opens on its own side at its content's size, toasts are shown without the page's F6 shortcut, and a press or Esc elsewhere doesn't close them, while their trigger and their own controls do. Select and Tooltip take `defaultOpen`.

The component pages show overlays open in their figures: Dialog, ConfirmDialog, CommandPalette, Menu, Tooltip and Toast have anatomy figures, and their do and don't pairs show the open overlay; Select and Combobox show their open lists. A figure's fence takes the flag `open` for this, as `docs/component-pages.md` describes.
