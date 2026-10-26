---
title: AnimatedNumber
summary: A number in text that rolls to its new value when it changes, so a count updated elsewhere is noticed.
status: stable
since: 0.4.0
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
  - text: A headline figure with its label and trend, such as on a dashboard.
    see: key-figures
components:
  - AnimatedNumber
examples:
  ShowResults: overview
  CustomFormat: example
  SeatsLeft:
    role: do
    caption: Roll the one number a choice changes.
  EveryNumberRolls:
    role: dont
    caption: 'Several numbers rolling at once: none of them draws the eye.'
  AnimatedNumberAnatomy: anatomy
---

# AnimatedNumber

## Variants

### A formatted value

The number can be written in any format, such as a currency. By default it is written as the application's language writes numbers.

```tsx figure=CustomFormat

```

## Anatomy

```tsx figure=AnimatedNumberAnatomy

```

1. **Number** (`env-animated-number`)
2. **Value** (`env-animated-number-value`, `value`)

## Behaviour

### Rolling to a new value

AnimatedNumber rolls up as the value grows and down as it shrinks.

<!-- specimen: Rolling -->

### Reduced motion

With a reduced-motion preference, the new value only fades in.

## Rules

Roll one number at a time, with its words beside it.

```tsx figure=SeatsLeft

```

```tsx figure=EveryNumberRolls

```

### Words

Keep the words in the same sentence as the number, and match them to it: 1 seat, 3 seats.

## Accessibility

### envUI provides

- The current value as the text at every moment, so names and copied text never hold a number on its way.
- A fade instead of the roll with reduced motion.

### You provide

- A status region where the change must be announced; AnimatedNumber isn't one.
- A `formatValue` in the reader's language.

## Compose

### Usage

AnimatedNumber shows its `value` as text inside a sentence or a label; when `value` changes, the new number rolls in, up as it grows and down as it shrinks, and with reduced motion it only fades in. Keep the words beside it in the same element, and match them to the number.

```tsx source=ShowResults

```

#### A formatted value

`formatValue` writes the value as text, such as a currency through `Intl.NumberFormat`, as CustomFormat does. Without it, AnimatedNumber uses the number format of EnvUIProvider's `locale`, or else the browser's.

```tsx
const euros = new Intl.NumberFormat('en-IE', { style: 'currency', currency: 'EUR' });

<AnimatedNumber value={price} formatValue={(value) => euros.format(value)} />;
```

### Composition

AnimatedNumber is the root, `env-animated-number`, around the value, `env-animated-number-value`.

## Changelog

- **1.0.0**: The default format follows EnvUIProvider's `locale`. `format` is `formatValue`, as on Slider and CalendarHeatmap.
- **0.4.0**: AnimatedNumber: a count rolls up as it grows and down as it shrinks, and fades with reduced motion.
