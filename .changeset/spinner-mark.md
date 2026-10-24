---
'@envsemble/envui': major
'@envsemble/envui-codemods': patch
---

Spinner draws envUI's mark instead of a turning arc: two pills and two circles that rest in a tint of the spinner's color and take it whole in turn, clockwise from the top pill. Nothing moves, only the color passes from shape to shape, and one shape is always at full color, which holds 3:1 on the surfaces spinners sit on. With a reduced-motion preference the color passes twice as slowly, as a soft fade. Its API, sizes, label and accessibility are unchanged, as is the `--env-spinner-color` hook that busy buttons and message statuses use. The part `env-spinner-arc` is gone, replaced by `env-spinner-shape`, one for each of the four shapes, and the `v1-classes` codemod reports styles that still select the arc.

To migrate, remove styles aimed at `env-spinner-arc`, such as its stroke or its animation, and recolor a spinner with `--env-spinner-color` instead.
