---
title: List
summary: A vertical list of connected rows, each with a title, a detail and an action, that can open what it names, show the current one and be put in order.
status: stable
since: 0.1.0
category: Layout & surfaces
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
  - Related items with a title, a short detail and an action each, such as the sections of a settings page.
  - Items that each open a page or a document, such as recent plans (`interactive`).
  - A short set of results or members under a search field.
  - The list beside an item's details, with its current row marked (`selected`).
  - Items people put in their own order, such as the slides of a deck or an agenda (`onReorder`).
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
related:
  - card
  - table
  - drawer
  - surface
  - radio
  - spacing
components:
  - List
---

# List

## Overview

A list is a column of connected rows on the shared row fill: the first and last rows keep large outer corners, and rows join with small inner ones. List.Root is a native `<ul>` and each List.Item an `<li>` with a title, an optional muted detail and an action at its end. A row can open what it names: with `interactive`, it reacts to hover, presses and keyboard focus like a clickable card, and the link marked `data-row-target` covers the row. A row can be the current one (`selected`), lead with an avatar or a checkbox (`start`), and, with `onReorder` on the list, be moved by its handle.

```tsx example=SettingsRows

```

## Anatomy

1. **List** (List.Root): a `ul` of rows 0.125 rem apart. In a muted Surface that holds only lists, such as `<Surface background="muted" padding={3}>`, the rows take the raised fill; in a surface with more in it, such as a card, they keep the row fill. `density` sets how tightly the rows pack, from `xs` to `lg`; it changes only their block padding. `onReorder` makes the rows reorderable.
2. **Row** (List.Item): at `md`, the default, at least 3.5 rem tall, with 0.75 rem block and 1.5 rem inline padding, so its text stays clear of the large corners.
3. **Drag handle** (with `onReorder`): a small ghost IconButton with the DragIndicator icon at the start of the row, named "Reorder" and the row's label.
4. **Start** (optional, `start`): content before the label, 0.5 rem apart, such as an Avatar, an icon or a Checkbox.
5. **Label** (`label`): the row's main text, 0.875 rem in the row text color. Where it isn't a string, `textValue` gives the handle and the announcements its text.
6. **Description** (optional, `description`): a `small` below the label in the muted row detail color.
7. **More content** (optional, `children`): after the title and the detail, such as a Badge.
8. **Action** (optional, `action`): a control at the end of the row, 0.75 rem from the text.

## Variants and sizes

| Variant                | Use for                                                                                                                  |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Default                | Rows on the page or in a dialog, on the shared row fill.                                                                 |
| On a pane of their own | Rows in a `<Surface background="muted">` that holds only lists, in the raised row fill, so they stand out from the pane. |
| Current row            | The row whose details show beside the list (`selected`), in the selected fill.                                           |
| Checked rows           | Rows chosen with a Checkbox in `start`, which take the selected fill while it is checked.                                |
| Reorderable            | Rows people put in order (`onReorder`), each with a drag handle at its start.                                            |

<!-- specimen: Corners -->

- One row alone keeps the 1.75 rem outer corners on every side; connected rows keep them at the outer ends and join with 0.5 rem corners.
- The row is as wide as the list. Titles and details wrap, also within a long word or an address; when the action no longer fits beside the text, it moves below it.
- Radio rows, Select options and the rows of a standard menu keep the same 1.5 rem inset.

## States and behaviour

- **Plain rows** don't respond to the pointer: their controls keep their own states.
- **Interactive rows** (`interactive`): the row darkens on hover and while keyboard focus is anywhere inside it, and further while it is pressed; a link or button in its text doesn't also shrink as it is pressed.
- **The row target**: mark one link or button in the row's text `data-row-target`. It covers the row, so a press anywhere on the row follows it, and keyboard and screen reader users still meet one link. Give a link `draggable={false}` too, so a press that moves a little opens it instead of dragging it. The row shows a press on the target, not on its other controls.
- **Controls above the target**: the row's other links and buttons need `position: relative` to stay above the target, and so does anything whose tooltip should show; text under the target can't be selected. The start slot, with the drag handle, stays above it on its own.
- **Current row** (`selected`): the row takes the selected fill, and its row target, or the row itself without one, gets `aria-current="true"` in the server's HTML. The target is found among the elements in `label`, `description` and `children` as written, not inside other components. Mark one row at a time.
- **Checked rows**: a checked checkbox in the start slot gives its row the selected fill, so the chosen rows stand out.
- **Reordering** (`onReorder`): each row's handle moves it. By keyboard, <kbd>Space</kbd> or <kbd>Enter</kbd> on the handle lifts the row, <kbd>↑</kbd> and <kbd>↓</kbd> move it while the others make room, <kbd>Home</kbd> and <kbd>End</kbd> move it to either end, <kbd>Space</kbd> or <kbd>Enter</kbd> drops it, and <kbd>Esc</kbd>, <kbd>Tab</kbd> or leaving the handle puts it back. A press of the handle that doesn't drag, such as a click, voice control's or a screen reader's, lifts the row the same way, and another drops it; while the row is lifted the handle is pressed. With a pointer, the row follows the handle as it is dragged, and the scroll area around the list scrolls near its edges. <kbd>Alt</kbd>+<kbd>↑</kbd> and <kbd>Alt</kbd>+<kbd>↓</kbd> on a row target move its row one place at once. The rows are the list's children, directly or in arrays and fragments, so each gets its handle: List.Item elements, or elements of a row component that passes the props it doesn't use on to its List.Item, such as `function SlideRow({ slide, ...props }) { return <List.Item {...props} label={slide} />; }`. In development, the list reports rows left without a handle in the console.
- **The move**: nothing moves in the page until the row is dropped. The list then calls `onReorder(from, to)` with the row's index and its new one, the application moves the item in its own state, and focus stays on the handle or the row target that moved it. Rows move only vertically, in either text direction.
- **Announcements**: a polite live region announces each step with the row's label, its position and the count: picked up, by pointer with how to move it, as the handle's description says how by keyboard, moved, stopped at the start or the end of the list, dropped, or put back. The same announcement twice is announced twice.
- **On the server**: List.Root and List.Item render on the server. A list without `onReorder` ships no client code; a reorderable one adds the list's keys and announcements and each row's handle.

## Content guidelines

- Write the title as the item's name, such as a setting's or a document's, in sentence case.
- Keep the detail to one short fact that helps tell items apart, such as who changed it and when, or a count.
- Name the action with a verb, and add what it acts on to its accessible name when the label repeats: "More actions for Roadmap".
- Keep the same kind of item in one list, and the same kind of action at the end of every row.

## Do and don't

### Do

- Name a list with `aria-label` where its heading doesn't, such as "Recent plans".
- Make a row interactive when it opens what it names, and mark its title link `data-row-target`.
- Give the rows a pane of their own with a muted Surface that holds only the list.

### Don't

- Don't put several targets in one row, or a row target inside a row without `interactive`.
- Don't use a list for data people compare across columns; use [Table](../components/table.md).
- Don't put a long form or several actions in a row; open them from the row instead.

## Accessibility

### Keyboard

| Key                                                                      | Action                                                                                                 |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>                          | Moves focus through the handles, links and controls of the rows; the rows themselves aren't focusable. |
| <kbd>Enter</kbd>                                                         | Follows the row's link or presses its button.                                                          |
| <kbd>Space</kbd> or <kbd>Enter</kbd> on a handle, or a press of it       | Lifts the row, or drops a lifted row in its new place.                                                 |
| <kbd>↑</kbd>, <kbd>↓</kbd> on a lifted row's handle                      | Moves the row up or down one place.                                                                    |
| <kbd>Home</kbd>, <kbd>End</kbd> on a lifted row's handle                 | Moves the row to the start or the end of the list.                                                     |
| <kbd>Esc</kbd> or <kbd>Tab</kbd> on a lifted row's handle                | Puts the row back where it was.                                                                        |
| <kbd>Alt</kbd>+<kbd>↑</kbd>, <kbd>Alt</kbd>+<kbd>↓</kbd> on a row target | Moves the row up or down one place at once.                                                            |

### envUI provides

- A native `ul` of `li` rows, so assistive technology announces a list and its count of items.
- A row target that adds no element of its own: the row is reached and named by its one link or button.
- The row's highlight while keyboard focus is inside an interactive row.
- `aria-current="true"` on the current row's target.
- Drag handles named "Reorder" and the row's label, in the provider's language, described by how to move the row without a pointer, and pressed (`aria-pressed`) while their row is lifted.
- A polite live region that announces each step of a move with the position and the count, and the start or the end of the list.
- Focus kept on the handle or the row target that moved a row.

### You provide

- An `aria-label` or `aria-labelledby` on List.Root where the list needs a name.
- A link or button in the title of an interactive row, marked `data-row-target`, and `draggable={false}` on a link.
- `position: relative` on the row's other controls, and accessible names that say which row they act on.
- An accessible name for a checkbox in the start slot, such as "Choose Roadmap.md".
- `textValue` on a reorderable row whose label isn't plain text, and the move itself in `onReorder`.

## Examples

### Rows that open something

Each title link covers its row, so a press anywhere on the row opens the plan; the More actions button stays above it and names its row.

```tsx example=OpenFromRow

```

### Rows on a pane

A muted Surface that holds only the list puts the rows on a pane of their own, in the raised row fill.

```tsx example=OnAPane

```

### The current row

An avatar leads each row, and choosing a person marks their row as the current one, as for a list beside the person's details.

```tsx example=CurrentRow

```

### Checked rows

A checkbox in the start slot chooses rows for an action on several at once, and a checked row takes the selected fill.

```tsx example=CheckedRows

```

### Put in order

With `onReorder`, each row gets a handle: drag it, or press <kbd>Space</kbd> on it and move the row with the arrow keys. The list reports the move, and the application moves the item.

```tsx example=Reorder

```

### More content in a row

Children follow the title and the detail, such as a Badge with the item's status.

```tsx example=ExtraContent

```

## Changelog

- **1.0.0**: List.Item takes `selected` for the current row, marked in the server's HTML, `start` for content before the label, such as an avatar or a checkbox, and `textValue`; List.Root takes `onReorder`, which moves rows by a drag handle, by keyboard, by a press and by pointer, with announcements. `GroupedRows` is `List.Root` and `Row` is `List.Item`, with the `env-list` and `env-list-item` classes; the page is `list`. List.Item's `title` is `label` and its `detail` is `description`. List.Root's `contrast` is gone: put the list directly in `<Surface background="muted" padding={3}>`, where its rows take the raised fill.
- **0.5.0**: `interactive` rows, which react to hover, focus inside them and presses, and open from anywhere through a `data-row-target`.
- **0.1.0**: GroupedRows and Row, with connected corners.
