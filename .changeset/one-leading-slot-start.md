---
'@envsemble/envui': major
'@envsemble/eslint-plugin-envui': patch
---

One leading slot, `start`, holds the content before a label everywhere: Menu's items and submenus, a CommandPalette item, Button, Badge, TextField, a SegmentedControl item, a Tree item, a DocumentTabs tab, Pager.Previous and the rows of Combobox and Select; Button's and Pager.Next's `end` holds everything after their label. An envUI icon in either takes the icon size and other content, such as an Avatar, keeps its own; a menu widens its leading column only when some row's start holds more than an icon. A Combobox option's `start` renders through the row's start slot, at the size it had. no-raw-graphics' message names IconButton's `icon` as an icon slot that sizes another package's icon, in place of Button's `startIcon`. See [Menu](https://github.com/envsemble/envUI/blob/main/docs/components/menu.md) and [Button](https://github.com/envsemble/envUI/blob/main/docs/components/button.md).

Breaking changes:

- `icon` on `Menu.Item`, `Menu.CheckboxItem`, `Menu.RadioItem` and `Menu.Submenu` is removed: write `start={<IconSettings />}`.
- A CommandPalette item's `icon` is removed: write `start: <IconSettings />`.
- Button's and ConfirmButton's `startIcon` is removed, with the part `env-button-start-icon`: write `start={<IconAdd />}`; the content is in `env-button-start`.
- Badge's `icon` is removed: write `start={<IconCheckCircle />}`, or `start={null}` for a done badge without its check mark. Assistive technology reads `start` unless the content hides itself, as an envUI icon without a label does.
- The part `env-list-row-icon` of the rows of Select, Combobox and CommandPalette is removed: the content before a row's name is in `env-list-row-start`.
- TextField's `startIcon` is removed, with the state `data-start-icon` on `env-text-field-control`: write `start={<IconMail />}`; the content is still in `env-text-field-start`, and the state is `data-start`.
- A SegmentedControl item's `icon` is removed, with the part `env-segmented-control-item-icon`: write `start: <IconViewList />`; the content is in `env-segmented-control-item-start`.
- A Tree item's `icon` is removed, with the part `env-tree-icon`: write `start: <IconFolder />`; the content is in `env-tree-start`.
- A DocumentTabs item's `icon` is removed: write `start: <IconDescription />`; the content is in `env-document-tabs-tab-start`.
- Pager.Previous's and Pager.Next's `icon` is removed: write `start={<IconArrowBack />}` on Pager.Previous and `end={<IconArrowForward />}` on Pager.Next; the content is in `env-pager-link-start` and `env-pager-link-end`. `Pager.LinkProps` no longer has `icon`, `Pager.PreviousProps` adds `start` to it and `Pager.NextProps` `end`.
- Button's, ConfirmButton's and DialogClose's `endIcon` is removed, with the part `env-button-end-icon`: write `end={<IconChevronRight />}`; the content is in `env-button-end`, which sits at the far end of a full-width button.
- `start` and `end` size envUI's icons and a Graphic, not a raw `<svg>` or another package's icon component, which `icon`, `startIcon` and `endIcon` wrapped: wrap those in `<Graphic alt="">`.
