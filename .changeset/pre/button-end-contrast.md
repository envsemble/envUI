---
'@envsemble/envui': patch
---

Button's `end` slot takes the button's own content color instead of the muted text color, which fell to about 1.6:1 on a primary button in the light theme and 1.1:1 in the dark one, and ignored `--env-button-content`. Text in the slot is the label's color; keys in it are outlined caps with no fill, as in a tooltip, and the + between them is 80% of the label's color, which the contrast gate holds to 3:1 on every variant, tone and state in all four themes. Kbd takes `--env-kbd-separator-fg` for the color of the + between keys.
