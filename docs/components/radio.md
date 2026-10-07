# Radio groups

## React usage

```tsx
import { RadioGroup, Radio } from '@envsemble/envui';

<RadioGroup label="Access" name="access" value={access} onValueChange={setAccess} variant="rows">
  <Radio value="team" label="Team" detail="Everyone in your workspace" />
  <Radio value="private" label="Private" detail="Only invited people" />
</RadioGroup>;
```

### Props & contracts

| Name       | Contract                                                           |
| ---------- | ------------------------------------------------------------------ |
| RadioGroup | label, name, value/defaultValue, onValueChange, required, disabled |
| variant    | inline (default) or rows                                           |
| Radio      | value, label, detail, disabled and native input props              |

## Guidelines

- Use radios when one alternative must be selected and the choices benefit from being visible together.
- Selectable rows reuse the grouped-row geometry. Use a unique group name for each form.

TypeScript declarations provide the complete public API.

## Related topics

- [Selects](../components/select.md)
- [Checkboxes](../components/checkbox.md)
- [Grouped rows](../components/rows.md)
