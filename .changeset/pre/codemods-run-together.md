---
'@envsemble/envui-codemods': patch
---

The codemods run together, in the order `--list` gives them: `v1-names`, `v1-structure`, `v1-render`, `v1-stack`, `v1-props`, then `v1-classes`, and running all of them again changes nothing more. `v1-names` keeps 1.0's layout Row through a namespace import too, such as `<ui.Row gap={2}>`, which `v1-stack` writes, rather than renaming it to List.Item on a second run, and a Row rendered only without a spread and without 0.x's list row props, `title`, which that row required, `detail`, `action` and `interactive`, such as a bare `<Row>`; and a `v1-structure` case that only reports leaves the file as it is. The codemods read code written for 1.0.0-prerelease.0 as well as 0.x code: what has no 1.0 form is reported, and the migration guide says what to write instead.

Migration guide: [Upgrade from envUI 0.x to 1.0](https://github.com/envsemble/envUI/blob/main/docs/migration.md#upgrade-from-envui-0x-to-10).
