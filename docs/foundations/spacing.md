---
title: Spacing & density
summary: How spacing groups content, how controls align, compact density and corner radius.
aliases:
  - scale
  - density
  - compact
  - comfortable
  - control size
  - row density
  - corners
  - radius
  - touch target
avoidWhen:
  - text: The size and style of text, which follow the scale too.
    see: typography
  - text: How a layout changes with the width it has.
    see: responsive
  - text: Things one under another, with a gap between them.
    use: Column
  - text: Things side by side, with a gap between them.
    use: Row
  - text: Things in columns and rows.
    use: Grid
  - text: A plain pane, with a surface's corners.
    use: Surface
  - text: A content surface, with a surface's corners.
    use: Card
  - text: A control in one of three sizes.
    use: Button
  - text: A field in one of three sizes.
    use: TextField
  - text: Rows of records at a density of their own.
    use: Table
  - text: Rows of a list at a density of their own.
    use: List
  - text: Rows of a tree at a density of their own.
    use: Tree
  - text: Colors, corners and space of an application's own.
    see: customizing
examples:
  Grouping: example
  Align: example
  Scales: example
  Rows: example
  Shapes: example
  Tall: example
---

# Spacing & density

## Options

Two scales size every control, text, corner and space at once: compact, the default under a mouse, and comfortable, the default on touch. Tables, lists and trees also take a row density of their own.

```tsx figure=Scales

```

1. **Comfortable**
2. **Compact**

```tsx figure=Rows

```

1. **Tighter rows**
2. **Regular rows**

```tsx figure=Shapes

```

1. **Surfaces**: Panes, cards and dialogs have the largest, softest corners.
2. **Inside a surface**: Rows, messages, tables and fields sit inside with smaller corners, so they nest neatly.
3. **Fully rounded**: Buttons, badges and switches have round ends: things you act on or read at a glance.
4. **Circles**: Pictures of people and buttons that are only an icon are round.

## Behaviour

```tsx figure=Tall

```

## Rules

Space says what belongs together: a small gap inside a group, a larger one between groups, the largest between sections. Components bring their own padding; a layout sets only the gaps between them, and controls of one size line up.

```tsx figure=Grouping

```

1. **Tight, inside a group**: A title and its description, or a label and its field, read as one thing.
2. **Roomier, between groups**: One field and the next, or a form and its buttons, stay apart but together.
3. **The most, between sections**: Profile and notifications are separate topics, so the widest space parts them.

```tsx figure=Align

```

## Compose

### Usage

One scale for the whole application, in its theme. `gap` and `padding` take the spacing steps, and `density` the rows.

```tsx
import { Column, Surface, Table, Text, Theme } from '@envsemble/envui';

<Theme theme="light" scale="compact">
  <Surface padding={5} render={<Column gap={4} />}>
    <Text render={<h2 />} variant="title">
      Reports
    </Text>
    <Table.Root aria-label="Reports" density="sm">
      …
    </Table.Root>
  </Surface>
</Theme>;
```

### Customize

Values at the default 16 px root.

#### Spacing

| Token           | Comfortable | Compact    | Use                                                               |
| --------------- | ----------- | ---------- | ----------------------------------------------------------------- |
| `--env-space-1` | `0.25rem`   | `0.25rem`  | Spacing step 1: 4 px, the same in both scales.                    |
| `--env-space-2` | `0.5rem`    | `0.375rem` | Spacing step 2: 8 px in the comfortable scale, 6 px in compact.   |
| `--env-space-3` | `0.75rem`   | `0.625rem` | Spacing step 3: 12 px in the comfortable scale, 10 px in compact. |
| `--env-space-4` | `1rem`      | `0.75rem`  | Spacing step 4: 16 px in the comfortable scale, 12 px in compact. |
| `--env-space-5` | `1.5rem`    | `1.25rem`  | Spacing step 5: 24 px in the comfortable scale, 20 px in compact. |
| `--env-space-6` | `2rem`      | `1.625rem` | Spacing step 6: 32 px in the comfortable scale, 26 px in compact. |
| `--env-space-7` | `2.5rem`    | `2rem`     | Spacing step 7: 40 px in the comfortable scale, 32 px in compact. |
| `--env-space-8` | `3rem`      | `2.375rem` | Spacing step 8: 48 px in the comfortable scale, 38 px in compact. |
| `--env-space-9` | `4rem`      | `3.25rem`  | Spacing step 9: 64 px in the comfortable scale, 52 px in compact. |

#### Corners

| Token                     | Comfortable                    | Compact                           | Use                                                                                                                                                                                                                                                                   |
| ------------------------- | ------------------------------ | --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--env-radius-control`    | `0.75rem`                      | `0.625rem`                        | The corners of every control: buttons in each variant, text fields, the triggers of Select, Combobox and the pickers, a slider, and a segmented control's track. One shape, which follows the theme's corners.                                                        |
| `--env-radius-full`       | `calc(max(3rem, 2.75rem) / 2)` | `calc(max(2.75rem, 2.75rem) / 2)` | The full corner of a pill, such as a button, a field, a badge or a navigation item: half the tallest single-line control, the large control height or the touch height, whichever is more, so anything taller keeps the same corners and becomes a rounded rectangle. |
| `--env-radius-lg`         | `1rem`                         | `0.75rem`                         | Medium corners: tables, alerts and other blocks.                                                                                                                                                                                                                      |
| `--env-radius-md`         | `0.75rem`                      | `0.625rem`                        | Corners between sm and lg, such as a navigation item's indicator.                                                                                                                                                                                                     |
| `--env-radius-none`       | `0rem`                         | `0rem`                            | Square corners.                                                                                                                                                                                                                                                       |
| `--env-radius-row-inner`  | `0.5rem`                       | `0.375rem`                        | The corners where connected rows meet: small, so the rows read as one block.                                                                                                                                                                                          |
| `--env-radius-row-outer`  | `1.75rem`                      | `1.375rem`                        | The outer corners of connected rows, the first row's top and the last row's bottom: a surface's.                                                                                                                                                                      |
| `--env-radius-row-single` | `1.75rem`                      | `1.375rem`                        | A row that stands alone, with the outer corners on every side.                                                                                                                                                                                                        |
| `--env-radius-sm`         | `0.5rem`                       | `0.375rem`                        | Small corners: chips, menu rows, list rows inside a surface.                                                                                                                                                                                                          |
| `--env-radius-surface`    | `1.75rem`                      | `1.375rem`                        | The rounded corners of surfaces, dialogs and popups.                                                                                                                                                                                                                  |
| `--env-radius-xl`         | `1.75rem`                      | `1.375rem`                        | The largest corners of the scale.                                                                                                                                                                                                                                     |
| `--env-radius-xs`         | `0.25rem`                      | `0.1875rem`                       | The smallest corners, such as a checkbox's box and a color swatch.                                                                                                                                                                                                    |

#### Controls

| Token                        | Comfortable | Compact     | Use                                                                                                                                                                                                                                  |
| ---------------------------- | ----------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--env-control-border-width` | `1px`       | `1px`       | The hairline border of controls and fields, which stays 1 px in both scales.                                                                                                                                                         |
| `--env-control-font-size`    | `0.9375rem` | `0.8125rem` | The text of a control and of a field's value: the body size, and 1 rem under a coarse pointer, where smaller text makes touch browsers zoom into a focused field.                                                                    |
| `--env-control-gap`          | `0.4375rem` | `0.375rem`  | The space between a control's icon and its label.                                                                                                                                                                                    |
| `--env-control-height`       | `2.5rem`    | `2.25rem`   | The height a control takes when it sets no size: md, unless a container sets it to another control height for what it holds, as a table cell does with sm.                                                                           |
| `--env-control-height-lg`    | `3rem`      | `2.75rem`   | The large control height, for a control of size lg, such as a prominent call to action.                                                                                                                                              |
| `--env-control-height-md`    | `2.5rem`    | `2.25rem`   | The medium control height, every control's default size.                                                                                                                                                                             |
| `--env-control-height-sm`    | `2rem`      | `1.75rem`   | The small control height: a control of size sm, the actions in a table cell, a title bar or a panel header.                                                                                                                          |
| `--env-control-height-touch` | `2.75rem`   | `2.75rem`   | The height every control grows to under a coarse pointer, whatever the scale, and the width of a button: its own box is its hit area. Rows grow to it too.                                                                           |
| `--env-control-icon-size`    | `1rem`      | `1rem`      | The icon in a control. 1 rem in both scales: icons never get smaller than this.                                                                                                                                                      |
| `--env-control-target-min`   | `1.5rem`    | `1.5rem`    | The smallest a pressable target may be in either dimension, in both scales: WCAG 2.2's 24 px minimum. A control smaller than its size, such as a segment inside a small rail or an action inside a small field, keeps at least this. |

#### Rows

| Token                             | Comfortable | Compact     | Use                                                                                                                                                        |
| --------------------------------- | ----------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--env-row-content-height`        | `1.25rem`   | `1.25rem`   | The line a tree row reserves for its label and icon, 20 px in both scales; the row's density adds its block padding around it.                             |
| `--env-row-height`                | `2.25rem`   | `1.75rem`   | The day of a calendar, and the base of a popup's row: a menu's, a select's or a combobox's rows are a quarter rem taller.                                  |
| `--env-row-padding-block-lg`      | `0.75rem`   | `0.375rem`  | Row density lg.                                                                                                                                            |
| `--env-row-padding-block-md`      | `0.5rem`    | `0.25rem`   | Row density md: the default of tables and lists.                                                                                                           |
| `--env-row-padding-block-sm`      | `0.25rem`   | `0.125rem`  | Row density sm: a tree's default.                                                                                                                          |
| `--env-row-padding-block-xs`      | `0.125rem`  | `0rem`      | Row density xs: the block padding of each row of a data component, such as a table, a tree or a list.                                                      |
| `--env-row-padding-inline`        | `1.5rem`    | `1.25rem`   | Text in rows keeps clear of the large outer corners, whether a row stands alone or is connected.                                                           |
| `--env-tree-row-padding-block-lg` | `0.75rem`   | `0.4375rem` | A tree row's block padding at density lg: the row density's in the comfortable scale.                                                                      |
| `--env-tree-row-padding-block-md` | `0.5rem`    | `0.3125rem` | A tree row's block padding at density md: the row density's in the comfortable scale.                                                                      |
| `--env-tree-row-padding-block-sm` | `0.25rem`   | `0.25rem`   | A tree row's block padding at density sm, its default, so that a row is as tall as a menu row in either scale: the row density's in the comfortable scale. |

#### Pictures and counts

| Token                      | Comfortable | Compact  | Use                                                                                                    |
| -------------------------- | ----------- | -------- | ------------------------------------------------------------------------------------------------------ |
| `--env-badge-count-height` | `1.25rem`   | `1rem`   | The height, and the least width, of a counter badge and a diff stat.                                   |
| `--env-picture-size-lg`    | `3rem`      | `3rem`   | A picture beside a name with a second line, such as an account header.                                 |
| `--env-picture-size-md`    | `2rem`      | `2rem`   | A picture beside a name in a list, a comment or a toolbar: an avatar's default size.                   |
| `--env-picture-size-sm`    | `1.5rem`    | `1.5rem` | A small picture, beside compact text such as a combobox option or the application's name in a top bar. |
| `--env-picture-size-xl`    | `5.5rem`    | `5.5rem` | The largest picture, such as on a profile page or a sign-in screen.                                    |
