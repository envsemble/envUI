# Checkbox

## React usage

```tsx
import { Checkbox } from '@envsemble/envui';

<Checkbox
  label="Include archived items"
  name="archived"
  checked={included}
  onCheckedChange={setIncluded}
/>;
```

### Props & contracts

| Name                     | Contract                                               |
| ------------------------ | ------------------------------------------------------ |
| checked / defaultChecked | boolean or "mixed"                                     |
| onCheckedChange          | Receives the next boolean selection                    |
| label / native props     | Visible label, name, value, required, disabled and ref |

## Guidelines

- Use for choices that can be selected independently. Use mixed for a partially selected parent group.
- A Select all checkbox selects or clears its children. Derive mixed from those children; changing an individual choice restores partial selection.
- Keep a visible label and retain native form participation. The application computes aggregate selection.

TypeScript declarations provide the complete public API.

## Related topics

- [Radio](../components/radio.md)
- [Switch](../components/switch.md)
- [Accessibility](../foundations/accessibility.md)
