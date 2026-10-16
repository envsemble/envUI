# Text fields

## TextField

```tsx
import { TextField } from '@envsemble/envui';

<TextField label="Project name" name="project" value={name}
  onChange={event => setName(event.target.value)}
  hint="A name your team will recognize." required />

<TextField variant="plain" label="Title" name="title" />

<TextField label="Address" name="slug" prefix="https://example.com/" />
<TextField label="Storage" name="storage" type="number" suffix="GB" />
```

### Props & contracts

| Name                 | Contract                                                                                                                                                                      |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| variant              | "outlined" (default); "plain": transparent, with an underline on hover or focus; "quiet": only its text and icon, a soft fill on hover or focus, placeholder cleared on focus |
| label / hint / error | Floating label; hint and error message are linked to the control                                                                                                              |
| startIcon            | Decorative icon at the start of the field                                                                                                                                     |
| endAction            | A control at the end of the field, such as a clear IconButton                                                                                                                 |
| compact              | Match the button height; the label is hidden unless showLabel is set                                                                                                          |
| showLabel            | Float the label into the outline on focus or input; true unless the field is compact                                                                                          |
| prefix / suffix      | Short text inside the field before or after the value, such as an address start or a unit                                                                                     |
| Native input props   | value/defaultValue, onChange, name, type, required, disabled, readOnly, ref                                                                                                   |

## SearchField

```tsx
import { SearchField, Button } from '@envsemble/envui';

<SearchField
  label="Search members"
  placeholder="Search by name or e-mail"
  value={query}
  onValueChange={setQuery}
/>;
```

### Props & contracts

| Name                                 | Contract                                                                 |
| ------------------------------------ | ------------------------------------------------------------------------ |
| label                                | Required accessible name; shown when not compact, or with showLabel      |
| value / defaultValue / onValueChange | Controlled or uncontrolled query; cleared queries report an empty string |
| compact                              | true by default, so the field matches buttons beside it                  |
| clearLabel                           | Accessible name of the clear action; "Clear search" by default           |
| Native input props                   | name, placeholder, disabled, autoFocus, ref and other input attributes   |

## Textarea

```tsx
import { Textarea } from '@envsemble/envui';

<Textarea label="Notes" name="notes" rows={4} sizing="fixed"
  value={notes} onChange={e => setNotes(e.target.value)} />

<Textarea label="Description" name="description" rows={4} sizing="content"
  value={description} onChange={e => setDescription(e.target.value)} />

<Textarea variant="plain" label="Notes" sizing="content" rows={3} />
```

### Props & contracts

| Name                  | Contract                                                                                                                  |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| variant               | "outlined" (default) or "plain": transparent, with an underline on hover or focus                                         |
| sizing                | "fixed" (default) scrolls and resizes from the bottom edge; "content" grows and shrinks to fit                            |
| rows                  | Visible rows in fixed mode; in content mode the rows it starts at, also below 7.5 rem; without rows both start at 7.5 rem |
| label / hint / error  | Floating label; hint and error message are linked to the control                                                          |
| Native textarea props | rows, value/defaultValue, onChange, name, required, disabled, readOnly, ref                                               |

## Guidelines

- Use compact fields in toolbars and beside buttons: they share the 2.5 rem control height and pill shape. Use the default floating-label size in forms.
- A compact field shows its placeholder, or with showLabel a label that rests inside and floats into the outline without adding height, so the field stays aligned with buttons.
- Use a text IconButton as endAction. Inside the field it takes the field's quiet icon color and shows a state layer on hover and press.
- SearchField shows a search icon and, while it has a query, a clear button inside the field. `variant="quiet"` suits a search at the top of a sidebar or list: no outline until the pointer or focus gives it a soft fill. <kbd>Esc</kbd> also clears the query and keeps an enclosing dialog open.
- Use TextField for one line and Textarea for multiline content. Both share the same corner radius. Fixed sizing scrolls and resizes from the full bottom edge; content sizing grows and shrinks automatically. Set rows for the initial or minimum height.
- The resize edge follows the field’s border color on hover, focus and error, and uses the pressed shade while dragging. Focus the edge and use <kbd>↑</kbd> and <kbd>↓</kbd> to change height by one line, or <kbd>Shift</kbd>+<kbd>↑</kbd> and <kbd>Shift</kbd>+<kbd>↓</kbd> for five lines. <kbd>Home</kbd> restores the minimum height. Disabled fields cannot resize.
- Outlined fields turn their single thin border blue on hover and focus in both themes, without changing the background or adding an outline. Hover and pressed colors follow the shared HSL rule, including while focused. Invalid borders and plain-field error underlines stay red and change shade on hover or press.
- Labels move above the text when focused or filled. Plain fields have no border or fill at rest and show an underline on hover or focus; invalid plain fields use a red underline. Both variants retain linked recovery text.
- Prefix and suffix are short, non-interactive text in line with the value, such as the start of an address or a unit. They are not part of the value, so forms submit only what people type. They stay hidden while the label rests inside an empty field and appear once the field has focus or a value; with a hidden label they always show. Assistive technology reads them after the label, before the hint. A long prefix is cut short with an ellipsis so the value keeps its room, and pressing either one places the caret in the field.
- On touch screens, entered text, resting labels, prefixes and suffixes are 1 rem (16 px by default) instead of the body size, so focusing a field does not zoom the page. The command palette, composer and editors do the same.
- Placeholders appear while focused; use hints for lasting instructions and errors for a specific recovery step.
- Both support empty, filled, focus, invalid, disabled and read-only states. Validation and draft state belong to the application.

TypeScript declarations provide the complete public API.

## Related topics

- [Markdown](../components/markdown.md)
- [Selects](../components/select.md)
- [Comboboxes](../components/combobox.md)
- [Date pickers](../components/date-picker.md)
- [Stacks & action groups](../components/layout.md)
- [Accessibility](../foundations/accessibility.md)
