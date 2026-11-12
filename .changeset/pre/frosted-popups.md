---
'@envsemble/envui': minor
---

Popups are frosted: menus and submenus, Select and Combobox lists, the command palette, popovers, hover cards, the DatePicker, MonthPicker and TimePicker popups, ColorPickerButton's popover and rich text suggestions show the popup's color at 88 % in light and 90 % in dark over a blur of what is behind them, with a soft shadow and no outline edge. Three properties, set on a theme, change them: `--env-popup-opacity`, `--env-popup-blur` and `--env-popup-shadow`, envUI's second drop shadow after the avatars'. At high contrast, with `prefers-reduced-transparency` and under forced colors, popups are solid, with their elevation edge and no blur or shadow. Tooltips stay solid.

Inside them, rows are 40 px tall, 32 px at the compact scale, in body text with corners concentric with the popup's (1.25 rem on a menu or list); groups and Menu.Separator part by space, with no hairline, under a small muted label; shortcuts are muted text; a highlighted row takes the neutral fill and a chosen option the selection's fill as well as its check mark. The command palette's search is an opaque 3 rem pill with no outline, whose edge returns at high contrast.

A Sheet has no edge line: its fill and its scrim set it apart, and the edge returns at high contrast.
