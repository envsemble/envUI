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
    see: key-figures
  - text: A state or a category, such as Approved or Featured.
    use: Badge
components:
  - Rating
---

# Rating

## Overview

A rating shows a score people gave as stars, in half steps. It only shows a rating; it never asks for one.

```tsx example=ReviewScore

```

### Rounding

The stars, the number and the name show the value to the nearest half star: 4.3 shows as 4.5. A value outside the scale shows as its nearest end.

### In another language

`messages.rating.label` on EnvUIProvider writes the name, and the provider's locale the number, such as 4,5 in German.

```tsx example=ApplicationLabel

```

## Variants

```tsx example=Scales

```

| Form            | Use for                                             |
| --------------- | --------------------------------------------------- |
| Stars only      | A list of individual reviews.                       |
| With the number | A summary people compare (`showValue`).             |
| Another scale   | Other than five steps, such as ten with `max={10}`. |

## When to use

```tsx do=WhoRated caption="Say whose rating it is and how many people gave it."

```

```tsx dont=UnsourcedStars caption="Stars with no source: people can't tell how much they count."

```

```tsx do=ReviewList caption="Stars alone beside one reviewer's words."

```

```tsx dont=RepeatedRating caption="The rating said again in text: it is read twice."

```

- Keep to one scale on a page, so ratings compare at a glance.

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

## Changelog

- **1.0.0**: The shown number and the name follow the locale, and the name comes from `messages.rating.label`. Empty stars take the boundary color of controls, at least 3:1 against every surface.
- **0.7.0**: Rating, with half stars, `max`, `showValue` and `formatLabel`.
