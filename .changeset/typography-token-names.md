---
'@envsemble/envui': major
'@envsemble/envui-codemods': minor
---

The typography tokens take the names of Text's variants, with `sm` as every other scale has it, and the category first:

- type roles: `--env-type-h1` is `--env-type-headline`, `--env-type-h2` `--env-type-title` and `--env-type-body-small` `--env-type-body-sm`; `--env-type-display` is new, the display variant's font, which grows with the window;
- font sizes: `--env-font-size-heading` is `--env-font-size-headline`, `-heading-small` `--env-font-size-title`, `-body-small` `--env-font-size-body-sm` and `-label-small` `--env-font-size-label-sm`;
- `--env-body-font-weight` is `--env-font-weight-body`.

`v1-classes` renames them, the parts of each type role included, such as `--env-type-h1-font-size`.
