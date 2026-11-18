---
title: Badge
summary: A small static label for a state, a count or a piece of metadata.
status: stable
since: 1.0.0
category: Data display
aliases:
  - Counter
  - CounterBadge
  - DiffCount
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
  - diff count
  - change size
useWhen:
  - A short state beside what it describes, such as In review or Blocked
  - A number that belongs to a label, such as unread messages
  - The size of a change beside a file, such as +12 −3 (DiffStat)
avoidWhen:
  - text: An action, even when it looks like a pill.
    use: Button
  - text: A message about a page or section that needs a sentence.
    use: Alert
  - text: How full or complete something is, such as storage used.
    use: Meter
components:
  - Badge
  - DiffStat
examples:
  ProjectStatus: overview
  CountsInButtons:
    role: overview
    caption: 'Counts: a compact number, here inside buttons.'
  ChangeSize:
    role: overview
    caption: 'DiffStat: the size of a change.'
  Emphasis: variants
  Tones: variants
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

## Anatomy

```tsx figure=BadgeAnatomy

```

1. **Pill** (`env-badge`)
2. **Icon** (`env-badge > env-icon`, `icon`)
3. **Label** (`env-badge-label`, `children`)

## Behaviour

### Adapting to width

```tsx figure=LongState widths="20 10" sweep

```
