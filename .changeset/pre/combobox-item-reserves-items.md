---
'@envsemble/envui': major
---

`ComboboxItem` reserves `items`: its type is `never`, since an entry of a Combobox's `items` with an `items` array is a group. An option type of the application's own that extends `ComboboxItem` with an `items` field no longer compiles; such an option was shown as a group. Rename the field, such as to `children` or `members`, and map the data before passing it to Combobox.
