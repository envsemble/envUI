---
title: InfoChip
summary: Read-only metadata beside related content.
status: beta
since: 0.1.0
category: Content & guidance
aliases:
  - info chip
  - chip
  - tag
  - metadata
related:
  - card
  - typography
  - disclosure
  - badge
components:
  - InfoChip
---

# InfoChip

## React usage

```tsx
import { InfoChip, ActionGroup } from '@envsemble/envui';

<ActionGroup>
  <InfoChip>Optional</InfoChip>
  <InfoChip>3 members</InfoChip>
</ActionGroup>;
```

### Props & contracts

| Name     | Contract                            |
| -------- | ----------------------------------- |
| InfoChip | children and native span attributes |

## Guidelines

- Use chips for short metadata. They have no hover, focus, filtering or selected state.
- Place metadata beside the content it describes. Use a button for an action or a selection control for a choice.

TypeScript declarations provide the complete public API.

## Related topics

- [Card](../components/card.md)
- [Typography](../foundations/typography.md)
- [Disclosure](../components/disclosure.md)
- [Badge](../components/badge.md)
