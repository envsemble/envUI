---
'@envsemble/envui': major
---

ColorPicker's color area and hue are envUI's own, the hue on Base UI's Slider, and the package no longer depends on react-colorful. The look stays; the `.react-colorful` classes are gone, and envUI's style sheet declares nothing `!important`. The area and the hue are named by EnvUIProvider's `messages.colorPicker.area` and `.hue`, and the area's value by `.areaValue`, in the provider's locale; the area moves by 1 % per arrow key and 10 % with Shift, and the hue by one degree, or 18 with Shift. `ref` reaches the HEX field.
