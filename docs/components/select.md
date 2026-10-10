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
/>;
```

### Props & contracts

| Name                 | Contract                                                                 |
| -------------------- | ------------------------------------------------------------------------ |
| options              | Array of { value, label, disabled? }                                     |
| value / defaultValue | Selected string, or null                                                 |
| onValueChange        | Receives selected string or null                                         |
| label / hint / error | Visible label and linked guidance or validation, shared with text fields |
| Native participation | name, disabled, required and form                                        |

## Guidelines

- Use a select to save space when a single choice has several alternatives.
- The trigger shares secondary Button colors, and the menu shares the pane Surface tone. Options have their own selection roles and grouped geometry. Keyboard navigation, typeahead and dismissal come from the component.
- Option focus rings appear for keyboard interaction, not pointer opening or hover.
- Label, hint and error use the same field structure and colors as Input and Textarea. Invalid controls use the shared red border with HSL hover and pressed shades, without background changes, and retain the standard keyboard focus ring. The application owns validation.

TypeScript declarations provide the complete public API.

## Related topics

- [Radio groups](../components/radio.md)
- [Text fields](../components/fields.md)
- [Grouped rows](../components/rows.md)
- [Accessibility](../foundations/accessibility.md)
