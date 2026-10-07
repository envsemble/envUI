# Grouped rows

## React usage

```tsx
import { GroupedRows, Row, Button } from '@envsemble/envui';

<GroupedRows>
  <Row
    title="Notifications"
    detail="Delivery preferences"
    action={<Button variant="outlined">Manage</Button>}
  />
  <Row title="Members" detail="Workspace access" />
</GroupedRows>;
```

### Props & contracts

| Name                        | Contract                               |
| --------------------------- | -------------------------------------- |
| GroupedRows contrast        | Use alternate fill inside a muted pane |
| Row title / detail / action | General React content                  |
| Native container props      | className and accessible attributes    |

## Guidelines

- One row uses the full 1.75 rem outer radius. Multiple rows keep large outer corners and 0.5 rem inner corners.
- Rows have a 3.5 rem minimum height and a 0.125 rem gap. In a muted pane, use contrast fill to distinguish the rows.
- Keep actions short and let long titles and details wrap.

TypeScript declarations provide the complete public API.

## Related topics

- [Surface](../components/surface.md)
- [Cards](../components/cards.md)
- [Radio groups](../components/radio.md)
- [Selects](../components/select.md)
- [Spacing & shape](../foundations/spacing.md)
