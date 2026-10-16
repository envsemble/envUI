---
'@envsemble/stylelint-config-envui': major
---

The first release: a Stylelint config for applications built with envUI, for Stylelint 17. It reports selectors of envUI's private `env-` classes (besides the `.env-theme` boundary), raw colors, a literal `z-index`, and px outside hairlines, and each message says what to use instead: the component's props, envUI's color and stacking tokens, or rem.

The config is released with `@envsemble/envui` at the same version; install the version that matches envUI.
