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

### Tokens for application CSS

Type takes the `--env-type-*` and `--env-font-*` tokens, such as `--env-type-body` and `--env-font-weight-medium`, which follow the theme's [scale](../foundations/spacing.md) and the reader's text size.

## Text styles

At the default 16 px root, in the comfortable [scale](../foundations/spacing.md#sizes-in-each-scale); compact takes each a step smaller. Display, headline and title are medium (500), the rest regular (400).

| Variant    | On the Site | Size                               | Color                    |
| ---------- | ----------- | ---------------------------------- | ------------------------ |
| `display`  | Display     | 1.75 to 2.75 rem, with the window  | `--env-color-fg-default` |
| `headline` | Headline    | 1.125 rem, `--env-type-h1`         | `--env-color-fg-default` |
| `title`    | Title       | 1 rem, `--env-type-h2`             | `--env-color-fg-default` |
| `body`     | Body        | 0.9375 rem, `--env-type-body`      | `--env-color-fg-default` |
| `body-sm`  | Small body  | 0.875 rem, `--env-type-body-small` | `--env-color-fg-muted`   |
| `caption`  | Caption     | 0.875 rem, `--env-type-body-small` | `--env-color-fg-muted`   |

`emphasis` replaces a variant's color: `default` is `--env-color-fg-default`, and `muted` and `subtle` are both `--env-color-fg-muted` today.

## The words people use

The Site's Typography page names the text styles by their job and teaches these phrases. Each maps to one change here:

| Words on the Site           | What it means in code                                                         |
| --------------------------- | ----------------------------------------------------------------------------- |
| A hero line                 | `variant="display"`, once per view at most                                    |
| A page title                | `variant="headline"` on the page's heading element, such as `render={<h1 />}` |
| A section title             | `variant="title"` on the section's heading element, such as `render={<h2 />}` |
| Body                        | `variant="body"`, the default                                                 |
| Supporting text             | `variant="body-sm"`, muted by default                                         |
| A caption                   | `variant="caption"`                                                           |
| Quieter text                | `emphasis="muted"` on Text of any variant                                     |
| Text follows the reader     | Nothing to do: type is in rem and follows the scale                           |
| Space belongs to the layout | Text has no margins; set `gap` on the Column or Row around it                 |

## Guidelines

- Choose the element for the document's structure and the variant for its look, apart: a section's `h2` may be a title.
- One display text per view at most, for a page's hero; it scales from 1.75 to 2.75 rem and balances its lines.
- Inter at regular (400) and medium (500), from `--env-font-weight-*`; semibold (600) only for the strongest emphasis in a small space, such as today in a calendar.
- Text adds no outer spacing: a Column, a Row or the component around it owns the gaps.
- The 0.7 names are gone: page-heading is headline, section-heading is title, supporting is body-sm, `tone` is `emphasis` and `as` is `render`.

### Lists

Formatted text, which Markdown, RichText and RichTextEditor render in the `env-prose` class, sets its lists apart from the text around them: a bullet is a plain small dot in the text color, on the middle of the item's first line, and an ordered item's number is plain, in tabular figures in the muted text color; items stand a full step apart. A nested list steps down quietly, with closer items and a small muted ring, or a letter for an ordered item. Task lists keep their checkboxes.

TypeScript declarations provide the complete public API.

## Related topics

- [Colors & themes](../foundations/colors.md)
- [Spacing & density](../foundations/spacing.md)
- [Column](../components/column.md)
- [Card](../components/card.md)
