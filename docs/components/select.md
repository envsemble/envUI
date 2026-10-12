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
| variant              | secondary (default) or outlined; the trigger's button style, see below   |

## Guidelines

- Use a select to save space when a single choice has several alternatives.
- The trigger is a button, not a field. Choose its style for the surroundings:
  - secondary, a filled pill sharing secondary Button colors, sits on the page canvas;
  - outlined, a bordered pill without a fill, sits on panes, dialogs, rows and toolbars, where a fill would blend with the surface.
- In a form, the label sits above the trigger, which fits its content beside full-width text fields.
- The open list is a raised popup in its own color with a hairline border, so it stands apart from the page, panes, rows and dialogs alike. Options show only hover, press and selection. Keyboard navigation, typeahead and dismissal come from the component.
- Option focus rings appear for keyboard interaction, not pointer opening or hover.
- Label, hint and error use the same field structure and colors as Input and Textarea. Invalid controls use the shared red border with HSL hover and pressed shades, without background changes, and retain the standard keyboard focus ring. The application owns validation.

TypeScript declarations provide the complete public API.

## Related topics

- [Radio groups](../components/radio.md)
- [Text fields](../components/fields.md)
- [Grouped rows](../components/rows.md)
- [Accessibility](../foundations/accessibility.md)
