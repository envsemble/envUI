---
'@envsemble/envui-codemods': patch
---

`v1-entries` reports what it can't move instead of leaving it silently: `export * from '@envsemble/envui'` and `export * as ui from '@envsemble/envui'`, which no longer re-export ColorPicker, ColorSwatch and their props types, and, in a file that names one of them, each `import('@envsemble/envui')` and `require('@envsemble/envui')`. `v1-classes` reports a renamed component token that is now a color property, which doesn't inherit, where a rule sets it on something other than the component, such as `.my-alert { --env-alert-tint: … }`.
