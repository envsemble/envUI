---
'@envsemble/envui': minor
---

Combobox: a group's heading takes content, as Select's does, such as an icon or a count beside the group's name. The type of `ComboboxGroup.label` widens from `string` to `ReactNode`: groups an app passes in keep working, and code that reads a group's label back as a string needs a check that it is one. See [Combobox](https://github.com/envsemble/envUI/blob/main/docs/components/combobox.md).
