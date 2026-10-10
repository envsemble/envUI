# Switches

## React usage

```tsx
import { Switch } from '@envsemble/envui';

<Switch
  label="Enable notifications"
  name="notifications"
  checked={enabled}
  onCheckedChange={setEnabled}
/>;
```

### Props & contracts

| Name                     | Contract                              |
| ------------------------ | ------------------------------------- |
| checked / defaultChecked | boolean                               |
| onCheckedChange          | Receives the next boolean             |
| label / native props     | Visible label, disabled, name and ref |

## Guidelines

- Use for a binary setting. Label the setting consistently in either state.
- Use checkbox semantics when the choice is part of a submitted selection.

TypeScript declarations provide the complete public API.

## Related topics

- [Checkboxes](../components/checkbox.md)
- [Colors & themes](../foundations/colors.md)
- [Accessibility](../foundations/accessibility.md)
