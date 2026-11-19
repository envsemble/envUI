---
'@envsemble/envui': minor
---

Tree: a row's `label` and `description` take any content again, as in 1.x, such as a name with the letters a search matched in bold, and `textValue` gives type-ahead the plain name where the label isn't a string. A row's `rowProps` sets its own props on the row element, such as a className or data attribute for its state, or `draggable` and drag handlers for moving files; the tree keeps its role, id, ARIA attributes and title. The tree also takes `onClick`, `onDoubleClick`, `onContextMenu` and `onPointerDown`, which run before its own handling; a click or double click whose default is prevented doesn't open the row. See [Tree](https://github.com/envsemble/envUI/blob/main/docs/components/tree.md).
