---
'@envsemble/envui': minor
---

Select's items take a `description`, a muted second line read as the option's description, such as why it is unavailable. An unavailable option takes the disabled text color, `--env-color-fg-disabled`, on its label rather than fading the row, so the label still sits above its description, which keeps the muted color: unavailable and explanatory text don't look alike.
