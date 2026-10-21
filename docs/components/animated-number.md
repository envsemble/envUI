---
title: AnimatedNumber
summary: A number in text that rolls to its new value when it changes, so a count updated elsewhere is noticed.
status: stable
since: 0.4.0
category: Content & guidance
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
  - A count changes while people make choices elsewhere, such as matching results in a button's label.
  - A figure follows a setting people change, such as seats left or a price per billing period.
avoidWhen:
  - text: A count that doesn't change while people look at it, which is plain text.
    use: Text
  - text: A compact count beside a label, such as unread messages.
    use: CounterBadge
  - text: A headline figure with its label and trend, such as on a dashboard.
    use: Stat
  - text: How far a task has come.
    use: Progress
related:
  - button
  - stat
  - badge
  - typography
  - accessibility
components:
  - AnimatedNumber
---

# AnimatedNumber

## Overview

AnimatedNumber shows a number in text and rolls it to its new value: up as it grows, down as it shrinks. Its text is always the current value.

```tsx example=ShowResults

```

### A formatted value

`formatValue` writes the value, such as a currency. By default it follows EnvUIProvider's `locale`.

```tsx example=CustomFormat

```

### Reduced motion

With a reduced-motion preference, the new value only fades in.

## When to use

```tsx do=SeatsLeft caption="Roll the one number a choice changes."

```

```tsx dont=EveryNumberRolls caption="Several numbers rolling at once: none of them draws the eye."

```

- Don't roll counts that change on their own, such as a live total.
- Keep the words in the same sentence, and match them to the number: 1 seat, 3 seats.

## Anatomy

```tsx anatomy=AnimatedNumberAnatomy

```

1. **Number** (`env-animated-number`)
2. **Value** (`env-animated-number-value`, `value`)

## Accessibility

### envUI provides

- The current value as the text at every moment, so names and copied text never hold a number on its way.
- A fade instead of the roll with reduced motion.

### You provide

- A status region where the change must be announced; AnimatedNumber isn't one.
- A `formatValue` in the reader's language.

## Changelog

- **1.0.0**: The default format follows EnvUIProvider's `locale`. `format` is `formatValue`, as on Slider and CalendarHeatmap.
- **0.4.0**: AnimatedNumber: a count rolls up as it grows and down as it shrinks, and fades with reduced motion.
