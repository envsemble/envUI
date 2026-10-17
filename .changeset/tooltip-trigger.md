---
'@envsemble/envui': minor
---

A Tooltip can name or describe the icon-only trigger of a menu or popover.

- Tooltip passes its native props and `ref` on to its control, as a Menu.Root's, Popover's or Dialog's `trigger` gives them: the press handler, `aria-haspopup`, `aria-expanded`, `aria-controls` and the ref reach the button. Wrapped around a Menu.Root, Popover or another component with a `trigger`, the Tooltip goes to that trigger.
- While the control's menu or popover is open, the tooltip stays closed, so Esc closes the menu or popover first and focus returns to the control.
- `popupClassName` adds a class to the tooltip's popup, which no longer takes the Tooltip's `className`, `style`, `ref` or data attributes.
