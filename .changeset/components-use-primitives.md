---
'@envsemble/envui': patch
---

envUI's components lay out their own parts with Row, Column and Grid instead of flex and grid rules of their own, so the parts that arrange others carry `data-env-layout` (and dev mode names them). Their part classes, state attributes and look are unchanged; a part's own class still overrides the primitive's rules.

- Feedback and floating surfaces: Alert, Dialog's header, EmptyState, LoadingState, Meter, Progress, Popover, HoverCard, CommandPalette, the popups of Menu, Select, Combobox, DatePicker, MonthPicker and TimePicker, and the OrganizationSwitcher header.
