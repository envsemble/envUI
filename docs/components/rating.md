---
title: Rating
summary: A read-only rating, as stars.
status: stable
since: 1.0.0
category: Data display
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
  - text: Asking for a value on a continuous scale.
    use: Slider
  - text: A measurement within a known range, such as storage used.
    use: Meter
components:
  - Rating
examples:
  ReviewScore: overview
  Scales: example
  RatingAnatomy: anatomy
---

# Rating

## Variants

```tsx figure=Scales

```

## Anatomy

```tsx figure=RatingAnatomy

```

1. **Number** (`env-rating-value`, `showValue`)
2. **Stars** (`env-rating-stars`)
3. **Filled star** (`env-rating-star[data-fill='full']`)
4. **Half star** (`env-rating-star-half`)
5. **Empty star** (`env-rating-star:last-child`)

## Behaviour

### Rounding

<!-- specimen: Rounding -->
