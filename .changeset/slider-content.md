---
'@envsemble/envui': minor
---

Slider: `label` takes any content again, as in 1.x, such as a volume icon beside the text; it still names the slider and ends in an ellipsis where the slider is narrow. `renderValue` shows the value at the slider's end as any content, such as the number with its unit styled apart, while `formatValue`, or the number in the locale, stays what assistive technology announces. The type of `label` widens from `string` to `ReactNode`: code that reads it back as a string needs a check that it is one. See [Slider](https://github.com/envsemble/envUI/blob/main/docs/components/slider.md).
