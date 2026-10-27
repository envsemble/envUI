---
title: Rating
summary: A read-only rating as stars filled in half steps, named once for assistive technology.
status: stable
since: 0.7.0
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
  - text: Asking for a value on a continuous scale, such as a satisfaction score from 0 to 100.
    use: Slider
  - text: A measurement within a known range, such as storage used.
    use: Meter
  - text: A key figure on a dashboard, such as the average score this month.
    see: key-figures
components:
  - Rating
examples:
  ReviewScore: overview
  Scales:
    role: example
    caption: Stars only, with the number, and on a scale of ten stars.
  RatingAnatomy: anatomy
  ApplicationLabel: example
  WhoRated:
    role: do
    caption: Say whose rating it is and how many people gave it.
  UnsourcedStars:
    role: dont
    caption: "Stars with no source: people can't tell how much they count."
---

# Rating

## Variants

| Form            | Use for                             |
| --------------- | ----------------------------------- |
| Stars only      | A list of individual reviews.       |
| With the number | A summary people compare.           |
| Another scale   | Other than five steps, such as ten. |

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

The stars, the number and the name show the value to the nearest half star: 4.3 shows as 4.5. A value outside the scale shows as its nearest end.

<!-- specimen: Rounding -->

### In another language

The name and the number follow the application's language, such as 4,5 in German.

```tsx figure=ApplicationLabel

```

## Rules

A rating only shows a score people gave; to ask for one, use a separate input.

```tsx figure=WhoRated

```

```tsx figure=UnsourcedStars

```

### One scale

Keep to one scale on a page, so ratings compare at a glance.

## Accessibility

### envUI provides

- The stars as one image named by the rating, such as 4.5 out of 5 stars.
- The number from `showValue` hidden, since the name says it.
- No focus: a rating handles no keys.

### You provide

- Text that says whose rating it is.
- `messages.rating.label` in the page's language.
- A separate input, such as a RadioGroup, where people give a rating.

## Compose

### Usage

A Rating shows `value`, from 0 to `max`, such as 4.5, rounded to the nearest half star and kept within the scale; a value that is not a number shows no stars. `max` is the number of stars, 5 by default, as a whole number. `showValue` shows the rounded value as a number before the stars, in tabular digits and the locale's number format. A Rating only shows a rating: to ask for one, use a separate input, such as a RadioGroup.

```tsx source=Scales

```

#### Name and language

The stars are one image, named such as 4.5 out of 5 stars, from EnvUIProvider's `messages.rating.label`, or `formatLabel` for one rating, which receives the shown value and the number of stars. The number from `showValue` is hidden from assistive technology, since the name says it.

```tsx
const messages = {
  rating: {
    label: ({ value, max }: { value: string; max: string }) => `Rated ${value} out of ${max} stars`,
  },
};

<EnvUIProvider messages={messages}>
  <Rating value={4.5} showValue />
</EnvUIProvider>;
```

### Composition

The parts are the number, `env-rating-value`, and the stars, `env-rating-stars`, each an `env-rating-star` with `data-fill`, `full` or `half`, and a half star's filled half, `env-rating-star-half`. Say beside it whose rating it is and how many people gave it.

### Customize

`--env-color-rating-star` is the filled stars' gold, a token with a value for each theme and contrast; the empty stars take `--env-color-border-default`.

## Changelog

- **1.0.0**: The shown number and the name follow the locale, and the name comes from `messages.rating.label`. Empty stars take the boundary color of controls, at least 3:1 against every surface. Filled stars take a clear gold of their own, `--env-color-rating-star`, in place of the warning tone.
- **0.7.0**: Rating, with half stars, `max`, `showValue` and `formatLabel`.
