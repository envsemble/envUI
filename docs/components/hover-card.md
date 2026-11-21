---
title: HoverCard
summary: A card with more details that opens when people hover a link, like a link preview.
status: stable
since: 1.0.0
category: Overlays
aliases:
  - PreviewCard
  - preview card
  - link preview
  - hover preview
  - profile card
  - person card
  - peek
useWhen:
  - A glance at what a link or a name refers to, such as a person's role
avoidWhen:
  - text: A short hint that names a control.
    use: Tooltip
  - text: Details or a small form that people open on purpose and work in.
    use: Popover
components:
  - HoverCard
examples:
  DocumentPreview:
    role: overview
    open: true
  PersonDetails: example
  Placement: example
  HoverCardAnatomy: anatomy
  TextDetails: example
---

# HoverCard

## Variants

### Widths

```tsx figure=PersonDetails open

```

### Placement

```tsx figure=Placement open

```

## Anatomy

```tsx figure=HoverCardAnatomy open

```

1. **Card** (`env-hover-card`, `children`)
2. **Trigger** (`env-link`, `trigger`)

## Behaviour

### Hover and focus

<!-- specimen: HoverAndFocus -->

### Text triggers

```tsx figure=TextDetails motion

```
