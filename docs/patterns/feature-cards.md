---
title: Feature cards
summary: Introduce a feature with an icon, a heading, a sentence and the one action that starts it, in a Card.
status: beta
since: 1.0.0
intent: Find and navigate
aliases:
  - FeatureCard
  - feature card
  - feature layout
  - layout="feature"
  - call to action card
  - promo card
  - onboarding card
useWhen:
  - A feature or a next step is introduced on a page, such as importing plans or inviting the team, with one action that starts it.
avoidWhen:
  - text: A summary of one subject people open or act on, with a title row and actions.
    use: Card
  - text: A region with nothing to show yet, whose action ends that state.
    see: empty-states
  - text: A message about a page or section that people may need to act on.
    use: Alert
composes:
  - Card
  - Row
  - Column
  - Text
  - Button
related:
  - card
  - empty-states
  - button
---

# Feature cards

## Overview

A feature card is a [Card](../components/card.md) holding a [Row](../components/row.md): a muted icon, a heading and a sentence in a [Column](../components/column.md) of [Text](../foundations/typography.md), and the one [Button](../components/button.md) that starts the feature, at the end of the row.

```tsx example=ImportPlans

```

## When to use

```tsx do=OneAction caption="One action, the one that starts the feature."

```

```tsx dont=SeveralActions caption="Several actions: none of them says what the card is for."

```

- Give the heading the level the page's outline needs, such as `render={<h3 />}` under a section's `h2`; its look stays the headline type.
- A few feature cards side by side sit in a [Grid](../components/grid.md) of even columns.

### Content

- The heading names the feature, the sentence says what it gives people, and the button starts it with a verb: Import, Invite people.

## Anatomy

```tsx anatomy=FeatureCardAnatomy

```

1. **Card** (`env-card`)
2. **Icon** (`env-card env-text > svg`)
3. **Heading** (`env-card env-text[data-variant='headline']`)
4. **Sentence** (`env-card env-text[data-variant='body-sm']`)
5. **Action** (`env-card env-button`)

## Adapting to width

The text takes the room the icon and the action leave, at least 16 rem; in a narrower card the action moves below the text.

```tsx example=InviteFeature widths="24 40"

```

## Accessibility

### envUI provides

- The icon hidden from assistive technology, so the heading and the sentence are what is read.
- A native button, or a link with `href`, for the action.

### You provide

- A heading level that fits the page's outline.
- An action label that makes sense on its own, such as Invite people rather than Start.

## Changelog

- **1.0.0**: Feature cards are a pattern built from Card, Row, Column, Text and Button, in place of Card's `layout="feature"` and `icon`.
