---
'@envsemble/envui': major
---

Avatar's `label`, a boolean that named the avatar as an image by its `name`, is `named`, as every other `label` is text. Without it, an avatar is still decorative.

Migrate with the codemods: `envui-codemods v1-props` renames `label` to `named`, whatever its value.

Migration guide: [Content and display](https://github.com/envsemble/envUI/blob/main/docs/migration.md#content-and-display).
