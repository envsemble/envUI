---
title: Feature cards
summary: Introduce a feature with an icon, a heading, a sentence and the one action that starts it, in a Card.
status: beta
since: 1.0.0
intent: Frame the application
aliases:
  - FeatureCard
  - feature card
  - feature layout
  - layout="feature"
  - call to action card
  - promo card
  - onboarding card
useWhen:
  - Introducing a feature or a next step, such as inviting the team
  - One action that starts it
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
---

# Feature cards

## Overview

Everything sits in one [Row](../components/row.md) inside the [Card](../components/card.md), the icon muted and the [Button](../components/button.md) at the far end, so the action is the last thing people read.

```tsx example=ImportPlans

```

## When to use

### Heading level

Give the heading the level the page's outline needs, such as one below the section it sits in; its look stays the same. A few feature cards side by side sit in a [Grid](../components/grid.md) of even columns.

### Content

The heading names the feature, the sentence says what it gives people, and the button starts it with a verb: Import, Invite people.

## Anatomy

```tsx anatomy=FeatureCardAnatomy

```

1. **Card** (`env-card`)
2. **Icon** (`env-card env-text > svg`)
3. **Heading** (`env-card env-text[data-variant='headline']`)
4. **Sentence** (`env-card env-text[data-variant='body-sm']`)
5. **Action** (`env-card env-button`)

## Adapting to width

The text takes the room the icon and the action leave; in a narrow card the action moves below the text.

```tsx example=InviteFeature widths="24 40"

```

## Accessibility

### envUI provides

- The icon hidden from assistive technology, so the heading and the sentence are what is read.
- A native button, or a link with `href`, for the action.

### You provide

- A heading level that fits the page's outline.
- An action label that makes sense on its own, such as Invite people rather than Start.

## In code

### Usage

A Card holds a Row with `wrap` and `align="center"`: the icon in a muted Text with `render={<span />}`, a Column of a headline Text and a `body-sm` Text, and a secondary Button. The Column takes `flex: '1 1 16rem'`, so the text keeps at least 16 rem and the action wraps below it in a narrower card. Render the heading at the level the outline needs, such as `render={<h3 />}` under a section's `h2`; `variant="headline"` keeps its look. The Button takes `href` where the action goes somewhere.

```tsx source=ImportPlans

```

### Composition

Lay several feature cards side by side in a Grid of even columns. The parts are the card, `env-card`, the icon, `env-card env-text > svg`, the heading, `env-card env-text[data-variant='headline']`, the sentence, `env-card env-text[data-variant='body-sm']`, and the action, `env-card env-button`.

## Changelog

- **1.0.0**: Feature cards are a pattern built from Card, Row, Column, Text and Button, in place of Card's `layout="feature"` and `icon`.
