---
'@envsemble/envui': minor
'@envsemble/eslint-plugin-envui': minor
'@envsemble/stylelint-config-envui': minor
---

Lists, trees, tables and cards take a quieter default look, and their slots place what they hold without styling it.

- **List rows are plain by default**: no fill, no rounded tiles and no gap, parted by hairlines, their text in line with the content around the list. Under `<Theme surface="filled">` they are the joined tiles of before, and in a muted Surface that holds only lists they still take the raised fill. A vertical RadioGroup's connected rows follow the same corners: none when plain.
- **The current List row** takes the selection's fill and medium text, so it stays apart from a hovered row now that the selection is neutral; a Tree's selected row has a medium label for the same reason.
- **A clickable row or card takes the click and shows hover and press by its fill alone.** A Link or text Button marked `data-row-target` reads in the row's text color, never in the link color, and doesn't underline or take a press fill. An interactive Card no longer shrinks while pressed.
- **Table is plain by default**: no frame, no fill and no shaded header band, with a hairline under the header and between the rows. The new `headerBand` prop on `Table.Root` sets the header on the shaded band. Under `<Theme surface="filled">` the table lies on its rounded raised surface as before. A selected row lays the selection over the surface the table lies on.
- **List.Item, Tree, Card, Table and the rows of Select, Combobox, Menu and the command palette render their slots through one Slot part**, which places the content and never clips, cuts short or recolors it: List.Item's `start`, `label`, `children` and `end` (`env-list-item-start`, `env-list-item-label`, `env-list-item-extra`, `env-list-item-end`), Tree's `end` (`env-tree-end`), Card's `actions` (`env-card-actions`, inside `env-card-footer`) and a stacked Table cell's content (`env-table-cell-content`). A List.Item's description is its own part, `env-list-item-description`.
- **A Tree row keeps its label before its end**: the description gives way first, and an `end`, such as a Badge, that doesn't fit beside the label leaves the row whole instead of squeezing the name. The label ends with an ellipsis only where the row is too narrow for it alone.
- A Badge on a selected row keeps its own colors: rows no longer lay its tint over another surface.

Breaking changes:

- `TreeItem.label` and `TreeItem.description` are `string`: the tree cuts them short itself. `TreeItem.textValue` is gone; type-ahead matches the label.
- Badge's `children` is a `string`: write ``{`${count} seats`}`` instead of `{count} seats`.
- The List.Item description is a `div` with the class `env-list-item-description`, no longer a `small` inside `env-list-item-content`; the drag handle, `env-list-item-handle`, is a child of the row, no longer inside `env-list-item-start`. List.Item no longer sizes an `svg` or `img` given straight to `start`: give it an Icon or a Graphic.
- The rows of popup lists lose the `env-list-row-shortcut` part; keys go in the row's end.
