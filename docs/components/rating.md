---
title: Rating
summary: A read-only rating as stars filled in half steps, named once for assistive technology.
status: stable
since: 0.7.0
category: Content & guidance
aliases:
  - stars
  - star rating
  - five-star rating
  - review score
  - review stars
  - score
useWhen:
  - Showing a rating people gave, such as a review score or the average of many reviews.
  - A compact summary of quality beside a name in a list, a card or a table row.
avoidWhen:
  - text: Asking someone to give a rating; offer a few labelled choices instead.
    use: RadioGroup
  - text: Asking for a value on a continuous scale, such as a satisfaction score from 0 to 100.
    use: Slider
  - text: A measurement within a known range, such as storage used.
    use: Meter
  - text: A key figure on a dashboard, such as the average score this month.
    use: Stat
  - text: A state or a category, such as Approved or Featured.
    use: Badge
related:
  - stat
  - badge
  - meter
  - radio
  - slider
components:
  - Rating
---

# Rating

## Overview

A rating shows a score people gave as stars, such as 4.5 out of 5, filled to the value in half steps. It is read-only: it displays a rating and never asks for one. The stars are one image named by the rating, so assistive technology reads it once, such as "4.5 out of 5 stars"; `showValue` adds the number before them for people who scan.

```tsx example=ReviewScore

```

## Anatomy

1. **Number** (optional, `showValue`): the rating the stars show, such as 4.5, before the stars in tabular digits and at least three characters wide, so ratings line up in a column. It takes the type of the text around it.
2. **Stars**: one star per step of `max`, 1.125 rem square and 0.125 rem apart, 0.5 rem after the number.
3. **Filled stars**: stars up to the value, in the warning tone.
4. **Half star** (when the value ends in .5): the warning tone over the inline-start half of an empty star.
5. **Empty stars**: the rest, in the boundary color of controls.

## Variants and sizes

| Form            | Use for                                                                                       |
| --------------- | --------------------------------------------------------------------------------------------- |
| Stars only      | Lists and rows where the stars alone are enough, such as reviews beside each reviewer's name. |
| With the number | A summary people read closely or compare, such as the average rating of a supplier.           |
| Another scale   | A scale with other than five steps, such as 10 stars with `max={10}`.                         |

<!-- specimen: HalfSteps -->

- Rating has one size: 1.125 rem stars, 0.125 rem apart. The number takes the font size of the text around it.
- `max` sets how many stars the scale has, 5 by default. A fraction rounds to the nearest whole star, and a `max` below 1 or not a number shows 5 stars.
- The rating is an inline element, so it sits in a line of text or in a flex row without a wrapper.

## States and behaviour

- **Rounding**: the stars and the number show the value rounded to the nearest half star, so 4.3 shows as 4.5 and 4.2 as 4. The accessible name gets the same rounded value, so what people see and hear agrees.
- **Kept within the scale**: a value below 0 shows no stars filled and a value above `max` shows every star filled; a value that is not a number, such as `NaN`, shows 0.
- **Colors**: filled stars take the warning tone, `--env-color-fg-warning`; empty stars take `--env-color-border-default`, at least 3:1 against every surface in both themes, so the scale reads also where the filled stars are few.
- **Right-to-left text**: the stars run from the right, and a half star fills its right half, the start of the line.
- **No interaction**: a rating has no hover, focus, pressed or disabled state. It never takes focus.

## Content guidelines

- Say whose rating it is and how many people gave it, such as "Average of 128 reviews", next to the stars. One rating from one person needs only the person's name.
- Show the number with `showValue` where people compare ratings or need the exact value, such as in a summary; leave it out in a list of individual reviews.
- Keep to one scale across a page, usually five stars, so ratings compare at a glance.
- Write the accessible name in the page's language with `messages.rating.label` on EnvUIProvider, which receives the shown value and the number of stars as text in the locale's number format. The default reads "4.5 out of 5 stars"; `formatLabel` overrides it for one rating.
- The number from `showValue` is in the locale's number format, such as 4,5 in German.

## Do and don't

### Do

- Use Rating to show a rating someone gave, with who gave it and how many.
- Round your own value the same way when you show it elsewhere, such as in a sort control, so the figures agree.
- Set the locale and `messages.rating.label` on EnvUIProvider when the page is not in English.

### Don't

- Don't use Rating as an input: it does not respond to the pointer or the keyboard. Ask for a rating with a [RadioGroup](../components/radio.md) or a [SegmentedControl](../components/segmented-control.md) of labelled choices.
- Don't use stars for a measurement or for progress; use a [Meter](../components/meter.md) or [Progress](../components/progress.md).
- Don't repeat the rating in text beside a rating that already shows it with `showValue`.

## Accessibility

### Keyboard

| Key                                             | Action                                                         |
| ----------------------------------------------- | -------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Pass over the rating: it is not focusable and handles no keys. |

### envUI provides

- The stars as one element with `role="img"`, named by `messages.rating.label` or `formatLabel`, such as "4.5 out of 5 stars", so assistive technology reads the rating once instead of each star.
- The shown number and the name's numbers in the locale's number format.
- The number from `showValue` hidden from assistive technology, since the name already says it.
- The same rounded value in the stars, the number and the name.
- Empty stars at least 3:1 against every surface, so the scale is visible in both themes.

### You provide

- Text that says whose rating it is and how many people gave it, such as a reviewer's name or a count of reviews.
- `messages.rating.label` in the page's language when it is not English.
- A separate input, such as a RadioGroup, when people give a rating.

## Examples

### Half stars and other scales

The stars fill to the value in half steps. `max` sets another scale, such as ten stars.

```tsx example=Scales

```

### A list of reviews

In a list of individual reviews the stars are enough; the reviewer's name says whose rating it is.

```tsx example=ReviewList

```

### The application's own name

`messages.rating.label` on EnvUIProvider writes the accessible name, in the reader's language; the provider's locale writes the number, such as 4,5 with a decimal comma in German.

```tsx example=ApplicationLabel

```

## Changelog

- **1.0.0**: The shown number and the name follow the locale, and the name comes from `messages.rating.label`. Empty stars take the boundary color of controls, at least 3:1 against every surface.
- **0.7.0**: Rating, with half stars, `max`, `showValue` and `formatLabel`.
