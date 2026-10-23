---
'@envsemble/envui': minor
---

Slider is a field: as tall as the fields and with their corners, so it sits in a form among them. Its label sits inside at the start, its value in monospace at the end, and a fill from the start shows the value; a thin handle at the value and faint ticks at the steps, or at the large steps where the steps are many, appear under the pointer and while it has focus, and keyboard focus rings the whole field. Pressing or dragging anywhere in it chooses a value; the keyboard and accessibility stay Base UI's. The track has no outline. `--env-slider-indicator` now colors the fill alone, and a new color property, `--env-slider-content`, the label, the value, the handle and the ticks. The root marks `data-ticks` while it draws ticks.
