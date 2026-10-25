---
'@envsemble/envui': patch
---

`--env-radius-full` is capped: half the tallest single-line control, the large control height or the touch height, whichever is more, instead of an endless pill corner. Everything with rounded ends takes it, so any element that grows taller than one line, such as a button whose label wraps, a Combobox whose chips wrap, a badge, a switch or a navigation item, keeps the same corners and becomes a rounded rectangle; parts that are always square, such as avatars and round icon buttons, stay circles.
