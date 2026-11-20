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
  - AnimatedNumber
  - animated number
  - rolling number
  - number animation
  - counter
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
  TextSize: example
  Measure: example
  ChangingNumber:
    role: example
    caption: The count rolls in from below as it grows and from above as it shrinks, and changes without moving when the reader prefers reduced motion. It is plain text in the button, so the button's name always says the current count, and it takes no focus of its own.
---

# Typography

## Options

Six text styles, each with one job, in one typeface at a regular and a medium weight. Supporting text steps back by color, not by size.

```tsx figure=Screen

```

1. **Headline**
2. **Title**
3. **Body**
4. **Small body**
5. **Caption**

```tsx figure=Styles

```

1. **Display**: The one large line that opens a page, at most once.
2. **Headline**: The title of a page, once per page.
3. **Title**: The title of a pane, a section, a card or a dialog, and of a section inside a pane, so nothing in a pane outranks its title.
4. **Body**: Most text: paragraphs, descriptions and values.
5. **Small body**: Supporting text, a step smaller and quieter.
6. **Caption**: A note under a figure or a chart.

```tsx figure=Emphasis

```

## Behaviour

Text follows the reader's text size, and the compact scale sets every style a step smaller.

```tsx figure=TextSize

```

### A number that changes

```tsx figure=ChangingNumber

```

## Rules

Open with a sentence in the main color, then the detail in the quieter one. Keep paragraphs short and lines about 60 to 75 characters long. Text adds no space around itself: the layout sets the gaps.

```tsx figure=Hierarchy

```

1. **Lead**: What matters most, first, in the main color.
2. **Supporting text**: The detail after it, in the quieter color.
3. **Small body**: A note under a title, a step smaller.

```tsx figure=Measure

```

## Compose

### Usage

The element sets the document's structure and `variant` the look, apart; `emphasis="muted"` quiets text of any variant.

```tsx
import { Column, Text } from '@envsemble/envui';

<Column gap={4}>
  <Text render={<h1 />} variant="headline">
    Project overview
  </Text>
  <Text>Shared context for your team.</Text>
  <Text emphasis="muted">Updated today</Text>
</Column>;
```

### Customize

Values at the default 16 px root.

#### Text styles

| Token                 | Comfortable                                                                    | Compact                                                                        | Use                                                                                                                                         |
| --------------------- | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `--env-type-body`     | `400 0.9375rem / 1.4em`                                                        | `400 0.8125rem / 1.4em`                                                        | Running text: Text's body variant, regular.                                                                                                 |
| `--env-type-body-sm`  | `400 0.875rem / 1.4em`                                                         | `400 0.75rem / 1.4em`                                                          | Supporting text: Text's body-sm and caption variants, regular.                                                                              |
| `--env-type-display`  | `500 clamp(1.75rem, 1.25rem + 2.5vw, 2.75rem) / 1.1 'envUI Geist', sans-serif` | `500 clamp(1.75rem, 1.25rem + 2.5vw, 2.75rem) / 1.1 'envUI Geist', sans-serif` | Display text, Text's display variant: medium, 1.75 to 2.75 rem with the window, set tight.                                                  |
| `--env-type-headline` | `500 1.375rem / 1.3em`                                                         | `500 1.25rem / 1.3em`                                                          | A page's heading: Text's headline variant, medium, its lines tighter than body text's and its letters a touch closer, as larger type wants. |
| `--env-type-title`    | `500 1.125rem / 1.35em`                                                        | `500 1rem / 1.35em`                                                            | A section's heading: Text's title variant, medium, its lines a little tighter than body text's and its letters a touch closer.              |

#### Font sizes

| Token                      | Comfortable | Compact     | Use                                                                                                                          |
| -------------------------- | ----------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `--env-font-size-body`     | `0.9375rem` | `0.8125rem` | Running text: Text's body variant and a type role's default, 15 px in the comfortable scale.                                 |
| `--env-font-size-body-sm`  | `0.875rem`  | `0.75rem`   | Supporting text: Text's body-sm and caption variants, 14 px in the comfortable scale.                                        |
| `--env-font-size-caption`  | `0.75rem`   | `0.6875rem` | Captions, a menu's group labels and other small secondary text.                                                              |
| `--env-font-size-headline` | `1.375rem`  | `1.25rem`   | A page's heading: Text's headline variant, 22 px in the comfortable scale: a clear step above a section's title.             |
| `--env-font-size-label`    | `0.875rem`  | `0.8125rem` | The label of a control, and the text of menu, tree and option rows.                                                          |
| `--env-font-size-label-sm` | `0.8125rem` | `0.75rem`   | A label inside a field at the control height, such as a combobox chip's.                                                     |
| `--env-font-size-title`    | `1.125rem`  | `1rem`      | A section's heading: Text's title variant, 18 px in the comfortable scale: a step above body text in size as well as weight. |

#### Typeface and weights

| Token                        | Comfortable                 | Compact                     | Use                                                                                                |
| ---------------------------- | --------------------------- | --------------------------- | -------------------------------------------------------------------------------------------------- |
| `--env-font-family`          | `'envUI Geist', sans-serif` | `'envUI Geist', sans-serif` | envUI's typeface, Geist, which the package ships, falling back to the system's sans-serif.         |
| `--env-font-weight-body`     | `400`                       | `400`                       | The weight of running text, which the body type roles take: regular.                               |
| `--env-font-weight-medium`   | `500`                       | `500`                       | Medium, 500: headings, labels that lead and emphasis in a row.                                     |
| `--env-font-weight-regular`  | `400`                       | `400`                       | Regular, 400: running text and most labels.                                                        |
| `--env-font-weight-semibold` | `600`                       | `600`                       | Semibold, 600: the strongest emphasis in a small space, such as today in a calendar.               |
| `--env-line-height-body`     | `1.4`                       | `1.4`                       | The line height of a theme boundary's text, which an application may set: 1.4 times the font size. |
