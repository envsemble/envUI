# Split view

## React usage

```tsx
import { SplitView } from '@envsemble/envui';

<SplitView
  storageKey="documents-split"
  defaultSize={35}
  minSize={20}
  maxSize={60}
  stackBelow="48rem"
  resizeLabel="Resize document list"
  start={<DocumentList />}
  end={<DocumentPreview />}
  style={{ blockSize: '100%' }}
/>;
```

### Props & contracts

| Name                              | Contract                                                                                                                                |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| start / end                       | Content of the panes at the inline start and end                                                                                        |
| size / defaultSize / onSizeChange | The start pane's share of the width in percent, 50 by default; onSizeChange reports each new share                                      |
| minSize / maxSize                 | Bounds of the start pane's share in percent; 20 and 80 by default                                                                       |
| storageKey                        | Keeps the share chosen in an uncontrolled split in localStorage; another key brings its own stored share, or the default                |
| stackBelow                        | A width such as 48rem; while the split view itself is narrower, the panes stack without the divider and the split view has data-stacked |
| onStackedChange                   | Receives true when the panes stack and false when they sit side by side again, also when a split view leaves while its panes stack      |
| resizeLabel                       | Accessible name of the divider; Resize panes by default                                                                                 |
| Native div props                  | className, style, ref and accessible attributes on the split view                                                                       |

## Guidelines

- Use a split view for two related panes that people size to their task, such as a list beside the selected item or a source beside its preview. Use Stack for content that simply follows.
- Give the split view a height, such as the space below a toolbar, and each pane scrolls on its own. Without one, the split view grows with the taller pane.
- The divider is a separator in a 1 rem gutter between the panes. Drag it, or focus it and press <kbd>←</kbd> or <kbd>→</kbd> to move it by 2 percent, 10 with <kbd>Shift</kbd>; <kbd>Home</kbd> and <kbd>End</kbd> reach minSize and maxSize. A double click returns it to defaultSize. In right-to-left text the start pane is on the right, and the arrow keys still move the divider in their direction.
- After a drag or a key press, the share persists under storageKey; a double click forgets it. A cancelled drag returns to where it began. While dragging, embedded content such as a frame does not take the pointer.
- stackBelow responds to the split view's own width, not the window's, so a split view in a narrow column stacks too. The stacked panes keep their order, the start pane first, with the gutter between them; within a set height they scroll together. To show one pane at a time while stacked, such as a list that opens an item with a way back, follow onStackedChange, or style the split view by its data-stacked attribute. A hidden split view, such as one in a hidden tab panel, keeps its layout until it shows again.
- The line thickens on hover and takes the focus color with the keyboard and while dragging. On touch screens the divider reaches beyond the gutter to the touch size.

TypeScript declarations provide the complete public API.

## Related topics

- [Stacks & action groups](../components/layout.md)
- [Surface](../components/surface.md)
- [Application shell](../components/app-shell.md)
