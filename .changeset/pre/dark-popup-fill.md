---
'@envsemble/envui': patch
---

In dark, frosted popups take the default surface, `--env-color-bg-default` (#28292b), instead of the popup color, `--env-color-bg-popup` (#343638), still at 90 % over a blur with their shadow, so they part from the cards, tables and rows they open over: menus and submenus, Select and Combobox lists, the command palette and its search, popovers, hover cards, the DatePicker, MonthPicker and TimePicker popups, ColorPickerButton's popover and rich text suggestions. Solid popups, at high contrast, with reduced transparency and under forced colors, take it too, as the approved design draws them; at high contrast their edge is a modal's, `--env-elevation-3-border`, the strongest, in both themes. The light theme keeps #f5f5f7, and dialogs and other surfaces that take `--env-color-bg-popup` keep it. No token changes.
