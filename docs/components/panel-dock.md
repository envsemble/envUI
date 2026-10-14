# Panel dock

## React usage

```tsx
import { useState } from 'react';
import {
  IconButton,
  PanelDock,
  PanelDockHeader,
  Textarea,
  type PanelDockMode,
  type PanelDockPanel,
} from '@envsemble/envui';
import { Edit } from '@envsemble/envui/icons/Edit';

function Workspace() {
  const [panels, setPanels] = useState<PanelDockPanel[]>([
    { id: 'report', title: 'Quarterly report', mode: 'open', active: true },
    { id: 'budget', title: 'Budget', mode: 'minimized', attention: 'Unsaved changes' },
  ]);
  const update = (id: string, change: Partial<PanelDockPanel>) =>
    setPanels((current) =>
      current.map((panel) => (panel.id === id ? { ...panel, ...change } : panel)),
    );
  // At most one panel is maximized: maximizing another returns the earlier one to the row.
  const changeMode = (id: string, mode: PanelDockMode) =>
    setPanels((current) =>
      current.map((panel) =>
        panel.id === id
          ? { ...panel, mode }
          : mode === 'maximized' && panel.mode === 'maximized'
            ? { ...panel, mode: 'open' }
            : panel,
      ),
    );
  return (
    // The dock fills the positioned container and lies over the page beside it.
    <div style={{ position: 'relative', blockSize: '100%' }}>
      <WorkspacePage />
      <PanelDock
        panels={panels}
        onModeChange={changeMode}
        onClose={(id) => setPanels((current) => current.filter((panel) => panel.id !== id))}
        onActivate={(id) =>
          setPanels((current) => current.map((panel) => ({ ...panel, active: panel.id === id })))
        }
        onHeightChange={(id, height) => update(id, { height })}
      >
        {(panel) => <DocumentWindow title={panel.title} />}
      </PanelDock>
    </div>
  );
}

function DocumentWindow({ title }: { title: string }) {
  // Kept while the panel is minimized, maximized or moved; lost only when it closes.
  const [draft, setDraft] = useState('');
  return (
    <>
      <PanelDockHeader
        title={title}
        meta="Edited by Alex Morgan"
        actions={<IconButton variant="text" icon={<Edit />} aria-label="Edit" />}
      />
      <div style={{ padding: '0 var(--space-5) var(--space-5)' }}>
        <Textarea label="Draft" value={draft} onChange={(event) => setDraft(event.target.value)} />
      </div>
    </>
  );
}
```

### Props & contracts

| Name                      | Contract                                                                                                                                                                                        |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| panels                    | The panels in order, each a PanelDockPanel (below); open panels sit side by side and chips follow the same order                                                                                |
| children                  | Renders a panel's content from its panel, such as a PanelDockHeader above the panel's body                                                                                                      |
| onModeChange              | Called with a panel's id and the mode its window controls or its chip ask for: open, minimized or maximized                                                                                     |
| onClose                   | Called from a panel's Close control and its chip's close button                                                                                                                                 |
| onActivate                | Called when people press or focus inside a panel that is not active, and when its chip brings it back                                                                                           |
| onHeightChange            | Called with a panel's new height in pixels when a drag on its top edge ends, and on each key press there                                                                                        |
| stackBelow                | A width, 40rem by default, or a number of pixels, such as 600 or "600"; while the dock itself is narrower, one panel at a time fills it and the others wait as chips; the dock has data-stacked |
| onStackedChange           | Receives true when the dock stacks and false when its panels sit side by side again, also when a dock leaves while stacked                                                                      |
| overflow                  | When open panels cannot all fit at their minimum widths: scroll (default) scrolls the row; minimize asks to minimize the least recently active one other than the active one                    |
| minimizedLabel            | Accessible name of the list of chips, which holds minimized panels and those a stacked dock leaves out; Hidden panels by default                                                                |
| restoreLabel / closeLabel | Functions that name a chip's buttons from its label, as each chip names its panel; Show and Close followed by the label by default                                                              |
| resizeLabel               | Accessible name of a panel's resize handle from its title; Resize followed by the title by default                                                                                              |
| Native div props          | className, style, ref and accessible attributes on the dock                                                                                                                                     |
| Panel and chip elements   | Each panel is a region named by its title with data-panel-id, data-mode and data-active; each chip is a list item with data-panel-id                                                            |

### Panels

| Name                                 | Contract                                                                                                                                             |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| id                                   | Stable, unique identifier                                                                                                                            |
| title                                | The panel's name: the accessible name of its region and the text of its chip                                                                         |
| mode                                 | open, minimized or maximized                                                                                                                         |
| height                               | The open panel's height in pixels; without it, the panel starts at 85% of the room above the chips, up to 40 rem, and keeps the height people choose |
| preferredWidth / minWidth / maxWidth | Widths in pixels: the width where the row has room, 32 rem by default; the narrowest the row shrinks it to, 20 rem; the widest it gets, 48 rem       |
| minHeight / maxHeight                | Resize bounds in pixels; 15 rem and the room above the chips by default                                                                              |
| active                               | The panel people work in: in front of the other open panels, and the one a stacked dock shows                                                        |
| label                                | The chip's text where a shorter one helps; the title by default                                                                                      |
| icon                                 | A leading icon on the chip                                                                                                                           |
| attention                            | Text describing a dot on the chip, such as Unsaved changes                                                                                           |
| tooltip                              | Tooltip content of the chip, such as the full title with a detail                                                                                    |

### Header and window controls

```tsx
import { IconButton, Menu, MenuItem, PanelDockHeader } from '@envsemble/envui';
import { Edit } from '@envsemble/envui/icons/Edit';
import { MoreVert } from '@envsemble/envui/icons/MoreVert';

<PanelDockHeader
  title="Quarterly report"
  meta="Edited by Alex Morgan · 5 minutes ago"
  actions={
    <>
      <IconButton variant="text" icon={<Edit />} aria-label="Edit" onClick={startEditing} />
      <Menu
        aria-label="Report actions"
        density="compact"
        trigger={<IconButton variant="text" icon={<MoreVert />} aria-label="More actions" />}
      >
        <MenuItem onClick={share}>Share</MenuItem>
      </Menu>
    </>
  }
/>;
```

| Name                                                      | Contract                                                                                                |
| --------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
| PanelDockHeader title / meta                              | The title as a heading, and supporting text below it, such as who changed it last                       |
| PanelDockHeader headingLevel                              | The title's level in the page outline, 2 by default; the appearance stays the same                      |
| PanelDockHeader actions                                   | The application's own actions before the window controls, such as Edit and a menu of more               |
| PanelDockHeader controls                                  | The window controls: PanelDockControls inside a dock by default; null leaves them out                   |
| PanelDockHeader children                                  | Content below the title row that stays with the header, such as Tabs                                    |
| PanelDockHeader native props                              | className, style, ref and other header attributes                                                       |
| PanelDockControls                                         | Minimize, Maximize or Restore, and Close for the panel around it, as compact icon buttons with tooltips |
| minimizeLabel / maximizeLabel / restoreLabel / closeLabel | Accessible names and tooltips of the controls; Minimize, Maximize, Restore and Close by default         |

## Content stays mounted

A panel's content mounts when the panel first appears and stays mounted until it closes. Minimizing, maximizing and restoring it, a stacked dock showing another panel, resizing, and panels reordering never mount it again: its React state, effects and subscriptions stay as they are, and so do focus and the scroll positions inside it. That is why an application can keep an unsaved draft in a panel's own state, or a data subscription in its component, without lifting them out of the panel.

- Changes of mode only restyle the panel: a minimized panel stays in the document, inert and out of sight, so a frame or video inside it carries on. A reorder moves the panel's element; the dock keeps focus and the scroll positions where they were, though a frame inside reloads, as browsers do with moved frames.
- Minimizing a panel that holds focus moves focus to its chip, also from a popup the panel opened, such as a menu. Bringing it back from the chip returns focus to the element in its content that last had it, scrolled into view where the content hid it entirely, or else to the panel. Closing the focused panel moves focus to the active panel in view, else to the last open panel in the row, else to the panel that fills the region, or else to the last chip; closing a chip moves focus to the chip that takes its place.
- Pressing a window control closes a menu or popover open in the panel, as any press outside it does. When the application hides a panel itself while one is open, as from a keyboard shortcut, the popup stays until the next press or <kbd>Esc</kbd>; close it first where that matters.

## Guidelines

- Put the dock in a positioned container with a height, such as the area below a topbar, beside the page content, which scrolls on its own. The dock fills the container and lies over it; around its panels and chips, presses reach the content beneath.
- The application owns the panels: which exist, their order and mode, which one is active and any height it keeps. The dock asks for changes through its callbacks and shows what it is given. Keep at most one panel maximized; activate a panel when it opens.
- Open panels stand side by side on the bottom inline-end edge, 0.5 rem apart, the newest at the end. Each takes its preferred width while the row has room; then they shrink in proportion, down to their minimum widths, and finally the row scrolls sideways. With overflow="minimize" the dock asks to minimize a panel instead: the least recently active open panel other than the active one, one at a time, until the rest fit, so every panel shows in the row or as a chip. It asks once for each panel; one the application keeps open stays, and the row scrolls. A panel that joins the row scrolls into view, so the newest stays visible, also as the region narrows. Touch, a sideways wheel and moving focus scroll the row, and its scrollbar works while it overflows.
- Panels take the dialog surface with a hairline border and a shadow, rounded at the top. The active panel is in front, with a deeper shadow; pressing or focusing inside a panel calls onActivate. Content that does not fill the panel scrolls within it, below a PanelDockHeader that sticks to the top; the content's scroll padding follows the header's height, so a control that takes focus beneath the header comes out below it.
- Drag an open panel's top edge to change its height, or focus the edge and press <kbd>↑</kbd> or <kbd>↓</kbd> for 16 px, 64 px with <kbd>Shift</kbd>; <kbd>Home</kbd> and <kbd>End</kbd> reach minHeight and maxHeight. The edge reports the height in pixels, read as its share of the room above the chips, such as 85%. A short bar shows on the edge on hover, in the focus color with the keyboard and while dragging. The panel stays within the room above the chips: a shorter region holds it lower without changing its height. A cancelled drag keeps the height it began with.
- A maximized panel fills the region above the chips, behind the open panels, which keep their modes and leave the first row of its header in view. Its Restore control returns it to the row.
- Minimized panels wait as chips along the bottom, at the inline end and in panel order: an icon, a label that truncates beyond about 14 rem, an attention dot and a close button. Pressing a chip brings its panel back and activates it. A vertical wheel scrolls an overflowing strip sideways. Pass the full title as tooltip where labels may truncate.
- stackBelow responds to the dock's own width, not the window's. Below it, the active panel, or else the newest, fills the region like a sheet, without its resize handle and Maximize control, and the other panels wait as chips; a chip shows its panel instead, also where the application does not activate it, until another panel becomes active. A phone gets one panel at a time this way. A hidden dock keeps its layout until it shows again.
- While a panel fills the region, maximized or alone in a stacked dock, the dock covers the content beneath it, also around the chips. Make that content inert while it is covered, so the keyboard and assistive technology stay with the panels: that is while a panel is maximized, or while the dock stacks, as onStackedChange reports, and a panel is not minimized.
- Panels are labelled regions, not dialogs: they never trap focus, and the page stays usable around them. In the keyboard order, each panel's resize handle comes before its content, the header's actions before its window controls, and the chips follow the panels; every chip is two buttons in a list.
- PanelDockHeader makes its controls compact, like a title bar's, and gives icon-only text buttons the quiet icon color of the window controls. Put the application's actions in actions, such as Edit and a Menu, beside the window controls. A long title wraps between words rather than truncating: keep it short and put detail in meta. The title keeps about 10 rem beside the actions and window controls; in a narrower panel they take a row of their own above it, at the inline end.
- In right-to-left text the dock gathers at the left, its inline end, and the newest panel stays at the left edge of an overflowing row.
- Panels rise into the row from the bottom edge, a maximized or stacked panel grows into the region, and chips rise into their strip, briefly. With reduced motion, they only fade in. A reorder moves them without their entrance, and panels rendered on a server are in place without one.

TypeScript declarations provide the complete public API.

## Related topics

- [Application shell](../components/app-shell.md)
- [Split view](../components/split-view.md)
- [Document tabs](../components/document-tabs.md)
- [Dialogs](../components/dialogs.md)
- [Tooltips](../components/tooltip.md)
- [Accessibility](../foundations/accessibility.md)
