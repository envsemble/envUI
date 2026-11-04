---
'@envsemble/envui': patch
---

Slider shows a handle at its value at rest, at 70 % of its strength, clear though quieter than in use, and in light its fill is a step stronger, `--env-color-bg-neutral-muted-hover` rather than `--env-color-bg-neutral-subtle-pressed`, which it keeps in dark, so it reads as a control rather than a meter; the handle leaves the text clear where the value sits under the label or the value, and shows in full under the pointer, while pressed and with keyboard focus as before.
