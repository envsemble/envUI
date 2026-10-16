---
title: List
summary: A vertical list of connected rows, each with a title, a detail and an action, that can open what it names.
status: beta
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
useWhen:
  - Related items with a title, a short detail and an action each, such as the sections of a settings page.
  - Items that each open a page or a document, such as recent plans (`interactive`).
  - A short set of results or members under a search field.
avoidWhen:
  - text: Data compared across columns, or rows people sort and select.
    use: Table
  - text: Destinations in an application's navigation.
    use: NavList
  - text: A hierarchy people expand, such as folders.
    use: Tree
  - text: One choice from a few options shown as rows.
    use: Radio
  - text: Content about one subject that stands on its own.
    use: Card
related:
  - card
  - table
  - nav-list
  - surface
  - radio
  - spacing
components:
  - List
---

# List

## Overview

A list is a column of connected rows on the shared row fill: the first and last rows keep large outer corners, and rows join with small inner ones. List.Root is a native `<ul>` and each List.Item an `<li>` with a title, an optional muted detail and an action at its end. A row can open what it names: with `interactive`, it reacts to hover, presses and keyboard focus like a clickable card, and the link marked `data-row-target` covers the row.

```tsx example=SettingsRows

```

## Anatomy

1. **List** (List.Root): a `ul` of rows 0.125 rem apart. With `contrast`, a muted pane with 0.75 rem padding around the rows.
2. **Row** (List.Item): at least 3.5 rem tall, with 0.75 rem block and 1.5 rem inline padding, so its text stays clear of the large corners.
3. **Title** (`title`): the row's main text, 0.875 rem in the row text color.
4. **Detail** (optional, `detail`): a `small` below the title in the muted row detail color.
5. **More content** (optional, `children`): after the title and the detail, such as a Badge.
6. **Action** (optional, `action`): a control at the end of the row, 0.75 rem from the text.

## Variants and sizes

| Variant    | Use for                                                                                                 |
| ---------- | ------------------------------------------------------------------------------------------------------- |
| Default    | Rows on the page or in a dialog, on the shared row fill.                                                |
| `contrast` | Rows that sit on a muted pane of their own, in the alternate row fill, so they stand out from the pane. |

<!-- specimen: Corners -->

- One row alone keeps the 1.75 rem outer corners on every side; connected rows keep them at the outer ends and join with 0.5 rem corners.
- The row is as wide as the list. Titles and details wrap, also within a long word or an address; when the action no longer fits beside the text, it moves below it.
- Radio rows, Select options and the rows of a standard menu keep the same 1.5 rem inset.

## States and behaviour

- **Plain rows** don't respond to the pointer: their controls keep their own states.
- **Interactive rows** (`interactive`): the row darkens on hover and while keyboard focus is anywhere inside it, and further while it is pressed; a link or button in its text doesn't also shrink as it is pressed.
- **The row target**: mark one link or button in the row's text `data-row-target`. It covers the row, so a press anywhere on the row follows it, and keyboard and screen reader users still meet one link. Give a link `draggable={false}` too, so a press that moves a little opens it instead of dragging it. The row shows a press on the target, not on its other controls.
- **Controls above the target**: the row's other links and buttons need `position: relative` to stay above the target, and so does anything whose tooltip should show; text under the target can't be selected.

## Content guidelines

- Write the title as the item's name, such as a setting's or a document's, in sentence case.
- Keep the detail to one short fact that helps tell items apart, such as who changed it and when, or a count.
- Name the action with a verb, and add what it acts on to its accessible name when the label repeats: "More actions for Roadmap".
- Keep the same kind of item in one list, and the same kind of action at the end of every row.

## Do and don't

### Do

- Name a list with `aria-label` where its heading doesn't, such as "Recent plans".
- Make a row interactive when it opens what it names, and mark its title link `data-row-target`.
- Use `contrast` when the rows sit on a muted pane.

### Don't

- Don't put several targets in one row, or a row target inside a row without `interactive`.
- Don't use a list for data people compare across columns; use [Table](../components/table.md).
- Don't put a long form or several actions in a row; open them from the row instead.

## Accessibility

### Keyboard

| Key                                             | Action                                                                                        |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves focus through the links and controls of the rows; the rows themselves aren't focusable. |
| <kbd>Enter</kbd>                                | Follows the row's link or presses its button.                                                 |

### envUI provides

- A native `ul` of `li` rows, so assistive technology announces a list and its count of items.
- A row target that adds no element of its own: the row is reached and named by its one link or button.
- The row's highlight while keyboard focus is inside an interactive row.

### You provide

- An `aria-label` or `aria-labelledby` on List.Root where the list needs a name.
- A link or button in the title of an interactive row, marked `data-row-target`, and `draggable={false}` on a link.
- `position: relative` on the row's other controls, and accessible names that say which row they act on.

## Examples

### Rows that open something

Each title link covers its row, so a press anywhere on the row opens the plan; the More actions button stays above it and names its row.

```tsx example=OpenFromRow

```

### Rows on a pane

`contrast` puts the rows on a muted pane of their own, in the alternate row fill.

```tsx example=OnAPane

```

### More content in a row

Children follow the title and the detail, such as a Badge with the item's status.

```tsx example=ExtraContent

```

## Changelog

- **1.0.0**: `GroupedRows` is `List.Root` and `Row` is `List.Item`, with the `env-list` and `env-list-item` classes; the page is `list`.
- **0.5.0**: `interactive` rows, which react to hover, focus inside them and presses, and open from anywhere through a `data-row-target`.
- **0.1.0**: GroupedRows and Row, with connected corners.
