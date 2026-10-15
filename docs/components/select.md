# Selects

## React usage

```tsx
import { Select } from '@envsemble/envui';

<Select
  label="Visibility"
  name="visibility"
  value={visibility}
  onValueChange={setVisibility}
  options={[
    { value: 'team', label: 'Team' },
    { value: 'private', label: 'Private' },
  ]}
/>

<Select variant="outlined" label="Role" options={roleOptions} defaultValue="member" />;
```

### Props & contracts

| Name                 | Contract                                                                 |
| -------------------- | ------------------------------------------------------------------------ |
| options              | Array of { value, label, disabled? }                                     |
| value / defaultValue | Selected string, or null                                                 |
| onValueChange        | Receives selected string or null                                         |
| label / hint / error | Visible label and linked guidance or validation, shared with text fields |
| Native participation | name, disabled, required and form                                        |
| variant              | secondary (default) or outlined; the trigger's Button style, see below   |
| density              | standard (default) or compact, for dense desktop interfaces              |

## Guidelines

- Use a select to save space when a single choice has several alternatives. For a list long enough to search, or to choose several options, use Combobox.
- The trigger is a Button, not a field, in one of the Button styles. Choose it for the surroundings:
  - secondary sits on the page canvas;
  - outlined sits on panes, dialogs, rows and toolbars, where a fill would blend with the surface.
- In a form, the label sits above the trigger, which fits its content beside full-width text fields.
- The open list is a raised popup like Popover: its own color, a hairline border and the surface corners, so it stands apart from the page, panes, rows and dialogs alike. Options are rounded rows whose corners follow the popup's, inset by its padding. They show only hover, press and selection. Keyboard navigation, typeahead and dismissal come from the component.
- Option focus rings appear for keyboard interaction, not pointer opening or hover.
- Use compact density in dense desktop interfaces, such as toolbars and title bars. The trigger takes the compact control height and a smaller chevron in the same Button styles. The open list takes the compact menu's look: the raised popup with small corners and 1.75 rem rows, where a check mark rather than a fill shows the selected option. Keyboard and form behavior are the same in both densities.
- Label, hint and error use the same field structure and colors as Input and Textarea. Invalid controls use the shared red border with HSL hover and pressed shades, without background changes, and retain the standard keyboard focus ring. The application owns validation.

TypeScript declarations provide the complete public API.

## Related topics

- [Comboboxes](../components/combobox.md)
- [Menus](../components/menu.md)
- [Radio groups](../components/radio.md)
- [Text fields](../components/fields.md)
- [Grouped rows](../components/rows.md)
- [Accessibility](../foundations/accessibility.md)
