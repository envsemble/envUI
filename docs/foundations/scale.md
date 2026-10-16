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

| Name                          | Contract                                                                                                                                                                                                            |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Theme scale                   | comfortable or compact; inherited from the enclosing Theme when left out, and comfortable outside any. Theme writes it to `data-env-scale` on its element, nested boundaries and popups alike                       |
| ThemePreferenceProvider scale | As on Theme, for the boundary around the children and the document root. Left out, outside any Theme, the boundary inherits a scale the page set on the root, `<html data-env-scale>`, and is otherwise comfortable |
| createThemeBootstrapScript    | `scale: 'compact'` writes `data-env-scale="compact"` to the root before the first paint                                                                                                                             |
| useTheme()                    | `{ theme, contrast, scale }` of the nearest Theme, including across library portals                                                                                                                                 |
| Control `size`                | sm, md or lg on Button, IconButton, CopyButton, TextField, SearchField, Select, Combobox, DatePicker, SegmentedControl, Pagination and the rail of Tabs                                                             |
| Row `density`                 | xs, sm, md or lg on Table.Root, Tree and List.Root: only the rows' block padding changes                                                                                                                            |

## Two axes

envUI sizes an interface on two axes, and nothing else changes its size.

- **Scale** is the size of the whole system: `comfortable` or `compact`. It switches every size token at once, from control heights to type, spacing and corners. Comfortable is envUI's own look, the web norm; compact is about 0.8 of it with type one step smaller, for desktop productivity apps. Icons keep a 1 rem floor, and borders and focus rings keep their widths.
- **Row density** is how tightly a data component packs its rows: `xs`, `sm`, `md` or `lg`, on Table, Tree and List. It changes only the rows' block padding, never their text, icons or corners.

Within a scale, a control's **size** (`sm`, `md` or `lg`) chooses one of three heights for a deliberate local difference, such as a small action in a table cell or a large call to action. Every control of one size has the same height in a scale, so a button, a field, a select and a segmented control of the same size line up. A control without a size takes the control height of its container: `md`, unless the container sets another, as a table cell does with `sm`.

## Sizes in each scale

At the default 16 px root. Every value is a token, in rem, so it follows the reader's text size.

| Token                                                                   | Comfortable           | Compact               |
| ----------------------------------------------------------------------- | --------------------- | --------------------- |
| `--env-control-height-sm` / `-md` / `-lg`                               | 32 / 40 / 48          | 26 / 32 / 38          |
| `--env-control-target-min`                                              | 24                    | 24                    |
| `--env-row-height` (menu, Select and Combobox rows)                     | 36                    | 28                    |
| `--env-row-content-height` (tree rows)                                  | 20                    | 20                    |
| `--env-row-padding-block-xs` / `-sm` / `-md` / `-lg`                    | 2 / 4 / 8 / 12        | 2 / 3 / 4 / 6         |
| `--env-tree-row-padding-block-sm` / `-md` / `-lg`                       | 4 / 8 / 12            | 4 / 5 / 7             |
| `--env-space-1` … `--env-space-9`                                       | 4, 8, 12, 16, 24 … 64 | 4, 6, 10, 12, 20 … 52 |
| `--env-control-gap`                                                     | 7                     | 6                     |
| `--env-font-size-caption` / `-body-small` / `-label`                    | 12 / 14 / 14          | 11 / 12 / 13          |
| `--env-font-size-label-small` (combobox chips)                          | 13                    | 12                    |
| `--env-font-size-body` / `-heading-small` / `-heading`                  | 15 / 16 / 18          | 13 / 14 / 16          |
| `--env-icon-size-sm` / `-md` / `-lg`                                    | 16 / 18 / 20          | 16 / 16 / 18          |
| `--env-radius-sm` / `--env-radius-lg` / `--env-radius-surface`          | 8 / 16 / 28           | 6 / 12 / 22           |
| `--env-field-floating-height` (inside the 1 px border)                  | 56                    | 44                    |
| `--env-app-shell-header-height` / `--env-title-bar-height`              | 52 / 40               | 42 / 32               |
| `--env-control-border-width`, focus rings, `--env-control-height-touch` | 1, 2, 44              | 1, 2, 44              |

- A tree row is its content line plus its density's padding on both sides: 24, 28, 36 and 44 from `xs` to `lg` in the comfortable scale, and 24, 28, 30 and 34 in the compact one, whose tree paddings are a pixel more than the row densities' so that no compact row is taller than a comfortable one and a `sm` row, the default, is as tall as a compact menu row. A table cell adds 4 px to its row padding, so a `md` table row of one line is 45 px tall, and a list row is at least as tall as a small control with its padding, 56 px at `md`.
- Controls in table cells take the small control height, so a row with an action stays close to the height of its text.
- `--env-control-height` is the height of a control that sets no size: md, unless its container sets it to another control height. Set it in an application's own toolbar the same way: `--env-control-height: var(--env-control-height-sm)`.

## Fields

- A field takes the control height of its size and is a pill, so it lines up with buttons. Its label rests inside while the field is empty and floats into the outline, without changing the height; `showLabel={false}` hides it and leaves the placeholder as the visible guidance.
- `variant="floating"` on TextField, Combobox and DatePicker is the tall field, whose label floats above the value, for a long form on a page: 58 px with its border in the comfortable scale and 46 px in the compact one. Plain fields and text areas are tall too.
- Menus and the popups of Select and Combobox share one anatomy: a raised popup with small corners and rows of `--env-row-height`, where a check mark shows the chosen option.

## Touch

- Under a coarse pointer, controls grow to at least 44 px (`--env-control-height-touch`), in either scale: buttons, icon buttons, the fields, Select, the rails of SegmentedControl and Tabs, a ButtonGroup and its buttons, Pagination, menubar triggers, AppShell's sidebar toggle, a toast's dismiss button, AvatarButton, sortable table headers, and the close buttons of a PanelDock chip and of DocumentTabs. Their `sm` and `md` heights become 44 px, and `lg` stays 48 px in the comfortable scale and becomes 44 px in the compact one, so the controls of a row still match. A button and a menubar trigger are at least as wide, and so are segments and tabs. The few that stay smaller are listed below.
- envUI follows the primary pointer, `@media (pointer: coarse)`, not `any-pointer`: a touchscreen laptop used with a mouse or a trackpad keeps the desktop density, and a phone or a tablet grows. The control tokens themselves keep their values, because the token resolver has no pointer modifier; each component applies the touch height under the media query.
- A control's own box is its hit area, so a press always reaches the control it lands on, whatever the layout around it: an application's own column, grid or wrapping row needs nothing more. Hit areas drawn beyond a part's box stay inside its control: a segment's or a tab's covers the rail's padding above and below it, so it is as tall as the rail, and an action inside a field reaches the touch height above and below it, within the field, but keeps its width, so it never reaches over the next action or the text.
- Rows grow to 44 px too, such as menu items, tree rows, navigation items and table rows with an action, and the top bar and the title bar to 52 px, which holds a control with 4 px around it. Entered text becomes 1 rem, so touch browsers don't zoom into a focused field.
- Growing, rather than keeping each control's look and adding an invisible hit area around it, is what keeps a row's controls the same height when a field beside a button must be 44 px for its text, and keeps one control's hit area from taking presses on another, which only the layout around them could prevent.
- Keep your own targets the same way. Use envUI's Button or IconButton, which grow on their own, or grow your own control under the same query, since `--env-control-height` keeps its value under a coarse pointer:

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

- These targets stay smaller under a coarse pointer and rely on WCAG 2.5.8's spacing exception below: a link in running text, a breadcrumb link, the remove button of a combobox chip, the avatars of an interactive AvatarGroup, which keep at least 1.5 rem of each uncovered, and a Switch's 40 px track, whose label row grows to 44 px and takes presses too.
- With a mouse, every target is at least 24 px in both scales, WCAG 2.2's minimum: segments, tabs and the actions inside fields keep 24 px even in a small rail or field of the compact scale. A few targets are shorter but keep 24 px of room around them, which WCAG 2.5.8 allows as its spacing exception: a breadcrumb link, a line of text 21 px tall, and the remove button of a combobox chip.

## Guidelines

- **One scale per app or window.** Set it on the application's root Theme or ThemePreferenceProvider.
- **Server rendering: pass the scale to the provider.** A ThemePreferenceProvider's boundary takes the scale of a server-rendered `<html data-env-scale="compact">` only once the application hydrates and reads the root, so until then the boundary paints comfortable. Pass `scale` to ThemePreferenceProvider, so the server renders the boundary in it, and the same scale to createThemeBootstrapScript if the page uses it.
- **A different scale only at a Theme boundary around a whole region**, such as a docked inspector or a panel of its own: `<Theme {...useTheme()} scale="compact">`. Never mix scales inside a toolbar or a form row.
- **Desktop productivity apps use compact. Web, customer-facing and touch apps use comfortable.**
- **Rows match.** A button next to an input takes the input's size, a table toolbar follows its rows, and menu items match their trigger. Give the controls of a row the same size, or none.
- Use `size` for a deliberate difference in one place, not to make a region denser: a denser region is a scale or a row density.
- Choose a data component's row density for how people read it: `sm` or `xs` for scanning many rows, `md` or `lg` for rows people read one by one.
- In application CSS, read the tokens rather than fixed lengths, so an application's own frames follow the scale: `block-size: var(--env-control-height-sm)`.

TypeScript declarations provide the complete public API.

## Related topics

- [Spacing & shape](../foundations/spacing.md)
- [Typography](../foundations/typography.md)
- [Colors & themes](../foundations/colors.md)
- [Button](../components/button.md)
- [TextField](../components/text-field.md)
- [Table](../components/table.md)
- [Tree](../components/tree.md)
