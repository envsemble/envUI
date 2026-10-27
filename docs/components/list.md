---
title: List
summary: A vertical list of connected rows, each with a title, a detail and an action, that can open what it names, show the current one and be put in order.
status: stable
since: 0.1.0
category: Data display
aliases:
  - GroupedRows
  - Row
  - ConnectedRows
  - list item
  - grouped list
  - settings list
  - rows
  - item list
  - list view
  - reorderable list
  - sortable list
  - drag and drop list
  - selectable rows
useWhen:
  - Related items with a title, a detail and an action each, such as settings
  - Items that each open a page or a document, such as recent plans
  - A short set of results or members under a search field
  - The list beside an item's details, with its current row marked
  - Items people put in their own order, such as an agenda
avoidWhen:
  - text: Data compared across columns, or rows people sort by a value.
    use: Table
  - text: Destinations in an application's navigation.
    use: Drawer
  - text: A hierarchy people expand, such as folders.
    use: Tree
  - text: One choice from a few options shown as rows.
    use: Radio
  - text: Content about one subject that stands on its own.
    use: Card
components:
  - List
examples:
  SettingsRows: overview
  OnAPane: example
  ExtraContent: example
  ListAnatomy: anatomy
  OpenFromRow: example
  CurrentRow: example
  CheckedRows: example
  Reorder: example
  NarrowRows: example
  OneTarget:
    role: do
    caption: One link per row, which covers the row.
  SeveralTargets:
    role: dont
    caption: 'Several links in a row: a press could open any of them.'
---

# List

## Variants

### On a pane

In a muted surface that holds only lists, the rows take the raised fill, so they stand out from it.

```tsx figure=OnAPane

```

### More content

More content can follow the description, such as a status.

```tsx figure=ExtraContent

```

### Density

Rows pack more or less tightly, from extra small to large, which changes only their padding, never the text.

## Anatomy

```tsx figure=ListAnatomy

```

1. **List** (`env-list`)
2. **Row** (`env-list-item`)
3. **Handle** (`env-list-item-handle`)
4. **Start** (`env-list-item-start > env-avatar`, `start`)
5. **Content** (`env-list-item-content`, `label`)
6. **Description** (`env-list-item-content > small`, `description`)
7. **Action** (`env-list-item > env-button:last-child`, `action`)

## Behaviour

### Rows that open something

A whole row can open what it names, through its one link, while its other controls stay pressable above it.

```tsx figure=OpenFromRow motion

```

### The current row

The row whose details show beside the list is marked as the current one.

```tsx figure=CurrentRow

```

### Checked rows

A checkbox at a row's start chooses it for an action on several rows at once.

```tsx figure=CheckedRows motion

```

### Put in order

Rows can each take a handle: drag it, or press <kbd>Space</kbd> and move the row with the arrow keys.

```tsx figure=Reorder motion

```

### Adapting to width

Labels and descriptions wrap, and an action that no longer fits beside the text moves below it.

```tsx figure=NarrowRows widths="32 16" sweep

```

## Rules

A row opens one thing, and its description tells it apart from the others.

```tsx figure=OneTarget

```

```tsx figure=SeveralTargets

```

### Content

Keep the description to one fact that tells items apart, such as who changed it and when. Name a repeated action after its row, such as More actions for Roadmap.

## Accessibility

### Keyboard

| Key                                                         | Action                                                       |
| ----------------------------------------------------------- | ------------------------------------------------------------ |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>             | Moves through the handles, links and controls of rows.       |
| <kbd>Space</kbd>, <kbd>Enter</kbd>                          | On a handle, lifts the row, or drops a lifted row.           |
| <kbd>↑</kbd>, <kbd>↓</kbd>, <kbd>Home</kbd>, <kbd>End</kbd> | While a row is lifted, moves it one place, or to either end. |
| <kbd>Esc</kbd>, <kbd>Tab</kbd>                              | While a row is lifted, puts it back.                         |
| <kbd>Alt</kbd>+<kbd>↑</kbd>, <kbd>Alt</kbd>+<kbd>↓</kbd>    | On a row's link or button, moves the row one place at once.  |

### envUI provides

- A native `ul` of `li` rows, announced with their count.
- `aria-current="true"` on the current row's target.
- Handles named Reorder and the row's label, described by how to move without a pointer.
- A polite announcement of each step of a move, with the position and the count.

### You provide

- A name for the list where its heading doesn't give one.
- One link or button marked `data-row-target` in an interactive row, with `draggable={false}` on a link.
- Names for a start checkbox and for actions, which say which row they act on.
- `textValue` on a reorderable row whose label isn't plain text, and the move in `onReorder`.

## Compose

### Usage

List.Root is a `ul` of List.Item rows, each with its `label`, a `description` below it, one short fact, an `action` at its end, such as a Button, and `children` after the description, such as a Badge. `start` holds content before the label, such as an Avatar, an icon or a Checkbox. Name the list with `aria-label` where its heading doesn't.

```tsx source=SettingsRows

```

#### Rows that open something

With `interactive`, a row reacts to hover, keyboard focus inside it and presses. Mark its one link or button `data-row-target`, which stretches it over the row; give a link `draggable={false}`, so a press that moves a little doesn't drag it. The row's other controls take `position: relative` to stay above it.

```tsx
<List.Item
  interactive
  label={
    <Link href="/plans/roadmap" underline={false} data-row-target draggable={false}>
      Roadmap
    </Link>
  }
  description="Updated today by Sam Lee"
  action={
    <IconButton
      variant="text"
      icon={<MoreHoriz />}
      aria-label="More actions for Roadmap"
      style={{ position: 'relative' }}
    />
  }
/>
```

#### The current and checked rows

`selected` marks the current row, such as the one whose details show beside the list, with the selected fill and `aria-current="true"` on its `data-row-target`, or on the row without one. A row whose `start` checkbox is checked takes the selected fill too; name each checkbox after its row.

```tsx
<List.Item interactive selected={id === current} label="Roadmap" />
```

#### Put in order

`onReorder` on List.Root gives each row a handle, moved by dragging it, by pressing it or by keyboard, and calls it with the row's index and the index it is dropped at. The application moves the item in its own state; nothing moves until it does. The rows are the list's children, directly or in arrays and fragments: List.Item elements, or elements of a row component that passes the props it doesn't use on to its List.Item. `textValue` names a row whose `label` isn't plain text, for its handle and the announcements.

```tsx
<List.Root
  aria-label="Agenda"
  onReorder={(from, to) =>
    setItems((list) => {
      const next = [...list];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item!);
      return next;
    })
  }
>
  {items.map(({ id, title, length }) => (
    <List.Item key={id} label={title} description={length} />
  ))}
</List.Root>
```

#### Density and panes

`density` is `xs`, `sm`, `md`, the default, or `lg`, and changes only the rows' block padding. Put a list directly in `<Surface background="muted" padding={3}>`, a muted Surface that holds only lists, and its rows take the raised fill.

```tsx
<Surface background="muted" padding={3}>
  <List.Root aria-label="Notifications" density="sm">
    …
  </List.Root>
</Surface>
```

### Composition

The parts are the list, `env-list`, each row, `env-list-item`, with its handle, `env-list-item-handle`, its start, `env-list-item-start`, its content, `env-list-item-content`, which holds the label and the description, and its action at the end. Rows render on the server; only the handle of a reorderable row needs the browser.

### Customize

`--env-list-item-container`, `--env-list-item-content`, `--env-list-item-selected` and `--env-list-item-selected-content` set the colors of one List, through `style` or CSS. Its hover, focus and press then follow them, as state layers; with none set, it keeps its own colors.

## Changelog

- **1.0.0**: List.Item takes `selected` for the current row, marked in the server's HTML, `start` for content before the label, such as an avatar or a checkbox, and `textValue`; List.Root takes `onReorder`, which moves rows by a drag handle, by keyboard, by a press and by pointer, with announcements. `GroupedRows` is `List.Root` and `Row` is `List.Item`, with the `env-list` and `env-list-item` classes; the page is `list`. List.Item's `title` is `label` and its `detail` is `description`. List.Root's `contrast` is gone: put the list directly in `<Surface background="muted" padding={3}>`, where its rows take the raised fill.
- **0.5.0**: `interactive` rows, which react to hover, focus inside them and presses, and open from anywhere through a `data-row-target`.
- **0.1.0**: GroupedRows and Row, with connected corners.
