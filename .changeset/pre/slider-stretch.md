---
'@envsemble/envui': patch
---

Slider stretches a little when dragged past either end, as a rubber band: the value stays at the minimum or maximum while the field stretches toward the pointer from its other end and thins slightly, giving less the further the pointer goes, up to 6% of its length or half its height, and springs back once let go. The label and the value keep their shape and size. Only a drag stretches it, not a press or the keyboard, nor a disabled slider, and it doesn't stretch where reduced motion is preferred.
