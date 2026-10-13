# Tree

## React usage

```tsx
import { MenuItem, Tree, type TreeItem } from '@envsemble/envui';
import { Description } from '@envsemble/envui/icons/Description';
import { Folder } from '@envsemble/envui/icons/Folder';

interface FileRow extends TreeItem {
  path: string;
}

// The application flattens its visible rows: expanded folders are followed by their children.
const rows: FileRow[] = visibleFiles.map((file) => ({
  id: file.path,
  path: file.path,
  depth: file.depth,
  expandable: file.isFolder,
  expanded: expandedPaths.has(file.path),
  label: file.name,
  icon: file.isFolder ? <Folder /> : <Description />,
  detail: file.status,
  title: file.path,
}));

<Tree
  aria-label="Files"
  items={rows}
  selectedId={currentPath}
  onOpen={(row, { preview }) => openDocument(row.path, { preview })}
  onExpandedChange={(row, expanded) => setFolderExpanded(row.path, expanded)}
  contextMenu={(row) =>
    row ? (
      <MenuItem onClick={() => rename(row.path)}>Rename</MenuItem>
    ) : (
      <MenuItem onClick={createDocument}>New document</MenuItem>
    )
  }
/>;
```

### Props & contracts

| Name              | Contract                                                                                                                   |
| ----------------- | -------------------------------------------------------------------------------------------------------------------------- |
| items             | The visible rows in order: id, depth and label, with optional expandable, expanded, icon, detail and trailing              |
| aria-label        | Required accessible name of the tree                                                                                       |
| selectedId        | The selected row; it scrolls into view when it changes                                                                     |
| onOpen            | Click and <kbd>Space</kbd> pass preview true; double click and <kbd>Enter</kbd> pass preview false                         |
| onExpandedChange  | Chevron clicks, <kbd>→</kbd> on a collapsed row and <kbd>←</kbd> on an expanded row                                        |
| contextMenu       | Menu items for a row, or for the empty area when the row is null; opens on right click and <kbd>Shift</kbd>+<kbd>F10</kbd> |
| contextMenuLabel  | Accessible name of that menu; Actions by default                                                                           |
| density           | compact (default, about 1.75 rem rows) or standard (about 2.25 rem rows)                                                   |
| TreeItem title    | Native tooltip, such as the full path; textValue names a row for type-ahead when its label is not text                     |
| TreeItem disabled | The row can be focused but does not open or expand                                                                         |

## Guidelines

- The application owns the data, expansion and selection. Pass only the visible rows, flattened in order; collapsing a folder removes its descendants from items.
- Tree is its own scroll container and fills its parent's height (block-size: 100%), so give it a sized parent, such as AppShell's sidebarContent. Only the rows in view, plus a few beyond, are in the document, so thousands of rows stay fast.
- One tab stop: the tree keeps focus and points aria-activedescendant at the active row. <kbd>↑</kbd> and <kbd>↓</kbd> move, <kbd>Home</kbd> and <kbd>End</kbd> reach the ends, <kbd>Page Up</kbd> and <kbd>Page Down</kbd> move by a page, <kbd>→</kbd> expands or enters a folder, <kbd>←</kbd> collapses or returns to the parent, and typing jumps to a matching row. Keys pressed with <kbd>Alt</kbd>, <kbd>Ctrl</kbd> or <kbd>⌘</kbd> are left to the application, such as <kbd>Alt</kbd>+<kbd>←</kbd> for going back.
- Single click and <kbd>Space</kbd> preview; double click and <kbd>Enter</kbd> open. A folder row calls onOpen too, so the application decides whether that toggles it or opens an index document.
- Rows indent 0.75 rem per level, truncate long labels with an ellipsis, and keep a data-id attribute with the item id. The selected row uses the navigation selection colors; the focus ring shows on the active row only with keyboard focus.
- Use detail for a short muted fact after the label, such as a status, and trailing for a Counter or Badge at the end.

TypeScript declarations provide the complete public API.

## Related topics

- [Application shell](../components/app-shell.md)
- [Menus](../components/menu.md)
- [Navigation items](../components/navigation.md)
- [Accessibility](../foundations/accessibility.md)
