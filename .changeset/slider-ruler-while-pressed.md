---
'@envsemble/envui': patch
---

Slider shows its faint ticks at the steps only while the pointer presses it, from the press until it is released, anywhere, and they fade out then: no longer under a resting pointer, while it has focus or with the keyboard. A release outside the slider, a cancelled pointer, a lost pointer capture or the window losing focus all end it, so the ticks never stay. The handle still shows under the pointer, while pressed and while the slider has focus. The slider's control marks `data-pressed` while the pointer presses it.
