---
'@envsemble/envui': patch
---

What enters fades in with `--env-motion-ease-enter`, so it shows from its first frames rather than late: popups, dialogs, sheets, toasts, the command palette and a tab's panel. Menus, selects, popovers, hover cards and the pickers' popups grow from 98 % over `--env-motion-duration-medium`, rather than from 96 % over the slow duration; a Tooltip only fades, in `--env-motion-duration-fast`. A new tab's panel starts half faded, so switching tabs never shows an empty panel between the two. Leaving is unchanged.
