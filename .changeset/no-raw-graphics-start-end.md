---
'@envsemble/eslint-plugin-envui': major
---

`no-raw-graphics` no longer counts `start` and `end` as icon slots: they size only envUI's icons and a Graphic, so a raw `<svg>` or another package's icon in one, such as `<Button start={<Github />}>`, is reported, with the fix to wrap it in `<Graphic alt="">`. Its message for another package's icon names IconButton's `icon` as the icon slot that sizes one, in place of Button's `startIcon`. See [no-raw-graphics](https://github.com/envsemble/envUI/tree/main/packages/eslint-plugin#no-raw-graphics).

Breaking changes:

- A raw `<svg>` with a fixed size or fill, or another icon package's icon, in a `start` or `end`, such as a List.Item's, is reported: write `start={<Graphic alt=""><Github /></Graphic>}`, or an envUI icon, such as `start={<IconFolder />}`.
