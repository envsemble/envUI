---
title: Badge
summary: A small static label for a state, a count or a piece of metadata.
status: stable
since: 1.0.0
category: Data display
aliases:
  - Counter
  - CounterBadge
  - InfoChip
  - info chip
  - chip
  - chips
  - metadata
  - status badge
  - status
  - tag
  - lozenge
  - label
  - pill
  - count
  - counter
  - notification count
  - unread count
useWhen:
  - A short state beside what it describes, such as In review or Blocked
  - A number that belongs to a label, such as unread messages
avoidWhen:
  - text: An action, even when it looks like a pill.
    use: Button
  - text: A message about a page or section that needs a sentence.
    use: Alert
  - text: How full or complete something is, such as storage used.
    use: Meter
components:
  - Badge
examples:
  ProjectStatus: overview
  CountsInButtons:
    role: overview
    caption: 'Counts: a compact number, here inside buttons.'
  Emphasis: variants
  Tones: variants
  WithContent: example
  BadgeAnatomy: anatomy
  LongState: example
---

# Badge

## Variants

```tsx figure=Emphasis

```

1. **Soft**
2. **Solid**
3. **Outline**

### Tones

```tsx figure=Tones

```

1. **Neutral**
2. **Primary**
3. **Accent**
4. **Success**
5. **Warning**
6. **Danger**
7. **Done**

### Content in a badge

```tsx figure=WithContent

```

## Anatomy

```tsx figure=BadgeAnatomy

```

1. **Pill** (`env-badge`)
2. **Start** (`env-badge-start`, `start`)
3. **Label** (`env-badge-label`, `children`)

## Behaviour

### Adapting to width

```tsx figure=LongState widths="20 10" sweep

```
