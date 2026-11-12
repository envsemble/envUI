---
'@envsemble/envui': minor
---

Menu.Root's `aria-label` is optional: the menu takes its trigger's name. Menu.RadioGroup takes `defaultValue` and Menu.CheckboxItem `defaultChecked`, so a choice can stay the menu's own. Menu.Separator, Menu.Group and Menu.RadioGroup pass their native props on, and the `onOpenChange` of Menu.Root, Menu.Submenu and ContextMenu receives why, `Menu.OpenChangeDetails`.
