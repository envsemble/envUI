---
title: AnimatedNumber
summary: A number that rolls to its new value, so a change made elsewhere is noticed.
status: stable
since: 1.0.0
category: Data display
aliases:
  - animated counter
  - counter
  - count up
  - number flow
  - number animation
  - rolling number
  - odometer
  - ticker
useWhen:
  - A count that changes as people choose, such as results in a button's label
  - A figure that follows a setting, such as seats left or a price per period
avoidWhen:
  - text: 'A count that doesn’t change while people look at it: plain text.'
    use: Text
  - text: A compact count beside a label, such as unread messages.
    use: Badge
components:
  - AnimatedNumber
examples:
  ShowResults:
    role: overview
    motion: true
  CustomFormat: example
  AnimatedNumberAnatomy:
    role: anatomy
    caption: Caught as a new value rolls in.
---

# AnimatedNumber

## Variants

### A formatted value

```tsx figure=CustomFormat motion

```

## Anatomy

```tsx figure=AnimatedNumberAnatomy specimen

```

1. **Window** (`env-animated-number`)
2. **Value** (`env-animated-number-value`, `value`)

## Behaviour

### Rolling to a new value

<!-- specimen: Rolling -->
