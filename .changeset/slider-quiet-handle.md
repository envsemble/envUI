---
'@envsemble/envui': patch
---

Slider shows a handle at its value at rest, a short bar at 70 % of its strength, clear though quieter than in use, and its fill takes the primary color's muted tint, `--env-color-bg-primary-muted`, rather than a neutral one, in light and in dark, so it reads as a control rather than a meter or a disabled field. At either end the handle stops halfway into the padding before the label or after the value, so it never meets them there; elsewhere it leaves the text clear where the value sits under the label or the value, and shows in full under the pointer, while pressed and with keyboard focus as before.
