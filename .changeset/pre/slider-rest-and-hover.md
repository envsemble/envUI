---
'@envsemble/envui': patch
---

Slider at rest shows only its label, its value and its fill, which ends crisply. A thin handle at the value and faint ticks at the steps show while a pointer hovers or presses it, and go once it is released, even with the pointer still over it, until the pointer leaves and comes back; a finger shows them only while it is down. Keyboard focus shows the handle alone, with the focus ring. While they show, where the handle, the end of the fill and the ticks pass under the label or the value, they fade, and the text keeps its full strength. A release outside the slider, a cancelled pointer, a lost pointer capture or the window losing focus all end a press. The slider's control marks `data-handle` while the handle shows, `data-ruler` while the ticks do and `data-pressed` while the pointer presses it.
