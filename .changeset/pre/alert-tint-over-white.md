---
'@envsemble/envui': patch
---

In light, an Alert's tint, `--env-color-bg-{tone}-muted`, lies over the white raised surface, `--env-color-bg-raised`, rather than over whatever is behind it, so info reads blue, success green and danger red on the gray page instead of slate, sage and dusty pink; dark is unchanged. The title takes the alert's text color, `--env-alert-content` or `--env-color-fg-default`, and the icon and the tint carry the tone; an outline action's edge takes the icon's color.
