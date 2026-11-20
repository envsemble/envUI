---
'@envsemble/envui': major
---

Rating leaves the library: a row of review stars is a consumer and shopping pattern, outside the B2B and developer tools envUI is for. An app that shows a score in stars copies the star rating example on [Meter](https://github.com/envsemble/envUI/blob/main/docs/components/meter.md) into its own code: one image named such as "4.5 out of 5 stars", built from Row, Text and IconStar.

Breaking changes:

- `Rating` and `RatingProps` are removed, with the parts `env-rating`, `env-rating-value`, `env-rating-stars`, `env-rating-star` and `env-rating-star-half`, the star's state `data-fill` (`full` and `half`), the token `--env-color-fg-rating-star` and EnvUIProvider's `messages.rating`: copy the star rating example from Meter's page, which colors its filled stars with IconStar's `tone="warning"`, or the app's own color.
