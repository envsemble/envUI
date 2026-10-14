# Document tabs

## React usage

```tsx
import { DocumentTabs } from '@envsemble/envui';
import { Description } from '@envsemble/envui/icons/Description';

<DocumentTabs
  aria-label="Open documents"
  items={openDocuments.map((document) => ({
    id: document.path,
    label: document.name,
    icon: <Description />,
    title: document.path,
    preview: document.path === previewPath,
  }))}
  value={activePath}
  panelId="document-panel"
  onValueChange={setActivePath}
  onClose={closeDocument}
  onCloseAll={closeAllDocuments}
  onPin={keepDocumentOpen}
/>
<main id="document-panel" role="tabpanel" aria-label={activeDocument.name}>
  <DocumentView document={activeDocument} />
</main>;
```

### Props & contracts

| Name             | Contract                                                                                                            |
| ---------------- | ------------------------------------------------------------------------------------------------------------------- |
| items            | Open documents as `{ id, label, icon?, title?, preview? }`, in tab order                                            |
| value            | The active tab id, or null                                                                                          |
| onValueChange    | Called on click and when <kbd>←</kbd>, <kbd>→</kbd>, <kbd>Home</kbd> or <kbd>End</kbd> reach a tab                  |
| onClose          | Called from the tab's close button, a middle click, <kbd>Delete</kbd> on the focused tab and the tab's context menu |
| onPin            | Optional; called on double click, typically to keep a preview tab                                                   |
| aria-label       | Required accessible name of the tab strip                                                                           |
| panelId          | Optional id of the panel the application renders; the active tab points aria-controls at it                         |
| closeLabel       | Accessible name of each close button from the tab label; Close followed by the label by default                     |
| onCloseAll       | Optional; adds a context menu with Close all tabs, which calls it                                                   |
| closeAllLabel    | Label of the Close all tabs item                                                                                    |
| contextMenuLabel | Accessible name of the context menu; Tab actions by default                                                         |
| Tab elements     | role tab with data-tab-id and data-preview ("true" or "false") attributes                                           |

## Guidelines

- The strip renders only the tabs. The application owns the open documents, the active one and its panel, and whether closing or pinning changes them.
- The strip is one tab stop. <kbd>←</kbd> and <kbd>→</kbd> move to the previous or next tab and activate it, wrapping at the ends; <kbd>Home</kbd> and <kbd>End</kbd> reach the first and last. <kbd>Delete</kbd> closes the focused tab. Keys pressed with <kbd>Alt</kbd>, <kbd>Ctrl</kbd> or <kbd>⌘</kbd> are left to the application, such as <kbd>Ctrl</kbd>+<kbd>W</kbd>, which it can bind to onClose, or <kbd>Alt</kbd>+<kbd>←</kbd> for going back.
- With onCloseAll, right click, a long press, the <kbd>Menu</kbd> key or <kbd>Shift</kbd>+<kbd>F10</kbd> on the strip opens a compact context menu with Close all tabs; on a tab, the menu first offers closing that tab, named by closeLabel, which calls onClose. Close all tabs is unavailable while the strip is empty. Without onCloseAll, the strip keeps the browser's own context menu.
- A preview tab shows its label in italics; double-click it to call onPin. A middle click closes a tab without activating it.
- Each tab has a close button that shows on the active tab, on hover and with keyboard focus, and keeps its space so tabs do not change width. It is not a tab stop. When the focused tab closes, by its button, <kbd>Delete</kbd>, the context menu or the application's own shortcut, focus moves to the tab that becomes active.
- Tabs are 2.5 rem tall, and labels truncate beyond about 14 rem; the title shows the full name. The active tab carries the fill and a selection-blue indicator along its bottom edge.
- The strip takes the width it is given and scrolls sideways when tabs overflow: with the wheel, touch or the keyboard. The active tab scrolls into view when it changes.

TypeScript declarations provide the complete public API.

## Related topics

- [Tabs](../components/tabs.md)
- [Tree](../components/tree.md)
- [Application shell](../components/app-shell.md)
- [Accessibility](../foundations/accessibility.md)
