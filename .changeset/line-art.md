---
'@envsemble/envui': minor
---

New: `LineArt`, a geometric drawing in hairlines for a banner's end, an empty state or the background of a header, such as a golden rectangle cut into squares or a chain of circles between three arcs. `drawing` names one of sixteen, listed in order as `lineArtDrawings`, such as `golden-section` or `harmonic-division`. It fills its container's box, covering it: `align` is `end` (the default), `start` or `center`, where the drawing sits as the box crops it, mirrored in right-to-left text. Its lines are the muted edge color, `--env-color-border-muted`, a hairline at any size, and `GrayText` in forced colors. It is hidden from assistive technology, or with `label` an image named by it. The root is `env-line-art`, an SVG with `data-drawing` and `data-align`.
