---
title: Card
summary: A rounded surface that groups content about one subject.
status: stable
since: 1.0.0
category: App frame & layout
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
  - FeatureCard
  - feature card
  - feature layout
  - layout="feature"
  - call to action card
  - promo card
  - onboarding card
useWhen:
  - Content about one subject, such as a project's summary
  - A summary with its own actions, such as Share and Open
  - A whole surface that leads to one place or starts one action
avoidWhen:
  - text: A background, an inset and corners, without a card's spacing.
    use: Surface
  - text: Rows of items, each with a label, a description and an action.
    use: List
  - text: Data to compare across rows and columns.
    use: Table
components:
  - Card
examples:
  ProjectSummary:
    role: overview
    stage: shaded
  ActionStrip: example
  Destinations: example
  OpenFromCard: example
  StartOptions: example
  Backgrounds: variants
  CardAnatomy: anatomy
  InviteFeature: example
---

# Card

## Variants

### Content card

```tsx figure=ActionStrip

```

### Link card

```tsx figure=Destinations motion

```

### Button card

```tsx figure=StartOptions motion

```

### Card that opens something

```tsx figure=OpenFromCard

```

### Feature card

```tsx figure=InviteFeature widths="40 24" sweep

```

### Backgrounds

```tsx figure=Backgrounds stage=shaded

```

1. **Muted**
2. **Default**
3. **Page**

## Anatomy

```tsx figure=CardAnatomy

```

1. **Surface** (`env-card`)
2. **Header** (`env-card-header`)
3. **Title** (`env-card-title`, `title`)
4. **Meta** (`env-card-meta`, `meta`)
5. **Header end** (`env-card-header-end`, `headerEnd`)
6. **Description** (`env-card-description`, `description`)
7. **Content** (`env-card-body > env-text:last-child`, `children`)
8. **Actions** (`env-card-actions`, `actions`)

## Behaviour

### Loading

<!-- specimen: SkeletonFirst -->
