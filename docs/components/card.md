---
title: Card
summary: A rounded surface that groups content about one subject, as a content card with a title and actions, a feature card, or one link or button.
status: stable
since: 0.1.0
category: Layout & surfaces
aliases:
  - tile
  - panel
  - content card
  - clickable card
  - link card
  - button card
  - action card
  - feature card
  - promo card
  - ClickableCard
  - ActionCard
  - FeatureCard
useWhen:
  - Content about one subject stands apart from the page, such as a project's summary.
  - A summary needs its own actions along the bottom, such as Share and Open (`actions`).
  - The whole surface leads to one destination or starts one action, such as a project in a grid (`href`, `onClick`).
  - A feature is introduced with an icon, a sentence and one action (`layout="feature"`).
avoidWhen:
  - text: A fill, padding and corners without card semantics or spacing, such as a toolbar's background.
    use: Surface
  - text: Rows of items with a label, a description and an action, connected in one list.
    use: List
  - text: Data to compare across rows and columns.
    use: Table
  - text: A message about the page or a section.
    use: Alert
  - text: A region with no content yet.
    see: empty-states
related:
  - surface
  - column
  - list
  - button
  - typography
components:
  - Card
---

# Card

## Overview

A card groups content about one subject on a rounded surface.

```tsx example=ProjectSummary

```

### Loading

`skeleton` shows the card as its own skeleton until its content arrives: text becomes bars and controls filled shapes. Render it over placeholder items, as [Loading](../patterns/loading.md) shows; a title or description given as undefined is a bar of its usual length.

```tsx example=CardLoading

```

## Variants

### Content card

The default: `title`, `meta`, `description`, and `actions` in a strip along the bottom.

```tsx example=ActionStrip

```

### Feature card

`layout="feature"`: an icon, a title and a sentence, and one action.

```tsx example=FeatureCards

```

### Link card

With `href`, the whole card is one link.

```tsx example=Destinations

```

### Button card

With `onClick`, the whole card is one button. It holds only phrasing content, such as spans.

```tsx example=StartOptions

```

### Backgrounds

| Background | Use for                                         |
| ---------- | ----------------------------------------------- |
| `muted`    | A card on the page or in a pane. The default.   |
| `default`  | A quieter fill, such as a settings section.     |
| `page`     | The page's own color, set apart by its corners. |

<!-- specimen: Backgrounds -->

## When to use

```tsx do=OneCardSections caption="One card per subject, with Text for its parts."

```

```tsx dont=NestedCards caption="Cards inside cards: the fills and corners stack up."

```

- No links or controls inside a link or button card.

### Content

```tsx do=ShortCard caption="A short title that names the subject, and a sentence or two."

```

```tsx dont=WordyCard caption="A long title and a paragraph: the card stops being scannable."

```

- Put the fact that matters most for choosing in `meta`.
- Start a link card with its destination's name.

## Anatomy

```tsx anatomy=CardAnatomy

```

1. **Surface** (`env-card`)
2. **Header** (`env-card-header`)
3. **Title** (`env-card-heading`, `title`)
4. **Meta** (`env-card-meta`, `meta`)
5. **Description** (`env-card-description`, `description`)
6. **Content** (`env-card-body > env-text:last-child`, `children`)
7. **Actions** (`env-card-footer`, `actions`)

The feature layout adds `env-card-layout` and its icon, `env-card-icon`.

## Adapting to width

A card fills its container. Narrower than 38 rem, a feature card moves its action below the text.

```tsx example=InviteFeature widths="24 40"

```

## Accessibility

### Keyboard

| Key                                             | Action                                          |
| ----------------------------------------------- | ----------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves to a link or button card, or into a card. |
| <kbd>Enter</kbd>                                | Follows a link card or presses a button card.   |
| <kbd>Space</kbd>                                | Presses a button card.                          |

### envUI provides

- Native `<a>` and `<button>` for link and button cards, named by their text.
- The title as an `h3`, or `h2` in the feature layout.
- A focus outline, and `aria-disabled` on a disabled link card.

### You provide

- A `headingLevel` that fits the page's outline.
- `render={<article />}` for a card that stands on its own.
- No `aria-label` that leaves out the card's visible text.
- Routing behind `href`, through `LinkProvider`.

## Changelog

- **1.0.0**: ClickableCard, ActionCard and FeatureCard are Card: `onClick` makes a button card, `render` the element of a content card, and `layout="feature"` the feature card. `tone` is `background`, `heading` is `title`, which takes `headingLevel`, as on EmptyState, and Card takes `description`; the native `title` attribute is not a prop of a card. The page is `card`, after the component.
- **0.5.0**: `meta` sits at the end of the heading row, also in right-to-left text.
- **0.2.0**: Link cards render through the application's router link, from `LinkProvider`.
- **0.1.0**: Card for plain, interactive and action-strip cards, with ClickableCard and ActionCard as wrappers; FeatureCard.
