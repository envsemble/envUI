---
'@envsemble/envui': major
---

Control sizes and row density replace the `density`, `compact` and size-as-density props. The `v1-props` codemod moves what it can and reports the rest.

- **`size="sm" | "md" | "lg"`** on Button, IconButton, CopyButton, TextField, SearchField, Select, Combobox, DatePicker, SegmentedControl and Pagination: every control of a size has the same height in a scale, 2, 2.5 and 3 rem in the comfortable one. Without a size, a control takes the control height of its container, `md` by default. Tabs' `size` is its rail's: `lg`, the default, keeps today's rail, and `sm` replaces `compact`. TextField no longer takes the native `size` attribute.
- **Row `density="xs" | "sm" | "md" | "lg"`** on Table.Root (default `md`), Tree (default `sm`) and the new one on List.Root (default `md`): it changes only the rows' block padding, never their text, icons or corners. Table's `compact` is `sm`, Tree's `compact` is `sm` and its `standard` is `md`. Compact tables no longer make their text smaller, and Tree's `md` keeps the text and icons of `sm`.
- **Removed:** `density` on Select, Combobox, DatePicker, Surface, Menu.Root, ContextMenu and Menubar.Menu; `compact` on TextField and SearchField; `size` on NavList.Item; the `standard` and `compact` sizes of Tabs, SegmentedControl, Pagination and CopyButton, which are `md` or `lg` and `sm`. DropZone's `compact` is `size="sm"`. For a compact app or region, set `scale="compact"` on its Theme; for a small control, set `size="sm"`.
- **Rows match:** buttons, icon buttons and fields in table cells take the small control height at every density, so a row with an action is no taller than it needs to be. Title bars, panel headers, message actions and the date picker's popup hold small controls.

Migration guide: [Scale and density](https://github.com/envsemble/envUI/blob/main/docs/migration.md#scale-and-density).
