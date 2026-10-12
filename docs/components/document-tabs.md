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
  onPin={keepDocumentOpen}
/>
<main id="document-panel" role="tabpanel" aria-label={activeDocument.name}>
  <DocumentView document={activeDocument} />
</main>;
```

### Props & contracts

| Name          | Contract                                                                                        |
| ------------- | ----------------------------------------------------------------------------------------------- |
| items         | Open documents as `{ id, label, icon?, title?, preview? }`, in tab order                        |
| value         | The active tab id, or null                                                                      |
| onValueChange | Called on click and when the arrow keys, Home or End reach a tab                                |
| onClose       | Called from the tab's close button and from a middle click                                      |
| onPin         | Optional; called on double click, typically to keep a preview tab                               |
| aria-label    | Required accessible name of the tab strip                                                       |
| panelId       | Optional id of the panel the application renders; the active tab points aria-controls at it     |
| closeLabel    | Accessible name of each close button from the tab label; Close followed by the label by default |
| Tab elements  | role tab with data-tab-id and data-preview ("true" or "false") attributes                       |

## Guidelines

- The strip renders only the tabs. The application owns the open documents, the active one and its panel, and whether closing or pinning changes them.
- The strip is one tab stop. Arrow Left and Right move to the previous or next tab and activate it, wrapping at the ends; Home and End reach the first and last. Delete and Ctrl+W are left to the application, which can bind them to onClose.
- A preview tab shows its label in italics; double-click it to call onPin. A middle click closes a tab without activating it.
- Each tab has a close button that shows on the active tab, on hover and with keyboard focus, and keeps its space so tabs do not change width. It is not a tab stop. When the focused tab closes, focus moves to the tab that becomes active.
- Tabs are 2.5 rem tall, and labels truncate beyond about 14 rem; the title shows the full name. The active tab carries the fill and a selection-blue indicator along its bottom edge.
- The strip takes the width it is given and scrolls sideways when tabs overflow: with the wheel, touch or the keyboard. The active tab scrolls into view when it changes.

TypeScript declarations provide the complete public API.

## Related topics

- [Tabs](../components/tabs.md)
- [Tree](../components/tree.md)
- [Application shell](../components/app-shell.md)
- [Accessibility](../foundations/accessibility.md)
