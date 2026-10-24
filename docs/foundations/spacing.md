# Spacing & shape

## React usage

```tsx
import { Surface, Column, Text } from '@envsemble/envui';

<Surface padding={5} render={<Column gap={4} />}>
  <Text render={<h2 />} variant="title">
    Workspace
  </Text>
  <Text>Padding is inside the surface; gap is between its children.</Text>
</Surface>;
```

### Props & contracts

| Name                | Contract                                                                                     |
| ------------------- | -------------------------------------------------------------------------------------------- |
| Spacing steps 0â€“9 | 0, 0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3 and 4 rem in the comfortable scale; smaller in compact |
| Touch minimum       | 2.75 rem: every control grows to it under a coarse pointer                                   |

### Tokens for application CSS

Inside a Theme these follow the theme, its [scale](../foundations/scale.md) and the reader's text size; the values are the comfortable scale's.

| Name                                                              | Contract                                                                                                                                                                 |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `--env-space-1` â€¦ `--env-space-9`                               | The spacing scale                                                                                                                                                        |
| `--env-radius-xs` â€¦ `--env-radius-xl`                           | 0.25, 0.5, 0.75 and 1.75 rem                                                                                                                                             |
| `--env-radius-sm`                                                 | 0.5 rem: inner rows, important actions, toasts and thumbnails                                                                                                            |
| `--env-radius-lg`                                                 | 1 rem: text fields, tables and drop zones                                                                                                                                |
| `--env-radius-surface`                                            | 1.75 rem: panes, cards and the outside of a row group                                                                                                                    |
| `--env-radius-full`                                               | Rounded ends: buttons, fields, navigation items, badges; half the tallest single-line control, 1.5 rem at most, so a taller element is a rounded rectangle, never a pill |
| `--env-control-height`, `--env-control-height-sm` / `-md` / `-lg` | Control heights, to line up with                                                                                                                                         |
| `--env-control-icon-size`                                         | 1 rem: the icon inside controls                                                                                                                                          |

## Guidelines

- The parent owns gaps, through Row, Column and Grid; each component owns its padding. Text has no outer margins.
- Use relative units; let text wrap and controls grow with their content. In your own grids, `minmax(0, 1fr)` tracks, `min-inline-size: 0` on flex children and `max-inline-size: 100%` on media.
- Choose Surface for a plain pane and Card for a content surface, and keep their corners.
- Use `--env-radius-full` where a pill is meant, never `50%` or `9999px`: one line tall it draws round ends, and an element that grows taller, such as a wrapping button or a field whose chips wrap, keeps the same corners. `50%` is only for parts that are always square, such as avatars and round icon buttons.

TypeScript declarations provide the complete public API.

## Related topics

- [Scale & density](../foundations/scale.md)
- [Layout & stacking](../foundations/responsive.md)
- [Column](../components/column.md)
- [Row](../components/row.md)
- [Grid](../components/grid.md)
- [Surface](../components/surface.md)
- [Card](../components/card.md)
- [List](../components/list.md)
- [Composition & extension](../foundations/composition.md)
