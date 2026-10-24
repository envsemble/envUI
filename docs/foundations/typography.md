---
components:
  - Text
---

# Typography

## React usage

```tsx
import { Column, Text } from '@envsemble/envui';

<Column gap={4}>
  <Text render={<h1 />} variant="headline">
    Project overview
  </Text>
  <Text render={<h2 />} variant="title">
    Project details
  </Text>
  <Text>Shared context for your team.</Text>
  <Text emphasis="muted">Updated today</Text>
</Column>;
```

### Props & contracts

| Name          | Contract                                                                    |
| ------------- | --------------------------------------------------------------------------- |
| Text variant  | display, headline, title, body (the default), body-sm or caption            |
| Text emphasis | default, muted or subtle, in place of the variant's own color               |
| Text render   | The element, such as `render={<h2 />}` or `render={<span />}`; p by default |

## Guidelines

- Choose the element for the document's structure and the variant for its look, apart: a section's `h2` may be a title.
- One display text per view at most, for a page's hero; it scales from 1.75 to 2.75 rem and balances its lines.
- Inter at regular (400) and medium (500), from `--env-font-weight-*`; semibold (600) only for the strongest emphasis in a small space, such as today in a calendar.
- Text adds no outer spacing: a Column, a Row or the component around it owns the gaps.
- The 0.7 names are gone: page-heading is headline, section-heading is title, supporting is body-sm, `tone` is `emphasis` and `as` is `render`.

### Lists

Formatted text, which Markdown, RichText and RichTextEditor render in the `env-prose` class, gives its lists envUI's own markers in place of the browser's: a small dot in the muted text color, a ring one level in, and numbers in the muted color with tabular figures, then letters and roman numerals one and two levels in. Each marker hangs in the list's indent, on the middle of its item's first line, and items stand a small step apart. Custom properties on `env-prose` tune them: `--env-prose-list-marker-color`, `--env-prose-list-marker-size`, `--env-prose-list-marker-gap`, `--env-prose-list-indent` and `--env-prose-list-item-gap`.

- Use a list sparingly, for a few short items that read better apart, usually not full sentences.
- Prefer a sentence or a short paragraph to a list of one or two items.

TypeScript declarations provide the complete public API.

## Related topics

- [Colors & themes](../foundations/colors.md)
- [Column](../components/column.md)
- [Card](../components/card.md)
