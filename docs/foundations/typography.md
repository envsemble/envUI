# Typography

## React usage

```tsx
import { Text, Stack } from '@envsemble/envui';

<Stack>
  <Text as="h1" variant="page-heading">Project overview</Text>
  <Text as="h2" variant="section-heading">Project details</Text>
  <Text>Shared context for your team.</Text>
  <Text variant="supporting">Notes for the project.</Text>
  <Text variant="caption">Updated today</Text>
</Stack>

<Stack>
  <Text as="h3" variant="page-heading">Project overview</Text>
  <Text tone="muted">Shared project context.</Text>
  <Text tone="quiet">Updated today.</Text>
  <Text>Project status: <Text as="span" tone="muted">Draft</Text></Text>
</Stack>
```

### Props & contracts

| Name                 | Contract                                                                 |
| -------------------- | ------------------------------------------------------------------------ |
| Text variant         | body (default), page-heading, section-heading, supporting or caption     |
| Text tone            | Optional primary, muted or quiet override of the variant’s default color |
| Text as              | Native text tag; p (default), span, small, strong or h1–h6               |
| Native element props | children, ref, className and accessible attributes                       |

## Guidelines

- Use Inter at regular (400) or medium (500) weight, with 1.4 line height. The preview orders styles by emphasis.
- Choose the semantic element separately from its visual style. Use actual headings for document structure.
- Text applies the shared scale and palette. Supporting text is small and muted; captions are small and quiet.
- Text adds no outer spacing. Stack or the containing component owns the gaps.

TypeScript declarations provide the complete public API.

## Related topics

- [Colors & themes](../foundations/colors.md)
- [Stacks & action groups](../components/layout.md)
- [Cards](../components/cards.md)
