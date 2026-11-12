---
'@envsemble/envui': patch
---

Dev mode's `PartsEntry` types `root` as `string | null`, as `parts.json` has it for a shared group without a root, so `installDevMode({ parts })` takes `@envsemble/envui/parts.json` as imported.
