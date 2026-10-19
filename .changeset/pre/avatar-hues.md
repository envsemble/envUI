---
'@envsemble/envui': minor
---

An `Avatar` without a picture takes a solid color that its `name` chooses, one of eight (blue, teal, green, amber, red, violet, purple and slate), with white initials or a white figure, so a person or an organization keeps the same color everywhere. `hue` sets the color instead, such as an organization's own, and `avatarHue(name)` returns the one a name chooses; the fills are the `--env-color-avatar-bg-{hue}` tokens, a grade darker at high contrast. Initials are semibold at 0.38 of the avatar's size, and every avatar has a hairline just inside its edge, so a white figure or a light photo keeps its circle on a page of the same color.
