---
'@envsemble/envui': minor
'@envsemble/eslint-plugin-envui': patch
'@envsemble/stylelint-config-envui': patch
---

Success, information and danger toasts take the neutral toast's dark fill, `--env-color-bg-neutral-strong`, with their icon in the tone's light grade on a faint disc of it, rather than a solid green, blue or red fill, so a notification no longer outweighs everything on a busy screen. The icon colors are new tokens, `--env-color-fg-success-on-strong`, `--env-color-fg-info-on-strong` and `--env-color-fg-danger-on-strong`, at 3:1 on the disc, 4.5:1 at high contrast; a toast whose content color is set takes that color for its icon too. `--env-color-bg-{success,info,danger}-strong` stay. Every toast in a region is one width, 22 rem, less the gutters on a phone, so a stack's edges line up rather than following each message's length. The ESLint plugin and the Stylelint config accept the new tokens.
