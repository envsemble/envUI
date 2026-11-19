---
'@envsemble/eslint-plugin-envui': minor
---

`envui/no-link-in-clickable-row` reports a link in a List.Item only when the row itself takes the click, with `href` or `onClick`. Links beside an interactive row's `data-row-target` pass, since they now stay clickable above it. See [the rules](https://github.com/envsemble/envUI/blob/main/packages/eslint-plugin/README.md).
