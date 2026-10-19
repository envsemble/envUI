---
components:
  - Text
---

# Typography

## React usage

```tsx
import { Text, Stack } from '@envsemble/envui';

<Stack>
  <Text render={<h1 />} variant="headline">Project overview</Text>
  <Text render={<h2 />} variant="title">Project details</Text>
  <Text>Shared context for your team.</Text>
  <Text variant="body-sm">Notes for the project.</Text>
  <Text variant="caption">Updated today</Text>
</Stack>

<Stack>
  <Text render={<h3 />} variant="headline">Project overview</Text>
  <Text emphasis="muted">Shared project context.</Text>
  <Text emphasis="subtle">Updated today.</Text>
  <Text>Project status: <Text render={<span />} emphasis="muted">Draft</Text></Text>
</Stack>
```

### Props & contracts

| Name                 | Contract                                                                  |
| -------------------- | ------------------------------------------------------------------------- |
| Text variant         | display, body (default), headline, title, body-sm or caption              |
| Text emphasis        | Optional default, muted or subtle override of the variant’s default color |
| Text render          | The element, such as render={<h2 />} or render={<span />}; p by default   |
| Native element props | children, ref, className and accessible attributes                        |

## Guidelines

- Use Inter at regular (400) or medium (500) weight, with 1.4 line height; semibold (600) only for the strongest emphasis in a small space, such as today in a calendar. Take weights from `--env-font-weight-regular`, `--env-font-weight-medium` and `--env-font-weight-semibold`, not literal numbers. The preview orders styles by emphasis.
- Choose the semantic element separately from its visual style. Use actual headings for document structure.
- Use display for a page hero or welcome: it scales from 1.75 to 2.75 rem with the viewport and balances its lines. Use at most one display text per view.
- Text applies the shared scale and palette. Small body text (body-sm) and captions are small and muted. In 1.0, page-heading is headline, section-heading is title, supporting is body-sm, and `tone` is `emphasis` (primary is default, quiet is subtle); `as` is `render`.
- Text adds no outer spacing. Stack or the containing component owns the gaps.

TypeScript declarations provide the complete public API.

## Related topics

- [Colors & themes](../foundations/colors.md)
- [Stack](../components/stack.md)
- [Card](../components/card.md)
