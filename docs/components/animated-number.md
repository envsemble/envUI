---
title: AnimatedNumber
summary: A number in text that rolls to its new value when it changes, so a count updated elsewhere is noticed.
status: beta
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

AnimatedNumber shows a number inside text and rolls it to its new value when it changes: in from below when it grows and from above when it shrinks. The movement draws the eye to a count that other controls change, such as the number of results on the button that shows them. The text is always the current value, so accessible names and copied text never hold a number on its way.

```tsx example=ShowResults

```

## Anatomy

1. **Container**: an inline `span` that keeps the line box of the text around it and clips the rolling value to it. The ref and other `span` props reach it.
2. **Value** (`value`, written by `format`): the current number, in tabular figures and the type of the text around it.

## Variants and sizes

- AnimatedNumber takes the font, size and color of the text around it, such as a button's label or a heading.
- Digits use tabular figures, so the number's width changes only with its count of digits, and the text around it doesn't shift as it rolls.

## States and behaviour

- **Rolling**: when `value` changes, the new value rolls in from 0.6 em below as it grows, or from above as it shrinks, and fades in, in 0.24 seconds. The first render and a render with the same value don't move.
- **Reduced motion**: with a reduced-motion preference, the new value only fades in, in 0.16 seconds.
- **Format**: `format` writes the value, such as a currency or a percentage; by default it is the browser locale's number format, such as 1,280.
- The new value replaces the old at once in the text; only its look moves.

## Content guidelines

- Keep the words around the number in the same sentence, and match their number: "1 task", "24 tasks".
- Put the outcome in a label when it is known: "Show 33 tasks", not "Show results".
- Format the value as it is meant: a currency, a percentage, or a count with the locale's separators.

## Do and don't

### Do

- Use it where a count changes because of something people do nearby.
- Pass a `format` that fits the value's unit and the reader's locale.

### Don't

- Don't animate counts that change on their own, such as a live total ticking up; the movement distracts.
- Don't animate several numbers side by side that change together; animate the one that matters.
- Don't use it for figures that don't change; use plain text.

## Accessibility

### envUI provides

- The current value as the text at every moment, so a button's accessible name and copied text are never a number on its way.
- A fade instead of the roll with a reduced-motion preference.

### You provide

- An announcement where the change matters and focus is elsewhere, such as a status region around the sentence; AnimatedNumber isn't a live region.
- A `format` that writes the number in the reader's language.

## Examples

### Seats left

The sentence is a status region, so the new count is announced as people change it.

```tsx example=SeatsLeft

```

### A formatted value

`format` writes the price as a currency; it rolls up for yearly billing and down for monthly.

```tsx example=CustomFormat

```

## Changelog

- **0.4.0**: AnimatedNumber: a count rolls up as it grows and down as it shrinks, and fades with reduced motion.
