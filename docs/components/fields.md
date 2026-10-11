# Text fields

## Input

```tsx
import { Input } from '@envsemble/envui';

<Input label="Project name" name="project" value={name}
  onChange={event => setName(event.target.value)}
  hint="A name your team will recognize." required />

<Input variant="plain" label="Title" name="title" />
```

### Props & contracts

| Name                 | Contract                                                                          |
| -------------------- | --------------------------------------------------------------------------------- |
| variant              | "outlined" (default) or "plain": transparent, with an underline on hover or focus |
| label / hint / error | Floating label; hint and error message are linked to the control                  |
| startIcon            | Decorative icon at the start of the field                                         |
| endAction            | A control at the end of the field, such as a clear IconButton                     |
| compact              | Match the button height; the label stays accessible and the placeholder is shown  |
| Native input props   | value/defaultValue, onChange, name, type, required, disabled, readOnly, ref       |

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

| Name                                 | Contract                                                                  |
| ------------------------------------ | ------------------------------------------------------------------------- |
| label                                | Required accessible name; shown as a floating label only when not compact |
| value / defaultValue / onValueChange | Controlled or uncontrolled query; cleared queries report an empty string  |
| compact                              | true by default, so the field matches buttons beside it                   |
| clearLabel                           | Accessible name of the clear action; "Clear search" by default            |
| Native input props                   | name, placeholder, disabled, autoFocus, ref and other input attributes    |

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

| Name                  | Contract                                                                                       |
| --------------------- | ---------------------------------------------------------------------------------------------- |
| variant               | "outlined" (default) or "plain": transparent, with an underline on hover or focus              |
| sizing                | "fixed" (default) scrolls and resizes from the bottom edge; "content" grows and shrinks to fit |
| rows                  | Visible rows in fixed mode; minimum rows in content mode                                       |
| label / hint / error  | Floating label; hint and error message are linked to the control                               |
| Native textarea props | rows, value/defaultValue, onChange, name, required, disabled, readOnly, ref                    |

## Guidelines

- Use compact fields in toolbars and beside buttons: they share the 2.5 rem control height and pill shape. Use the default floating-label size in forms.
- SearchField shows a search icon and, while it has a query, a clear button inside the field. Escape also clears the query and keeps an enclosing dialog open.
- Use Input for one line and Textarea for multiline content. Both share the same corner radius. Fixed sizing scrolls and resizes from the full bottom edge; content sizing grows and shrinks automatically. Set rows for the initial or minimum height.
- The resize edge follows the field’s border color on hover, focus and error, and uses the pressed shade while dragging. Focus the edge and use Up/Down arrows to change height by one line, or Shift+Up/Down for five lines. Home restores the minimum height. Disabled fields cannot resize.
- Outlined fields turn their single thin border blue on hover and focus in both themes, without changing the background or adding an outline. Hover and pressed colors follow the shared HSL rule, including while focused. Invalid borders and plain-field error underlines stay red and change shade on hover or press.
- Labels move above the text when focused or filled. Plain fields have no border or fill at rest and show an underline on hover or focus; invalid plain fields use a red underline. Both variants retain linked recovery text.
- Placeholders appear while focused; use hints for lasting instructions and errors for a specific recovery step.
- Both support empty, filled, focus, invalid, disabled and read-only states. Validation and draft state belong to the application.

TypeScript declarations provide the complete public API.

## Related topics

- [Markdown](../components/markdown.md)
- [Selects](../components/select.md)
- [Stacks & action groups](../components/layout.md)
- [Accessibility](../foundations/accessibility.md)
