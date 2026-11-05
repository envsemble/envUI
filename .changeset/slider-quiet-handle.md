---
'@envsemble/envui': patch
---

Slider shows a handle at its value at rest, a short bar at 70 % of its strength, clear though quieter than in use, and its fill takes a strong grade of the primary color's tint, `--env-color-bg-primary-subtle-pressed`, rather than a neutral one, in light and in dark, so it reads as a control, clearly apart from the track, rather than a meter or a disabled field. At either end the handle stops halfway into the padding before the label or after the value, so it never meets them there; where it passes under the label or the value it keeps its size and place and quiets to half its strength, with the text drawn over it, so both stay readable; it shows in full under the pointer, while pressed and with keyboard focus as before. A disabled slider is flatter than one at rest: no handle, and a neutral fill, `--env-color-bg-neutral-muted`, rather than the primary tint.
