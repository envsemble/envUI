---
title: Card
summary: A rounded surface that groups content about one subject, as a content card with a title and actions, or one link or button.
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
  - ClickableCard
  - ActionCard
useWhen:
  - Content about one subject, such as a project's summary
  - A summary with its own actions, such as Share and Open
  - A whole surface that leads to one place or starts one action
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
  - text: A feature introduced with an icon, a sentence and the one action that starts it.
    see: feature-cards
  - text: Content that needs no surface of its own, such as a form on a page.
    use: Column
components:
  - Card
---

# Card

## Overview

```tsx example=ProjectSummary

```

### Loading

While its content loads, a card shows as its own skeleton: text becomes bars and controls become filled shapes, as [Loading](../patterns/loading.md) shows.

```tsx example=CardLoading

```

## Variants

### Content card

The default: a title, a short fact beside it, a description, its content, and actions in a strip along the bottom.

```tsx example=ActionStrip

```

### Link card

The whole card is one link.

```tsx example=Destinations

```

### Button card

The whole card is one button. It holds only short text, with no headings, lists or controls.

```tsx example=StartOptions

```

### Backgrounds

```tsx variants=Backgrounds

```

1. **Muted**
2. **Default**
3. **Page**

| Background | Use for                                         |
| ---------- | ----------------------------------------------- |
| Muted      | A card on the page or in a pane. The default.   |
| Default    | A quieter fill, such as a settings section.     |
| Page       | The page's own color, set apart by its corners. |

## When to use

```tsx do=OneCardSections caption="One card per subject, with Text for its parts."

```

```tsx dont=NestedCards caption="Cards inside cards: the fills and corners stack up."

```

### Content

Put the fact that matters most for choosing beside the title, and start a link card with its destination's name. A link or button card holds no links or controls of its own.

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

### Colors

One card can take colors of its own: its surface, its text and an edge. Its hover, focus and press then follow them; with none set, it keeps its own colors.

## Adapting to width

A card fills its container.

## Accessibility

### Keyboard

| Key                                             | Action                                          |
| ----------------------------------------------- | ----------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves to a link or button card, or into a card. |
| <kbd>Enter</kbd>                                | Follows a link card or presses a button card.   |
| <kbd>Space</kbd>                                | Presses a button card.                          |

### envUI provides

- Native `<a>` and `<button>` for link and button cards, named by their text.
- The title as an `h3`, or the level of `headingLevel`.
- A focus outline, and `aria-disabled` on a disabled link card.

### You provide

- A `headingLevel` that fits the page's outline.
- `render={<article />}` for a card that stands on its own.
- No `aria-label` that leaves out the card's visible text.
- Routing behind `href`, through `LinkProvider`.

## In code

### Usage

A content card takes its `title`, a `meta` fact at the end of the title row, a `description` under it, its content as `children`, and `actions` in a strip along the bottom. Set `render={<article />}` on a card that stands on its own.

```tsx source=ActionStrip

```

#### Link and button cards

With `href`, the whole card is one native link, through the application's router link from `LinkProvider`; with `onClick`, it is one native button. Either holds only phrasing content, such as spans, and no links or controls of its own, and its text names it. `disabled` turns either off.

```tsx
<Card href="/projects/northwind">
  <Text render={<span />} variant="title">
    Northwind launch
  </Text>
  <Text render={<span />} emphasis="muted">
    12 open tasks
  </Text>
</Card>
```

#### Backgrounds

`background` is `muted`, the default, `default` or `page`.

```tsx
<Card background="default" title="Notifications">
  <Text emphasis="muted">Email for mentions and a weekly summary.</Text>
</Card>
```

#### Loading

`skeleton` shows the card as its own skeleton until its content arrives. Render the same cards over placeholder items, from `placeholders`; a `title` or `description` given as undefined is a bar of its usual length.

```tsx source=CardLoading

```

### Composition

The title is an `h3`; set `headingLevel` to fit the page's outline, and its type stays the title type. Lay out the content with Text, Row and Column, one card per subject, never a card inside a card, and put cards side by side in a Grid. A card fills its container's width.

The parts are the surface, `env-card`, its header, `env-card-header`, with the title, `env-card-heading`, and the meta, `env-card-meta`; the description, `env-card-description`; the body, `env-card-body`; and the actions, `env-card-footer`.

### Customize

`--env-card-container`, `--env-card-content` and `--env-card-outline` set the colors of one Card, through `style` or CSS. Its hover, focus and press then follow them, as state layers; with none set, it keeps its own colors. `padding` sets the inset as a step of the spacing scale, such as `6` for 2 rem, and `0` removes it.

```tsx
<Card
  title="Northwind launch"
  padding={6}
  style={{ '--env-card-container': 'var(--env-color-bg-brand-muted)' } as CSSProperties}
/>
```

## Changelog

- **1.0.0**: ClickableCard, ActionCard and FeatureCard are Card: `onClick` makes a button card, `render` the element of a content card, and the feature card is the [feature cards](../patterns/feature-cards.md) pattern, built from a Card with a Row of Text and a Button, in place of `layout` and `icon`, with `env-card-layout` and `env-card-icon`. `tone` is `background`, `heading` is `title`, which takes `headingLevel`, and Card takes `description`; the native `title` attribute is not a prop of a card. The page is `card`, after the component.
- **0.5.0**: `meta` sits at the end of the heading row, also in right-to-left text.
- **0.2.0**: Link cards render through the application's router link, from `LinkProvider`.
- **0.1.0**: Card for plain, interactive and action-strip cards, with ClickableCard and ActionCard as wrappers; FeatureCard.
