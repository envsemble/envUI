---
title: Halo
summary: A soft halo that breathes around the one control or region to look at next.
status: beta
since: 3.0.0
category: Feedback
aliases:
  - pulse
  - beacon
  - hotspot
  - spotlight
  - highlight
  - breathing button
  - coach mark
  - tour step
  - onboarding
useWhen:
  - The one control to press next, such as the first step of onboarding
  - A step of a product tour that points at a part of the screen
avoidWhen:
  - text: A count or a state that people read, such as unread messages.
    use: Badge
  - text: Work in progress in a small area.
    use: Spinner
  - text: A message about the page that needs reading.
    use: Alert
components:
  - Halo
examples:
  InviteTeam: overview
  Tones: variants
  AroundACard:
    role: example
    caption: Around a block, it keeps the block's width and follows its corners.
---

# Halo

## Variants

```tsx figure=Tones

```

1. **Accent**
2. **Primary**

## Behaviour

### Around a block

```tsx figure=AroundACard

```
