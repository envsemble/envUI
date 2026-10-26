---
title: Typography
summary: A few text styles, each with one job, from a page's hero line to small notes.
components:
  - Text
aliases:
  - type
  - text styles
  - font
  - heading
  - headline
  - body text
  - caption
  - muted text
  - line length
avoidWhen:
  - text: Colors for text, in every theme.
    see: colors
  - text: The space between a title and its paragraph, and the compact scale.
    see: spacing
  - text: Text one under another with even gaps.
    use: Column
  - text: A title, a description and actions about one subject.
    use: Card
examples:
  Screen: example
  Styles: example
  Emphasis: example
  Hierarchy: example
---

# Typography

## Options

### A few styles, each with a job

envUI sets text in six styles, from the one large line that opens a page to small notes.

- Each style has one job, so a title or a note looks the same on every screen.

```tsx figure=Screen

```

1. **Headline**
2. **Title**
3. **Body**
4. **Small body**
5. **Caption**

### Every style

Each style, largest first, in the theme you are reading in, with what it is for.

```tsx figure=Styles

```

1. **Display**: The one large line that opens a page, at most once.
2. **Headline**: The title of a page.
3. **Title**: The title of a section, a card or a dialog.
4. **Body**: Most text: paragraphs, descriptions and values.
5. **Small body**: Supporting text, a step smaller and quieter.
6. **Caption**: A note under a figure or a chart.

### Quieter, not smaller

Text can step back without getting smaller: supporting text takes a quieter color than the main text, at any size.

- The main color is for what people read first, and the quieter one for details, dates and hints.
- Both keep their contrast in every theme, high contrast included.

```tsx figure=Emphasis

```

### One typeface, two weights

Everything is set in one typeface, at a regular weight for reading and a medium weight for headings and labels.

- A bold weight is kept for the strongest emphasis in a small space, such as today in a calendar.

## Behaviour

### Text follows the reader

Text grows with the text size people choose in their browser, and the compact scale makes every style a step smaller.

- Choose Compact under Scale in the Display menu to see it on this site.

## Rules

Running text reads best in short paragraphs whose lines stop at a comfortable length.

### A lead, then quieter detail

Open a page or a section with a sentence or two in the main color that say what matters.

- Set the detail after it in the quieter color, or a step smaller, so people can read the start and skip the rest.

```tsx figure=Hierarchy

```

1. **Lead**: What matters most, first, in the main color.
2. **Supporting text**: The detail after it, in the quieter color.
3. **Small body**: A note under a title, a step smaller.

### Lines a comfortable length

A line holds about as many words as a line of a book.

- However wide the window, a paragraph wraps at that length, so the eye finds the start of the next line easily.

### Short paragraphs

A paragraph makes one point in a few lines.

- Two points are two paragraphs, which read faster than one long block.

### Space belongs to the layout

Text adds no space around itself.

- The space between a title and its paragraph comes from the group they are in, so text sits the same in every component.

## Words to use

Ask an agent for text in these words; envUI turns each into a style, so the result matches the rest of the app.

| Words            | In code                                                                       | Use for                                                                                      |
| ---------------- | ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| A hero line      | `variant="display"`, once per view at most                                    | The display style: one large line that opens a page.                                         |
| A page title     | `variant="headline"` on the page's heading element, such as `render={<h1 />}` | The headline style, as the page’s main heading.                                              |
| A section title  | `variant="title"` on the section's heading element, such as `render={<h2 />}` | The title style, for a section, a card or a dialog.                                          |
| Supporting text  | `variant="body-sm"`, muted by default                                         | Text a step smaller and quieter, for details and hints.                                      |
| A caption        | `variant="caption"`                                                           | A small, quiet note under a figure or a chart.                                               |
| Quieter text     | `emphasis="muted"` on Text of any variant                                     | The same size in the quieter color of supporting text.                                       |
| A lead           | The first paragraph as body in the default color; the detail after it muted   | The sentence or two that open a page or a section, in the main color, before quieter detail. |
| Short paragraphs | A few lines each, with `max-inline-size: 56ch` on running text                | Running text in paragraphs of a few lines, each line a comfortable length.                   |

## Compose

### Usage

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

| Name          | Takes                                                                       |
| ------------- | --------------------------------------------------------------------------- |
| Text variant  | display, headline, title, body (the default), body-sm or caption            |
| Text emphasis | default, muted or subtle, in place of the variant's own color               |
| Text render   | The element, such as `render={<h2 />}` or `render={<span />}`; p by default |

#### Text styles

At the default 16 px root, in the comfortable [scale](spacing.md), as its Sizes in each scale lists them; compact takes each a step smaller. Display, headline and title are medium (500), the rest regular (400).

| Variant    | In the catalogue | Size                               | Color                    |
| ---------- | ---------------- | ---------------------------------- | ------------------------ |
| `display`  | Display          | 1.75 to 2.75 rem, with the window  | `--env-color-fg-default` |
| `headline` | Headline         | 1.125 rem, `--env-type-h1`         | `--env-color-fg-default` |
| `title`    | Title            | 1 rem, `--env-type-h2`             | `--env-color-fg-default` |
| `body`     | Body             | 0.9375 rem, `--env-type-body`      | `--env-color-fg-default` |
| `body-sm`  | Small body       | 0.875 rem, `--env-type-body-small` | `--env-color-fg-muted`   |
| `caption`  | Caption          | 0.875 rem, `--env-type-body-small` | `--env-color-fg-muted`   |

`emphasis` replaces a variant's color: `default` is `--env-color-fg-default`, and `muted` and `subtle` are both `--env-color-fg-muted` today.

#### The words of the figures

- **Body**: `variant="body"`, the default.
- **Text follows the reader**: nothing to do; type is in rem and follows the scale.
- **Space belongs to the layout**: Text has no margins; set `gap` on the Column or Row around it.

### Composition

- Choose the element for the document's structure and the variant for its look, apart: a section's `h2` may be a title.
- One display text per view at most, for a page's hero; it scales from 1.75 to 2.75 rem and balances its lines.
- Inter at regular (400) and medium (500), from `--env-font-weight-*`; semibold (600) only for the strongest emphasis in a small space, such as today in a calendar.
- Text adds no outer spacing: a Column, a Row or the component around it owns the gaps.
- Vary the text by its role rather than setting everything as body: open with what matters in the default color, and set supporting text, such as a description under a title, details and hints, `emphasis="muted"` or `body-sm`.
- Keep running text to a readable measure, about 60–75 characters a line: give paragraphs and Markdown a `max-inline-size` of about `56ch`, since Text and Markdown fill their container. Write short paragraphs, one point each, a few lines long.
- The 0.7 names are gone: page-heading is headline, section-heading is title, supporting is body-sm, `tone` is `emphasis` and `as` is `render`.

#### Lists

Formatted text, which Markdown, RichText and RichTextEditor render in the `env-prose` class, sets its lists apart from the text around them.

- A bullet is a plain small dot in the text color, on the middle of the item's first line.
- An ordered item's number is plain, in tabular figures in the muted text color.
- Items stand a full step apart.
- A nested list steps down quietly, with closer items and a small muted ring, or a letter for an ordered item.
- Task lists keep their checkboxes.

### Customize

Type takes the `--env-type-*` and `--env-font-*` tokens, such as `--env-type-body` and `--env-font-weight-medium`, which follow the theme's [scale](spacing.md) and the reader's text size.

TypeScript declarations provide the complete public API.
