---
'@envsemble/envui': major
'@envsemble/eslint-plugin-envui': patch
---

One leading slot, `start`, holds the content before a label everywhere: Menu's items and submenus, a CommandPalette item, Button, Badge, a RichTextEditor slash command and the rows of Combobox and Select. An envUI icon in it takes the icon size and other content, such as an Avatar, keeps its own; a menu widens its leading column only when some row's start holds more than an icon. A Combobox option's `start` renders through the row's start slot, at the size it had. no-raw-graphics' message names IconButton's `icon` as an icon slot that sizes another package's icon, in place of Button's `startIcon`. See [Menu](https://github.com/envsemble/envUI/blob/main/docs/components/menu.md) and [Button](https://github.com/envsemble/envUI/blob/main/docs/components/button.md).

Breaking changes:

- `icon` on `Menu.Item`, `Menu.CheckboxItem`, `Menu.RadioItem` and `Menu.Submenu` is removed: write `start={<IconSettings />}`.
- A CommandPalette item's `icon` is removed: write `start: <IconSettings />`.
- Button's and ConfirmButton's `startIcon` is removed, with the part `env-button-start-icon`: write `start={<IconAdd />}`; the content is in `env-button-start`.
- Badge's `icon` is removed: write `start={<IconCheckCircle />}`, or `start={null}` for a done badge without its check mark. Assistive technology reads `start` unless the content hides itself, as an envUI icon without a label does.
- The part `env-list-row-icon` of the rows of Select, Combobox, CommandPalette and RichTextEditor's suggestions is removed: the content before a row's name is in `env-list-row-start`.
- `start` sizes envUI's icons and a Graphic, not a raw `<svg>` or another package's icon component, which `icon` and `startIcon` wrapped: wrap those in `<Graphic alt="">`.
