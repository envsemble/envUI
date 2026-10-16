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

| Name                          | Contract                                                                                                                                                                                      |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Theme scale                   | comfortable or compact; inherited from the enclosing Theme when left out, and comfortable outside any. Theme writes it to `data-env-scale` on its element, nested boundaries and popups alike |
| ThemePreferenceProvider scale | As on Theme, for the boundary around the children and the document root                                                                                                                       |
| createThemeBootstrapScript    | `scale: 'compact'` writes `data-env-scale="compact"` to the root before the first paint                                                                                                       |
| useTheme()                    | `{ theme, contrast, scale }` of the nearest Theme, including across library portals                                                                                                           |
| Control `size`                | sm, md or lg on Button, IconButton, CopyButton, TextField, SearchField, Select, Combobox, DatePicker, SegmentedControl, Pagination and the rail of Tabs                                       |
| Row `density`                 | xs, sm, md or lg on Table.Root, Tree and List.Root: only the rows' block padding changes                                                                                                      |

## Two axes

envUI sizes an interface on two axes, and nothing else changes its size.

- **Scale** is the size of the whole system: `comfortable` or `compact`. It switches every size token at once, from control heights to type, spacing and corners. Comfortable is envUI's own look, the web norm; compact is about 0.8 of it with type one step smaller, for desktop productivity apps. Icons keep a 1 rem floor, and borders and focus rings keep their widths.
- **Row density** is how tightly a data component packs its rows: `xs`, `sm`, `md` or `lg`, on Table, Tree and List. It changes only the rows' block padding, never their text, icons or corners.

Within a scale, a control's **size** (`sm`, `md` or `lg`) chooses one of three heights for a deliberate local difference, such as a small action in a table cell or a large call to action. Every control of one size has the same height in a scale, so a button, a field, a select and a segmented control of the same size line up. A control without a size takes the control height of its container: `md`, unless the container sets another, as a table cell does with `sm`.

## Sizes in each scale

At the default 16 px root. Every value is a token, in rem, so it follows the reader's text size.

| Token                                                           | Comfortable           | Compact               |
| --------------------------------------------------------------- | --------------------- | --------------------- |
| `--control-height-sm` / `-md` / `-lg`                           | 32 / 40 / 48          | 26 / 32 / 38          |
| `--control-target-min`                                          | 24                    | 24                    |
| `--row-height` (menu, Select and Combobox rows)                 | 36                    | 28                    |
| `--row-content-height` (tree rows)                              | 20                    | 22                    |
| `--row-padding-block-xs` / `-sm` / `-md` / `-lg`                | 2 / 4 / 8 / 12        | 2 / 3 / 4 / 6         |
| `--space-1` … `--space-9`                                       | 4, 8, 12, 16, 24 … 64 | 4, 6, 10, 12, 20 … 52 |
| `--control-gap`                                                 | 7                     | 6                     |
| `--font-size-caption` / `-body-small` / `-label`                | 12 / 14 / 14          | 11 / 12 / 13          |
| `--font-size-label-small` (combobox chips)                      | 13                    | 12                    |
| `--font-size-body` / `-heading-small` / `-heading`              | 15 / 16 / 18          | 13 / 14 / 16          |
| `--icon-size-sm` / `-md` / `-lg`                                | 16 / 18 / 20          | 16 / 16 / 18          |
| `--radius-standard` / `--radius-large` / `--radius-surface`     | 8 / 16 / 28           | 6 / 12 / 22           |
| `--field-floating-height` (inside the 1 px border)              | 56                    | 44                    |
| `--topbar-height` / `--title-bar-height`                        | 52 / 40               | 42 / 32               |
| `--control-border-width`, focus rings, `--control-height-touch` | 1, 2, 44              | 1, 2, 44              |

- A tree row is its content line plus its density's padding on both sides: 28 at `sm`, the default, and 36 at `md` in the comfortable scale, and 28 at `sm` and 30 at `md` in the compact one. A table cell adds 4 px to its row padding, so a `md` table row of one line is 45 px tall, and a list row is at least as tall as a small control with its padding, 56 px at `md`.
- Controls in table cells take the small control height, so a row with an action stays close to the height of its text.
- `--control-height` is the height of a control that sets no size: md, unless its container sets it to another control height. Set it in an application's own toolbar the same way: `--control-height: var(--control-height-sm)`.

## Fields

- A field takes the control height of its size and is a pill, so it lines up with buttons. Its label rests inside while the field is empty and floats into the outline, without changing the height; `showLabel={false}` hides it and leaves the placeholder as the visible guidance.
- `variant="floating"` on TextField, Combobox and DatePicker is the tall field, whose label floats above the value, for a long form on a page: 58 px with its border in the comfortable scale and 46 px in the compact one. Plain fields and text areas are tall too.
- Menus and the popups of Select and Combobox share one anatomy: a raised popup with small corners and rows of `--row-height`, where a check mark shows the chosen option.

## Touch

- Under a coarse pointer, a button, an icon button or a menubar trigger smaller than 44 px (`--control-height-touch`) keeps its look and gains an invisible hit area up to 44 px tall and wide, in either scale. The hit area grows only into free space: never towards a control beside it in a row, or above or below it in a column, so a press on a control always reaches that control.
- Controls joined in a rail or a group, such as segments, tabs and the buttons of a ButtonGroup, grow to 44 px themselves under a coarse pointer, and so do rows, such as menu items, tree rows and navigation items, and text fields. Entered text becomes 1 rem, so touch browsers don't zoom into a focused field.
- With a mouse, every target is at least 24 px in both scales, WCAG 2.2's minimum: segments, tabs and the actions inside fields keep 24 px even in a small rail or field of the compact scale. A few targets are shorter but keep 24 px of room around them, which WCAG 2.5.8 allows as its spacing exception: a breadcrumb link, a line of text 21 px tall, and the remove button of a combobox chip.

## Guidelines

- **One scale per app or window.** Set it on the application's root Theme or ThemePreferenceProvider.
- **A different scale only at a Theme boundary around a whole region**, such as a docked inspector or a panel of its own: `<Theme {...useTheme()} scale="compact">`. Never mix scales inside a toolbar or a form row.
- **Desktop productivity apps use compact. Web, customer-facing and touch apps use comfortable.**
- **Rows match.** A button next to an input takes the input's size, a table toolbar follows its rows, and menu items match their trigger. Give the controls of a row the same size, or none.
- Use `size` for a deliberate difference in one place, not to make a region denser: a denser region is a scale or a row density.
- Choose a data component's row density for how people read it: `sm` or `xs` for scanning many rows, `md` or `lg` for rows people read one by one.
- In application CSS, read the tokens rather than fixed lengths, so an application's own frames follow the scale: `block-size: var(--control-height-sm)`.

TypeScript declarations provide the complete public API.

## Related topics

- [Spacing & shape](../foundations/spacing.md)
- [Typography](../foundations/typography.md)
- [Colors & themes](../foundations/colors.md)
- [Button](../components/button.md)
- [TextField](../components/text-field.md)
- [Table](../components/table.md)
- [Tree](../components/tree.md)
