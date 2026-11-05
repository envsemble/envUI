---
'@envsemble/envui': patch
---

In dark, the primary, accent and danger fills are one family of soft colors at the same lightness and strength: the accent, `--env-color-bg-accent-emphasis` and a solid accent badge's `--env-color-bg-accent-solid`, is a soft lilac rather than a vivid magenta, and the danger fill, `--env-color-bg-danger-emphasis`, a soft coral red rather than a mid salmon, still deeper than the lilac so Delete never reads as the accent. Each lightens a clear step on hover and, pressed, takes a small step deeper than rest rather than turning nearly white (`--env-color-bg-{primary,accent,danger}-emphasis-hover` and `-pressed`, which the checked controls on the primary fill take too); its dark label keeps 4.5:1 in every state. The light purples the dark theme uses, from the accent's text to its tints, are softer with it.
