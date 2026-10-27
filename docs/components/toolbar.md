---
title: Toolbar
summary: A bar of icon buttons for one subject, such as an editor's formatting, in a row or a column.
status: beta
since: 1.0.0
category: Actions
aliases:
  - toolbar
  - formatting bar
  - action bar
  - button bar
  - tool palette
useWhen:
  - Controls for one subject, such as an editor's formatting
  - Many icon-only actions that would each take a tab stop
  - A palette whose chosen tool stays chosen, such as drawing tools
avoidWhen:
  - text: A form's or a dialog's actions, which keep a tab stop each.
    use: Row
  - text: Buttons joined into one connected control, such as a main action and its menu.
    use: ButtonGroup
  - text: A choice of one view or filter, shown as a selected segment.
    use: SegmentedControl
  - text: An application's menus of commands, such as File and Edit.
    use: Menubar
  - text: A page's search, filters and primary action, where fields keep their arrow keys.
    use: PageHeader
components:
  - Toolbar
examples:
  FormattingToolbar:
    role: overview
    motion: true
  DrawingTools:
    role: example
    caption: A vertical toolbar of toggles, where one tool stays chosen.
  ViewControls: example
  ToolbarAnatomy: anatomy
  SameIconPressed:
    role: do
    caption: A toggle keeps its icon, pressed or not.
  IconSwapsPressed:
    role: dont
    caption: 'A pressed toggle that changes its icon: people lose track of what it does.'
  PageToolbar:
    role: example
    caption: "A page's toolbar: a Row in PageHeader's toolbar, not a Toolbar."
---

# Toolbar

## Variants

### Orientation

| Orientation | Use for                           |
| ----------- | --------------------------------- |
| Horizontal  | Most toolbars. The default.       |
| Vertical    | A palette, such as drawing tools. |

```tsx figure=DrawingTools

```

### Over content

A toolbar can float over dense content, such as a diagram, on a fully rounded surface with small buttons.

Where people scan its icons by pointing at them, its buttons can show their names at once, with no wait.

```tsx figure=ViewControls motion

```

## Anatomy

```tsx figure=ToolbarAnatomy

```

1. **Toolbar** (`env-toolbar`)
2. **Group** (`env-toolbar-group`)
3. **Button** (`env-toolbar-button`, `icon`)
4. **Separator** (`env-toolbar-separator`)

Not shown: the tooltip.

## Behaviour

### Names and toggles

Each button is an icon, whose name and shortcut show in a tooltip.

A button can also be a toggle that stays pressed.

### Buttons of your own

A button of the application's own, such as a menu's trigger, keeps its own tab stop, outside the arrow keys' path.

## Rules

A toolbar holds icon commands for one subject, each named after its action.

```tsx figure=SameIconPressed motion

```

```tsx figure=IconSwapsPressed motion

```

### Another way to each action

Offer the important actions in a menu or a shortcut too.

### Labels

Name each button after its action, and the toolbar after its subject.

- A button: Bold, rather than its icon.
- A toolbar: Formatting.

### Other bars

Not every bar of controls is a Toolbar. A bar with a field, a Select or labelled actions is a [Row](row.md), where every control keeps its tab stop and fields keep their arrow keys.

| Bar                                         | Build it with                                     |
| ------------------------------------------- | ------------------------------------------------- |
| Icon commands, such as formatting or tools  | A Toolbar of its buttons                          |
| A page's search, filters and primary action | A Row in the toolbar of a [PageHeader](page.md)   |
| A section's heading with its actions        | A Row that wraps, with the actions at the end     |
| A table's search and actions                | A Row above the table, in the size of its rows    |
| Actions in a window's title bar             | A TopBar as a title bar, with small ghost buttons |

```tsx figure=PageToolbar

```

## Accessibility

### Keyboard

| Key                                             | Action                                                     |
| ----------------------------------------------- | ---------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves into the toolbar, to the control last used, and out. |
| <kbd>←</kbd>, <kbd>→</kbd>                      | Moves between controls of a horizontal toolbar.            |
| <kbd>↑</kbd>, <kbd>↓</kbd>                      | Moves between controls of a vertical toolbar.              |
| <kbd>Enter</kbd>, <kbd>Space</kbd>              | Presses the button, or follows the link.                   |
| <kbd>Esc</kbd>                                  | Closes the tooltip.                                        |

### envUI provides

- `role="toolbar"` with `aria-orientation`, and a group role on each group.
- One tab stop, with disabled buttons out of the arrow keys' path.
- Names from `label`, `aria-pressed` on toggles and `aria-keyshortcuts` from `shortcut`.

### You provide

- An `aria-label` on the toolbar, and on groups that share a name.
- The behaviour behind each button and shortcut.

## Compose

### Usage

Toolbar.Root, named by its `aria-label`, holds Toolbar.Button, Toolbar.Link, Toolbar.Group and Toolbar.Separator.

- A Toolbar.Button takes its `icon` and its `label`, which names it and shows in its tooltip with its `shortcut`, such as `Ctrl+B`, announced as `aria-keyshortcuts`.
- With `pressed` it is a toggle, announced as pressed and drawn selected.
- Its `variant` is Button's, `ghost` by default from the toolbar, and `pending` replaces the icon with a spinner.
- A Toolbar.Link takes an `href`, through the link component of `LinkProvider`, with its `icon` and `label`.
- A Toolbar.Group, named by its own `aria-label`, holds controls that belong together.

```tsx source=FormattingToolbar

```

#### Orientation and size

`orientation` is `horizontal`, the default, or `vertical`, and sets which arrow keys move.

- `size` is `sm`, `md` or `lg`; without it the buttons take their container's control height.
- `loopFocus`, on by default, moves from the last control to the first and back.
- `tooltipDelay` is how long, in milliseconds, the pointer rests on a button or link before its tooltip opens, 400 by default, as Tooltip's `delay`; keyboard focus opens it at once.
- `disabled` on Toolbar.Root or a Toolbar.Group disables every control inside.

A Surface with `radius="full"` floats a small toolbar over content, as the ViewControls example does:

```tsx
<Surface
  padding={1}
  radius="full"
  render={<Toolbar.Root aria-label="Diagram view" size="sm" tooltipDelay={0} />}
  style={{ inlineSize: 'fit-content' }}
>
  <Toolbar.Button icon={<ZoomOut />} label="Zoom out" shortcut="Ctrl+-" />
  <Toolbar.Button icon={<ZoomIn />} label="Zoom in" shortcut="Ctrl+=" />
  <Toolbar.Separator />
  <Toolbar.Link href="/help/diagrams" icon={<Help />} label="Diagram help" />
</Surface>
```

#### Buttons of your own

Buttons inside a toolbar take the `ghost` variant unless they set another.

- A Button of the application's own keeps its own tab stop, outside the arrow keys' path.
- A Toolbar.Button can be the `trigger` of a Menu.Root or a Popover, for a dropdown in the toolbar: it stays in the arrow keys' path, with its name in its tooltip, which stays closed while its popup is open.

#### Other bars

A bar with a field, a Select or labelled actions is a Row:

- `<Row wrap align="center" justify="between">` for a section's heading and its actions.
- PageHeader's `toolbar` for a page's search, filters and primary action, as the PageToolbar example does: a Row whose field keeps its arrow keys, every control a tab stop, the primary action at the end.
- A TopBar with `titleBar` for a window's title bar, with small ghost buttons in its `actions`.

```tsx
<PageHeader
  title="Tasks"
  toolbar={
    <Row wrap align="center" justify="between" gap={3}>
      <Row wrap align="center" gap={3}>
        <SearchField label="Search tasks" placeholder="Search tasks" />
        <SegmentedControl
          aria-label="Status"
          value={status}
          onValueChange={setStatus}
          items={statuses}
        />
      </Row>
      <Button startIcon={<Add />}>New task</Button>
    </Row>
  }
/>
```

### Composition

The parts are the toolbar, `env-toolbar`; its groups, `env-toolbar-group`; its buttons and links, `env-toolbar-button`; its separators, `env-toolbar-separator`; and a button's tooltip, `env-toolbar-tooltip`. `render` on Toolbar.Root or Toolbar.Group renders it as another element, such as a ButtonGroup that connects its buttons, or onto a Surface that floats it.

## Changelog

- **1.0.0-prerelease.4**: `tooltipDelay` on Toolbar.Root sets how long the pointer rests on a button or link before its tooltip opens; 0 shows every name at once.
- **1.0.0**: Toolbar, on Base UI's Toolbar.
