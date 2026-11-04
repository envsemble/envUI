---
'@envsemble/envui': minor
---

Every primary button takes its tone's emphasis fill with `--env-color-fg-on-emphasis`, as the default primary does: danger and accent primaries keep their saturated fills with white labels in light and take soft fills with dark labels in dark, so Delete is never louder than Continue beside it. The new tokens are `--env-color-bg-danger-emphasis-hover` and `-pressed`, and `--env-color-bg-accent-emphasis` with its `-hover` and `-pressed`. A count or diff stat in a danger primary button is an outlined pill in its label color, as in the other primaries.

In dark, a warning alert rests on its softer tint, where its amber title and icon sank into the stronger one, and a secondary button among its actions is a lift of the text color rather than a tan tint.
