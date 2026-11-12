---
'@envsemble/envui': major
---

A multiple Combobox's `onValueChange` receives `(Item | ComboboxItem)[]` where it received `Item[]`: a chosen value none of the options has had, such as one given before a server search finds it, comes as a `ComboboxItem` of its own, with the value as its label, and never claimed the fields of your own `Item`. A handler typed for `Item[]` takes `(Item | ComboboxItem)[]` and tells the two apart, such as with `'email' in item`; with the default `ComboboxItem` nothing changes.
