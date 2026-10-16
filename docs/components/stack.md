---
title: Stack
summary: Use Stack for related content and ActionGroup for buttons.
status: beta
since: 0.1.0
category: Layout & surfaces
aliases:
  - layout
  - vertical stack
  - horizontal stack
  - spacing
  - action group
  - button set
related:
  - spacing
  - surface
  - card
components:
  - Stack
  - ActionGroup
---

# Stack

## React usage

```tsx
import { Stack, ActionGroup, Button, Text } from '@envsemble/envui';

<Stack gap={4}>
  <Text as="h3" variant="section-heading">Project details</Text>
  <Text>Shared plans and notes for the project.</Text>
  <Text variant="caption">Updated today</Text>
</Stack>

<ActionGroup>
  <Button variant="secondary">Cancel</Button>
  <Button>Save changes</Button>
</ActionGroup>

<ActionGroup stacked>
  <Button>Continue</Button>
  <Button variant="secondary">Cancel</Button>
</ActionGroup>
```

### Props & contracts

| Name                 | Contract                                                                                     |
| -------------------- | -------------------------------------------------------------------------------------------- |
| Stack gap            | Spacing step 0–9; default 4 (1 rem); 0 removes the gap                                       |
| Stack align          | start, center, end or stretch (default)                                                      |
| Stack as             | Semantic container tag; div (default), section, article, nav, main, aside, header or footer  |
| Stack render         | Compose layout onto another root; set the semantic tag on the supplied element instead of as |
| ActionGroup stacked  | Wrapped row by default; stacked label buttons fill the group                                 |
| ActionGroup align    | Row alignment: start (default), center or end                                                |
| ActionGroup as       | Semantic container tag; div by default, footer for card or form actions                      |
| Native element props | children, className, style, ref and accessible attributes                                    |

## Guidelines

- The parent owns space between components; components own their internal padding. Avoid individual child margins.
- Stack uses the shared spacing scale. Step 4 is 1 rem; step 2 is 0.5 rem. Cards already space direct children by 1 rem.
- ActionGroup uses 1 rem gaps in wrapped rows and 0.5 rem when stacked. Icon-only buttons keep their size.
- Use wrapped action rows when space permits and stacked actions when labels need more room. The application chooses when to switch layouts.
- With Stack render, put the semantic tag on the supplied element. Custom components must forward native props and refs.

TypeScript declarations provide the complete public API.

## Related topics

- [Spacing & shape](../foundations/spacing.md)
- [Surface](../components/surface.md)
- [Card](../components/card.md)
