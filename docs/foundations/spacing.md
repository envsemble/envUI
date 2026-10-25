---
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
---

# Spacing & density

## React usage

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

### Props & contracts

| Name                          | Contract                                                                                                                        |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `gap`, `padding`              | Spacing steps 0–9 on Row, Column, Grid, Box and Surface; 0 to 4 rem in the comfortable scale, smaller in compact                |
| Theme scale                   | comfortable or compact; inherited from the enclosing Theme, comfortable outside any; written to `data-env-scale`                |
| ThemePreferenceProvider scale | As on Theme, for its boundary and the document root; left out, it inherits `<html data-env-scale>`                              |
| createThemeBootstrapScript    | `scale: 'compact'` writes `data-env-scale="compact"` to the root before the first paint                                         |
| Control `size`                | sm, md or lg on Button, IconButton, the fields, Select, Combobox, DatePicker, SegmentedControl, Pagination and the rail of Tabs |
| Row `density`                 | xs, sm, md or lg on Table.Root, Tree and List.Root: only the rows' block padding changes                                        |
| Touch minimum                 | 2.75 rem: every control grows to it under a coarse pointer                                                                      |

### Tokens for application CSS

Inside a Theme these follow the theme, its scale and the reader's text size. Their values in each scale are under [Sizes in each scale](#sizes-in-each-scale), and every value is on the Design tokens page of the Docs.

| Name                                                              | Contract                                                                                                                                                                 |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--env-space-1` … `--env-space-9`                                 | The spacing scale                                                                                                                                                        |
| `--env-radius-xs`                                                 | 0.25 rem: small marks, checkboxes and color swatches                                                                                                                     |
| `--env-radius-sm`                                                 | Inner rows, important actions, toasts and thumbnails                                                                                                                     |
| `--env-radius-lg`                                                 | Text fields, tables and drop zones                                                                                                                                       |
| `--env-radius-surface`                                            | Panes, cards and the outside of a row group                                                                                                                              |
| `--env-radius-full`                                               | Rounded ends: buttons, fields, navigation items, badges; half the tallest single-line control, 1.5 rem at most, so a taller element is a rounded rectangle, never a pill |
| `--env-control-height`, `--env-control-height-sm` / `-md` / `-lg` | Control heights, to line up with                                                                                                                                         |
| `--env-control-icon-size`                                         | 1 rem: the icon inside controls                                                                                                                                          |

## The words people use

The Site's Spacing & density page explains space, density and corners without values, so readers can ask for them in words. Each phrase it teaches maps to one change here:

| Words on the Site                    | What it means in code                                                                               |
| ------------------------------------ | --------------------------------------------------------------------------------------------------- |
| Tight, inside a group                | `gap` 1–3: a heading and its description, a label and its value, short lines that read as one block |
| Roomier, between groups              | `gap` 4–5: the fields of a form, a form and its actions, the groups of a section                    |
| The most, between sections           | `gap` 6–9: the sections of a page or a settings pane                                                |
| More room between these              | The next larger step of the gap that parts them, on their parent                                    |
| Group these closer                   | Wrap them in their own Column or Row with a smaller gap, inside the larger one                      |
| Separate sections                    | A larger gap between them, never a line                                                             |
| Line these up                        | One `size` for every control in the row, and `align="center"` on the Row                            |
| A small button; small, medium, large | `size="sm"`, `"md"` (the default) or `"lg"` on a control                                            |
| Compact                              | `scale="compact"` on the root Theme: every control height, gap, type size and corner a step smaller |
| Comfortable                          | `scale="comfortable"`, the default                                                                  |
| Tighter rows                         | `density="sm"` or `"xs"` on a Table, List or Tree; the text keeps its size                          |
| Big enough for a finger              | Nothing to do: controls grow to the touch minimum under a coarse pointer; see [Touch](#touch)       |
| On a surface                         | Surface for a plain pane, Card for a content surface; both keep `--env-radius-surface`              |
| Components bring their own padding   | Don't pad a Button, field or Card from outside; arrange the space between them                      |
| Fully rounded                        | `--env-radius-full`; see Guidelines below                                                           |

### Corners by what they are

The Site shows four kinds of corner; small marks are a fifth, for code. Their tokens:

| On the Site      | Token and where it is used                                                                                                              |
| ---------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Surfaces         | `--env-radius-surface`: panes, cards, dialogs, popups and the outside of a row group                                                    |
| Inside a surface | `--env-radius-lg` for alerts, tables, text areas and drop zones; `--env-radius-sm` for list rows, menu items, tabs, toasts and tooltips |
| Fully rounded    | `--env-radius-full`: buttons, single-line fields, badges, switches, segmented controls and navigation items                             |
| Circles          | `50%`: avatars and icon buttons, which are always square                                                                                |
| Small marks      | `--env-radius-xs`: checkboxes and color swatches, which read as boxes                                                                   |

## Two axes of density

- **Scale** is the size of the whole system, `comfortable` or `compact`: it switches every size token at once. Compact is about 0.8 of comfortable with type a step smaller, for desktop productivity apps. Icons keep a 1 rem floor; borders and focus rings keep their widths.
- **Row density** is how tightly Table, Tree and List pack their rows: `xs` to `lg`, padding only.

Within a scale, `size` picks one of three control heights for a deliberate local difference; every control of one size lines up. A control without a size takes its container's `--env-control-height`, `md` unless the container sets another, as a table cell does with `sm`.

## Sizes in each scale

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

## Touch

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

## Guidelines

- The parent owns gaps, through Row, Column and Grid; each component owns its padding. Text has no outer margins.
- Use relative units; let text wrap and controls grow with their content. In your own grids, `minmax(0, 1fr)` tracks, `min-inline-size: 0` on flex children and `max-inline-size: 100%` on media.
- Choose Surface for a plain pane and Card for a content surface, and keep their corners.
- Use `--env-radius-full` where a pill is meant, never `50%` or `9999px`: one line tall it draws round ends, and an element that grows taller, such as a wrapping button or a field whose chips wrap, keeps the same corners. `50%` is only for parts that are always square, such as avatars and round icon buttons.
- **One scale per app or window**, on the root Theme or ThemePreferenceProvider; desktop productivity apps take compact, web and touch apps comfortable. Rendered on the server, pass `scale` to the provider too, so the first paint has it.
- **Another scale only at a Theme boundary around a whole region**, such as a docked inspector: `<Theme {...useTheme()} scale="compact">`.
- **Rows match:** a button beside a field takes its size, and a table's toolbar follows its rows.
- Choose a row density for how people read: `sm` or `xs` for scanning, `md` or `lg` for reading row by row.
- Read the tokens in application CSS, such as `block-size: var(--env-control-height-sm)`.

TypeScript declarations provide the complete public API.

## Related topics

- [Typography](../foundations/typography.md)
- [Adapting to width](../foundations/responsive.md)
- [Column](../components/column.md)
- [Row](../components/row.md)
- [Grid](../components/grid.md)
- [Surface](../components/surface.md)
- [Card](../components/card.md)
- [Button](../components/button.md)
- [TextField](../components/text-field.md)
- [Table](../components/table.md)
- [List](../components/list.md)
- [Tree](../components/tree.md)
- [Customize and extend](../customizing.md)
