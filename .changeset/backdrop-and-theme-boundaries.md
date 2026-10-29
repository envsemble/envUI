---
'@envsemble/envui': major
'@envsemble/envui-codemods': minor
---

The layer behind a modal is the backdrop everywhere, as Base UI names it: `--env-color-bg-overlay` and `--env-color-bg-overlay-muted` are `--env-color-bg-backdrop` and `--env-color-bg-backdrop-muted`, `--env-z-overlay` is `--env-z-backdrop`, and Panes' `env-panes-scrim` is `env-panes-backdrop`, as Dialog's and Sheet's are. The theme boundaries are named after what they wrap: the notifications' `env-toast-portal-theme` is `env-toast-theme`, and `env-overlay-theme`, around the portal of a dialog, a sheet or the command palette, is the shared anatomy `Overlay` in the part contract. `v1-classes` renames the tokens and the 0.x class.
