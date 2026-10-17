---
'@envsemble/envui': major
---

ColorPicker's color area and hue are envUI's own, the hue on Base UI's Slider, and the package no longer depends on react-colorful. The look stays; the `.react-colorful` classes are gone, and envUI's style sheet declares nothing `!important`. The area and the hue are named after the picker's label, such as "Accent color saturation and brightness" and "Accent color hue", by EnvUIProvider's `messages.colorPicker.area` and `.hue`, functions of `{ label }`; the area's value comes from `.areaValue`, and the hue's is in degrees, both in the provider's locale; the area moves by 1 % per arrow key and 10 % with Shift, and the hue by one degree, or 18 with Shift. `ref` reaches the HEX field.
