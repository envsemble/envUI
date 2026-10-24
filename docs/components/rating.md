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
  - A rating people gave, such as a review score or an average of many
  - A compact summary of quality beside a name in a list, a card or a row
avoidWhen:
  - text: Asking someone to give a rating; offer a few labelled choices instead.
    use: RadioGroup
  - text: Asking for a value on a continuous scale, such as a satisfaction score from 0 to 100.
    use: Slider
  - text: A measurement within a known range, such as storage used.
    use: Meter
  - text: A key figure on a dashboard, such as the average score this month.
    see: key-figures
components:
  - Rating
---

# Rating

## Overview

```tsx example=ReviewScore

```

### Rounding

The stars, the number and the name show the value to the nearest half star: 4.3 shows as 4.5. A value outside the scale shows as its nearest end.

### In another language

The name and the number follow the application's language, such as 4,5 in German.

```tsx example=ApplicationLabel

```

## Variants

| Form            | Use for                             |
| --------------- | ----------------------------------- |
| Stars only      | A list of individual reviews.       |
| With the number | A summary people compare.           |
| Another scale   | Other than five steps, such as ten. |

```tsx example=Scales caption="With the number, on scales of five and of ten stars."

```

## When to use

```tsx do=WhoRated caption="Say whose rating it is and how many people gave it."

```

```tsx dont=UnsourcedStars caption="Stars with no source: people can't tell how much they count."

```

### One scale

Keep to one scale on a page, so ratings compare at a glance.

## Anatomy

```tsx anatomy=RatingAnatomy

```

1. **Number** (`env-rating-value`, `showValue`)
2. **Stars** (`env-rating-stars`)
3. **Filled star** (`env-rating-star[data-fill='full']`)
4. **Half star** (`env-rating-star-half`)
5. **Empty star** (`env-rating-star:last-child`)

## Accessibility

### envUI provides

- The stars as one image named by the rating, such as 4.5 out of 5 stars.
- The number from `showValue` hidden, since the name says it.
- No focus: a rating handles no keys.

### You provide

- Text that says whose rating it is.
- `messages.rating.label` in the page's language.
- A separate input, such as a RadioGroup, where people give a rating.

## In code

### Usage

A Rating shows `value`, from 0 to `max`, such as 4.5, rounded to the nearest half star and kept within the scale; a value that is not a number shows no stars. `max` is the number of stars, 5 by default, as a whole number. `showValue` shows the rounded value as a number before the stars, in tabular digits and the locale's number format. A Rating only shows a rating: to ask for one, use a separate input, such as a RadioGroup.

```tsx source=Scales

```

#### Name and language

The stars are one image, named such as 4.5 out of 5 stars, from EnvUIProvider's `messages.rating.label`, or `formatLabel` for one rating, which receives the shown value and the number of stars. The number from `showValue` is hidden from assistive technology, since the name says it.

```tsx source=ApplicationLabel

```

### Composition

The parts are the number, `env-rating-value`, and the stars, `env-rating-stars`, each an `env-rating-star` with `data-fill`, `full` or `half`, and a half star's filled half, `env-rating-star-half`. Say beside it whose rating it is and how many people gave it.

## Changelog

- **1.0.0**: The shown number and the name follow the locale, and the name comes from `messages.rating.label`. Empty stars take the boundary color of controls, at least 3:1 against every surface.
- **0.7.0**: Rating, with half stars, `max`, `showValue` and `formatLabel`.
