---
'@envsemble/envui': minor
---

Choice controls take a field's words: RadioGroup a `description` and an `error`, which describe the group, Checkbox and Switch a `description` under the label, `env-checkbox-description` and `env-switch-description`, and Slider an `error`. A controlled RadioGroup's `value` takes `null` for none. SegmentedControl can be uncontrolled: `value` and `onValueChange` are optional, and `defaultValue` starts it, the first item by default.
