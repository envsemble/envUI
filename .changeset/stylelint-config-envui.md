---
'@envsemble/stylelint-config-envui': major
---

The first release: a Stylelint config for applications built with envUI, for Stylelint 17. It reports selectors of envUI's private `env-` classes (besides the `.env-theme` boundary), raw colors, a literal `z-index`, and px outside hairlines, and each message says what to use instead: the component's props, the envUI color tokens for the property by name, rem, or for `z-index`, envUI's stacking tokens (`--env-z-…`).

The config is released with `@envsemble/envui` at the same version; install the version that matches envUI.

Migration guide: [Upgrade from envUI 0.x to 1.0](../../docs/migration.md#upgrade-from-envui-0x-to-10).
