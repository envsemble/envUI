# Scale & density

## React usage

```tsx
import { Button, Table, TextField, Theme } from '@envsemble/envui';
import '@envsemble/envui/styles.css';

// A desktop productivity app: one compact scale for the whole window.
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
| Theme scale                   | comfortable or compact; inherited from the enclosing Theme, comfortable outside any; written to `data-env-scale`                |
| ThemePreferenceProvider scale | As on Theme, for its boundary and the document root; left out, it inherits `<html data-env-scale>`                              |
| createThemeBootstrapScript    | `scale: 'compact'` writes `data-env-scale="compact"` to the root before the first paint                                         |
| Control `size`                | sm, md or lg on Button, IconButton, the fields, Select, Combobox, DatePicker, SegmentedControl, Pagination and the rail of Tabs |
| Row `density`                 | xs, sm, md or lg on Table.Root, Tree and List.Root: only the rows' block padding changes                                        |

## Two axes

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

- **One scale per app or window**, on the root Theme or ThemePreferenceProvider; desktop productivity apps take compact, web and touch apps comfortable. Rendered on the server, pass `scale` to the provider too, so the first paint has it.
- **Another scale only at a Theme boundary around a whole region**, such as a docked inspector: `<Theme {...useTheme()} scale="compact">`.
- **Rows match:** a button beside a field takes its size, and a table's toolbar follows its rows.
- Choose a row density for how people read: `sm` or `xs` for scanning, `md` or `lg` for reading row by row.
- Read the tokens in application CSS, such as `block-size: var(--env-control-height-sm)`.

TypeScript declarations provide the complete public API.

## Related topics

- [Spacing & shape](../foundations/spacing.md)
- [Typography](../foundations/typography.md)
- [Colors & themes](../foundations/colors.md)
- [Button](../components/button.md)
- [TextField](../components/text-field.md)
- [Table](../components/table.md)
- [Tree](../components/tree.md)
