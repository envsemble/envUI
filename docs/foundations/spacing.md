---
title: Spacing & density
summary: How space groups things, controls line up, the compact scale and tighter rows, and what corners say.
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

## Rules

envUI spaces things by how closely they belong: close inside a group, further apart between groups, and furthest between sections. You never pick a distance; you say what belongs together.

```tsx figure=Grouping

```

1. **Tight, inside a group**: A title and its description, or a label and its field, read as one thing.
2. **Roomier, between groups**: One field and the next, or a form and its buttons, stay apart but together.
3. **The most, between sections**: Profile and notifications are separate topics, so the widest space parts them.

### Components bring their own padding

The space inside a button, a field or a card is part of the component, so it looks the same wherever it goes. What a screen arranges is the space between things.

### Things line up

Fields, menus, toggles and buttons of one size are exactly as tall as each other, so a toolbar or a form row lines up without any adjusting.

```tsx figure=Align

```

### Small, medium and large

Controls come in three sizes, and the controls of one size line up.

- Medium is the default.
- Small suits a table row or a dense toolbar.

## Options

How dense the whole app is, how tight the rows of a table are, and the corners that say what each thing is.

### Comfortable or compact

The whole of envUI comes in two scales. Compact makes every control, text, corner and space a step smaller at once, so a dense tool stays in proportion. An app uses one scale throughout.

```tsx figure=Scales

```

1. **Comfortable**: The default, with room to breathe: for websites and touch.
2. **Compact**: Everything a step smaller: for desktop tools people work in all day.

### Try it on this site

Choose Compact under Scale in the Display menu, at the top of the page, and this whole site becomes the compact scale.

### Tighter rows

Tables, lists and trees can pack their rows closer on their own, in either scale. Only the space in each row changes; the text keeps its size.

```tsx figure=Rows

```

1. **Tighter rows**: For scanning many records at once.
2. **Regular rows**: For reading row by row.

### Corners say what a thing is

The roundness of a corner tells you what you are looking at: a surface that holds things, a part inside it, something to act on, or a person.

```tsx figure=Shapes

```

1. **Surfaces**: Panes, cards and dialogs have the largest, softest corners.
2. **Inside a surface**: Rows, messages and tables sit inside with smaller corners, so they nest neatly.
3. **Fully rounded**: Buttons, fields, badges and switches have round ends: things you act on or read at a glance.
4. **Circles**: Pictures of people and buttons that are only an icon are round.

## Behaviour

### Big enough for a finger

On a touchscreen, controls and rows grow to a size a finger can hit, in either scale. With a mouse, they keep the size of their scale.

### Tall things keep sensible corners

A button one line tall has round ends. When its label wraps, or a field fills with people, the same corners make a rounded rectangle instead of a stretched pill.

```tsx figure=Tall

```

## Words to use

Ask an agent for space, density and shape in these words; envUI turns each into the right amount of space, the right size or the right corner, so the result matches the rest of the app.

| Words                   | In code                                                                                              | Use for                                                                               |
| ----------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| More room between these | The next larger step of the `gap` that parts them, on their parent.                                  | Moves two things or two sections further apart, to the next larger step.              |
| Group these closer      | Wrap them in their own Column or Row with a smaller `gap`, inside the larger one.                    | Pulls things that belong together into one tight group, such as a title and its line. |
| Separate sections       | A larger `gap` between them, never a line.                                                           | Gives unrelated parts of a page the widest space, instead of a line between them.     |
| Line these up           | One `size` for every control in the row, and `align="center"` on the Row.                            | Gives controls in one row the same size, so their tops and bottoms meet.              |
| A small button          | `size="sm"`, `"md"` (the default) or `"lg"` on a control.                                            | One of the three control sizes, small, medium or large; medium is the default.        |
| Compact                 | `scale="compact"` on the root Theme: every control height, gap, type size and corner a step smaller. | Makes the whole app denser: smaller controls, text, corners and space everywhere.     |
| Comfortable             | `scale="comfortable"`, the default.                                                                  | The default scale, with more room, for websites and touch.                            |
| Tighter rows            | `density="sm"` or `"xs"` on a Table, List or Tree; the text keeps its size.                          | Makes the rows of a table or list shorter, while their text stays the same size.      |
| On a surface            | Surface for a plain pane, Card for a content surface; both keep `--env-radius-surface`.              | Puts content on a pane or card with the soft corners of a surface.                    |
| Fully rounded           | `--env-radius-full`, as Composition says.                                                            | Gives an action round ends; a tall one keeps the same corners rather than a pill.     |

## Compose

### Usage

```tsx
import { Button, Column, Surface, Table, Text, TextField, Theme } from '@envsemble/envui';
import '@envsemble/envui/styles.css';

// Padding is inside the surface; gap is between its children.
<Surface padding={5} render={<Column gap={4} />}>
  <Text render={<h2 />} variant="title">
    Workspace
  </Text>
  <Text>Shared plans and notes for the project.</Text>
</Surface>;

// A desktop productivity app: one compact scale for the whole window, and tighter rows.
<Theme theme="light" scale="compact">
  <TextField label="Title" defaultValue="Quarterly report" />
  <Button>Rename</Button>
  <Table.Root aria-label="Reports" density="sm">
    …
  </Table.Root>
</Theme>;
```

| Prop                          | Takes                                                                                                                           |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `gap`, `padding`              | Spacing steps 0–9 on Row, Column, Grid, Box and Surface; 0 to 4 rem in the comfortable scale, smaller in compact                |
| Theme scale                   | comfortable or compact; inherited from the enclosing Theme, comfortable outside any; written to `data-env-scale`                |
| ThemePreferenceProvider scale | As on Theme, for its boundary and the document root; left out, it inherits `<html data-env-scale>`                              |
| createThemeBootstrapScript    | `scale: 'compact'` writes `data-env-scale="compact"` to the root before the first paint                                         |
| Control `size`                | sm, md or lg on Button, IconButton, the fields, Select, Combobox, DatePicker, SegmentedControl, Pagination and the rail of Tabs |
| Row `density`                 | xs, sm, md or lg on Table.Root, Tree and List.Root: only the rows' block padding changes                                        |
| Touch minimum                 | 2.75 rem: every control grows to it under a coarse pointer                                                                      |

#### The words of the figures

- **Tight, inside a group**: `gap` 1–3: a heading and its description, a label and its value, short lines that read as one block.
- **Roomier, between groups**: `gap` 4–5: the fields of a form, a form and its actions, the groups of a section.
- **The most, between sections**: `gap` 6–9: the sections of a page or a settings pane.
- **Components bring their own padding**: don't pad a Button, field or Card from outside; arrange the space between them.
- **Big enough for a finger**: nothing to do; controls grow to the touch minimum under a coarse pointer, as [Touch](#touch) says.

### Composition

#### Two axes of density

- **Scale** is the size of the whole system, `comfortable` or `compact`: it switches every size token at once. Compact is about 0.8 of comfortable with type a step smaller, for desktop productivity apps. Icons keep a 1 rem floor; borders and focus rings keep their widths.
- **Row density** is how tightly Table, Tree and List pack their rows: `xs` to `lg`, padding only.

Within a scale, `size` picks one of three control heights for a deliberate local difference; every control of one size lines up. A control without a size takes its container's `--env-control-height`, `md` unless the container sets another, as a table cell does with `sm`.

#### Guidelines

- The parent owns gaps, through Row, Column and Grid; each component owns its padding. Text has no outer margins.
- Use relative units; let text wrap and controls grow with their content. In your own grids, `minmax(0, 1fr)` tracks, `min-inline-size: 0` on flex children and `max-inline-size: 100%` on media.
- Choose Surface for a plain pane and Card for a content surface, and keep their corners.
- Use `--env-radius-full` where a pill is meant, never `50%` or `9999px`: one line tall it draws round ends, and an element that grows taller, such as a wrapping button or a field whose chips wrap, keeps the same corners. `50%` is only for parts that are always square, such as avatars and round icon buttons.
- **One scale per app or window**, on the root Theme or ThemePreferenceProvider; desktop productivity apps take compact, web and touch apps comfortable. Rendered on the server, pass `scale` to the provider too, so the first paint has it.
- **Another scale only at a Theme boundary around a whole region**, such as a docked inspector: `<Theme {...useTheme()} scale="compact">`.
- **Rows match:** a button beside a field takes its size, and a table's toolbar follows its rows.
- Choose a row density for how people read: `sm` or `xs` for scanning, `md` or `lg` for reading row by row.
- Read the tokens in application CSS, such as `block-size: var(--env-control-height-sm)`.

### Customize

Inside a Theme these tokens follow the theme, its scale and the reader's text size. Their values in each scale are under [Sizes in each scale](#sizes-in-each-scale), and every value is on the Design tokens page of the Docs.

| Token                                                             | Holds                                                                                                                                                                    |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--env-space-1` … `--env-space-9`                                 | The spacing scale                                                                                                                                                        |
| `--env-radius-xs`                                                 | 0.25 rem: small marks, checkboxes and color swatches                                                                                                                     |
| `--env-radius-sm`                                                 | Inner rows, important actions, toasts and thumbnails                                                                                                                     |
| `--env-radius-lg`                                                 | Text fields, tables and drop zones                                                                                                                                       |
| `--env-radius-surface`                                            | Panes, cards and the outside of a row group                                                                                                                              |
| `--env-radius-full`                                               | Rounded ends: buttons, fields, navigation items, badges; half the tallest single-line control, 1.5 rem at most, so a taller element is a rounded rectangle, never a pill |
| `--env-control-height`, `--env-control-height-sm` / `-md` / `-lg` | Control heights, to line up with                                                                                                                                         |
| `--env-control-icon-size`                                         | 1 rem: the icon inside controls                                                                                                                                          |

#### Corners by what they are

The Usage guide shows four kinds of corner; small marks are a fifth, for code. Their tokens:

| In the Usage guide | Token and where it is used                                                                                                              |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------- |
| Surfaces           | `--env-radius-surface`: panes, cards, dialogs, popups and the outside of a row group                                                    |
| Inside a surface   | `--env-radius-lg` for alerts, tables, text areas and drop zones; `--env-radius-sm` for list rows, menu items, tabs, toasts and tooltips |
| Fully rounded      | `--env-radius-full`: buttons, single-line fields, badges, switches, segmented controls and navigation items                             |
| Circles            | `50%`: avatars and icon buttons, which are always square                                                                                |
| Small marks        | `--env-radius-xs`: checkboxes and color swatches, which read as boxes                                                                   |

#### Sizes in each scale

At the default 16 px root; every value is a token in rem.

| Token                                                          | Comfortable           | Compact               |
| -------------------------------------------------------------- | --------------------- | --------------------- |
| `--env-control-height-sm` / `-md` / `-lg`                      | 32 / 40 / 48          | 26 / 32 / 38          |
| `--env-row-height` (menu, Select and Combobox rows)            | 36                    | 28                    |
| `--env-row-padding-block-xs` / `-sm` / `-md` / `-lg`           | 2 / 4 / 8 / 12        | 2 / 3 / 4 / 6         |
| `--env-space-1` … `--env-space-9`                              | 4, 8, 12, 16, 24 … 64 | 4, 6, 10, 12, 20 … 52 |
| `--env-font-size-caption` / `-body-small` / `-label`           | 12 / 14 / 14          | 11 / 12 / 13          |
| `--env-font-size-body` / `-heading-small` / `-heading`         | 15 / 16 / 18          | 13 / 14 / 16          |
| `--env-icon-size-sm` / `-md` / `-lg`                           | 16 / 18 / 20          | 16 / 16 / 18          |
| `--env-radius-sm` / `--env-radius-lg` / `--env-radius-surface` | 8 / 16 / 28           | 6 / 12 / 22           |
| `--env-field-floating-height`                                  | 56                    | 44                    |
| `--env-top-bar-height` / `--env-title-bar-height`              | 52 / 40               | 42 / 32               |
| `--env-control-target-min` / `--env-control-height-touch`      | 24 / 44               | 24 / 44               |

#### Touch

- Under a coarse pointer, `@media (pointer: coarse)`, controls and rows grow to at least 44 px in either scale, and entered text becomes 1 rem so phones don't zoom into a field. A touchscreen laptop used with a mouse keeps the desktop density.
- A control's own box is its hit area, so a press always reaches the control it lands on.
- Grow your own targets the same way, since `--env-control-height` keeps its value under touch:

```css
.my-target {
  block-size: var(--env-control-height);
}
@media (pointer: coarse) {
  .my-target {
    block-size: max(var(--env-control-height), var(--env-control-height-touch));
  }
}
```

- A link in text, a breadcrumb and a Switch's track stay smaller, under WCAG 2.5.8's spacing exception; with a mouse every target is at least 24 px.

TypeScript declarations provide the complete public API.
