---
'@envsemble/envui': minor
---

A Tooltip can name or describe the icon-only trigger of a menu or popover.

- Tooltip passes its native props and `ref` on to its control, as a Menu.Root's, Popover's, Dialog's, Drawer's or ConfirmDialog's `trigger` gives them: the press handler, `aria-haspopup`, `aria-expanded`, `aria-controls` and the ref reach the button. Wrapped around one of those five, the Tooltip goes to their `trigger`; around any other component it describes that component.
- While the control's menu or popover is open, the tooltip stays closed, so Esc closes the menu or popover first. When it closes and focus returns to the control, the tooltip stays closed until the pointer enters the control or a key is pressed, so one Esc is enough.
- Around a HoverCard, or as its `trigger`, a Tooltip shows no tooltip, and says so while developing.
- A Tooltip whose child is text, a Fragment or a component that doesn't pass the ref on says so while developing, where it crashed or showed nothing.
- `popupClassName` adds a class to the tooltip's popup, which no longer takes the Tooltip's `className`, `style`, `ref` or data attributes: they go to the control, whose own `id` wins over the Tooltip's.
