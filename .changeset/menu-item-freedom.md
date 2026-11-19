---
'@envsemble/envui': minor
---

Menu: `Menu.Item`, `Menu.CheckboxItem`, `Menu.RadioItem` and `Menu.Submenu` take `start`, content before the label in place of an icon, such as an Avatar in an account switcher, at its own size; the labels of every row of the menu still line up, icons included. The items take the native attributes of their row too, such as `style`, `id`, `ref` and data attributes for a test id or analytics, and `Menu.Item` takes `closeOnClick={false}` to keep the menu open after an action people repeat, such as Zoom in. `Menu.Submenu` takes `end`, such as a count beside its chevron, and `triggerProps`, the className, style, ref and attributes of the row that opens it. See [Menu](https://github.com/envsemble/envUI/blob/main/docs/components/menu.md).
