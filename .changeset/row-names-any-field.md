---
'@envsemble/envui': minor
---

List: a row's `control` takes any field, such as a Select, a SegmentedControl, a Slider, a TextField, a Combobox, a RadioGroup, a picker or a Calendar, as well as a Switch, a Checkbox or a Radio. A field there with no name of its own is named by the row's `label` and described by its `description`, so a settings row writes its label once: `<List.Item label="Theme" description="Follows the system until set" control={<Select items={themes} />} />`. A field with its own `label`, `aria-label` or `aria-labelledby` keeps it. SegmentedControl's `aria-label` and Slider's `label` are optional for this. See [List](https://github.com/envsemble/envUI/blob/main/docs/components/list.md).
