---
'@envsemble/envui': minor
---

`useModifierKey()` gives the platform's shortcut modifier: `{ key: 'Meta', label: '⌘' }` on Apple platforms and `{ key: 'Control', label: 'Ctrl' }` elsewhere, for a Kbd's keys and `aria-keyshortcuts`. It gives Ctrl on the server and while the page hydrates, then ⌘ on Apple platforms, so a server-rendered search trigger hydrates without a mismatch. The search trigger pattern, its examples and the migration note use it in place of reading `navigator` while rendering.
