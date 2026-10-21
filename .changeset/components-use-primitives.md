---
'@envsemble/envui': patch
---

envUI's components lay out their own parts with Row, Column and Grid instead of flex and grid rules of their own, so the parts that arrange others carry `data-env-layout` (and dev mode names them). Their part classes, state attributes and look are unchanged: what was a grid is a Grid, a flex row or column a Row or Column, and a part's own class still overrides the primitive's rules.

Row and Column zero the block margins of their direct children (and Row the inline ones too), so content of yours placed directly in such a part loses its default margins, such as a `<p>` passed to List.Item, Message's actions, Alert's `action`, Card's header or Tabs. Give it a class with the margin you want, or wrap it. Parts that were grids, such as Message, Popover, Field and Stat, keep their children's margins.

- Feedback and floating surfaces: Alert, Dialog's header, EmptyState, LoadingState, Meter, Progress, Popover, HoverCard, CommandPalette, the popups of Menu, Select, Combobox, DatePicker, MonthPicker and TimePicker, and the OrganizationSwitcher header.
- Content: Card's header and feature layout, CodeBlock's heading, CalendarHeatmap, List, Message, MessageList, Stat and Stat.Group.
- Form controls: Field and its error, Calendar, the month grid, the panes, time column and actions of DatePicker, MonthPicker and TimePicker, DropZone, Composer, MarkdownEditor's write pane, RadioGroup and Slider's heading.
- Navigation and actions: Breadcrumbs, DocumentTabs' bar and strip, Menubar, Pager's row, Pagination, Tabs, Toolbar and its groups, and PanelDock's dock, panels, tab strip and header parts. A Toolbar or Toolbar.Group given `render`, such as a ButtonGroup, is now laid out by that element's own rules, so a ButtonGroup keeps its connected spacing.
