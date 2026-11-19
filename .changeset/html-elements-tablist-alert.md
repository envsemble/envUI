---
'@envsemble/eslint-plugin-envui': minor
---

`no-html-elements` no longer reports `role="tablist"` or `role="alert"`. envUI has no tabs component, so a tab list an app builds with the tablist, tab and tabpanel roles passes, and so does an app's own live message, such as a failed-load line inside a custom widget. See [no-html-elements](https://github.com/envsemble/envUI/tree/main/packages/eslint-plugin#no-html-elements).
