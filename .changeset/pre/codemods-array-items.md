---
'@envsemble/envui-codemods': minor
---

`envui-codemods v1-props` renames the properties of the objects in an array written in a prop, from the new `each` rules of the rename map's `props` section: an organization's `name` and `detail` on OrganizationSwitcher and AccountMenu.OrganizationSubmenu, and a Combobox option's `leading`, also in a group's `items`. It reports such a prop whose items it can't read, such as a variable.
