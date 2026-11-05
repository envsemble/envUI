---
'@envsemble/envui': patch
---

Slider shows a handle at its value at rest, a short bar at 70 % of its strength, clear though quieter than in use, and its fill takes the primary color's muted tint, `--env-color-bg-primary-muted`, rather than a neutral one, so it reads as a control rather than a meter or a disabled field. At either end the handle stops halfway into the padding before the label or after the value, so it never meets them there; where it passes under the label or the value it shortens to a mark low in the track, below the text, rather than fading out, so the value's place still shows; it shows in full under the pointer, while pressed and with keyboard focus as before. In dark the fill takes the tint's stronger grade, `--env-color-bg-primary-subtle-pressed`, so it stands apart from the track. A disabled slider is flatter than one at rest: no handle, and a neutral fill, `--env-color-bg-neutral-muted`, rather than the primary tint.
