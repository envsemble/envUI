---
'@envsemble/envui': major
'@envsemble/envui-codemods': patch
---

Spinner draws Material 3's expressive loading indicator instead of a turning arc: one shape, filled with the spinner's color, that morphs through Material's rounded shapes, a soft burst, a nine-sided cookie, a pentagon, a pill, a sunny, a four-sided cookie and an oval, while it turns. It follows Material's indeterminate timing: the drawing turns once every 4666 ms, and every 650 ms the shape morphs into the next while it takes a quarter turn, on Material's spring. The morph animates the path's `d` in CSS; where a browser can't, the soft burst keeps turning. With a reduced-motion preference the shape breathes in place, without turning or morphing, where the arc turned more slowly. The shape holds 3:1 on the surfaces spinners sit on, as the arc did.

- `contained` draws the shape on a circle of the brand's tint, `env-spinner-container`, as Material's contained indicator, and sets `data-contained`.
- Its API, sizes, label and accessibility are unchanged, as is the `--env-spinner-color` hook that busy buttons and message statuses use.
- The part `env-spinner-arc` is gone, replaced by `env-spinner-shape`, a filled path rather than a stroked circle, and the `v1-classes` codemod reports styles that still select the arc.

To migrate, remove styles aimed at `env-spinner-arc`, such as its stroke or its animation, and recolor a spinner with `--env-spinner-color` instead.
