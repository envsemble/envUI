# envUI documentation

Choose the pages needed for the current task. Each entry gives its purpose and path; follow related links only when that behavior is involved. Use public TypeScript declarations for exact types.

## Setup and workflows

- [Install the private package](setup.md) — Registry access, styles, themes and public entry points.

- [Migrate an interface to envUI](migration.md) — Replace existing UI while preserving application behavior.

- [Customize and extend](customizing.md) — Give one element colors of its own or recolor an area, compose components into the application's own, and style their parts.

- [For agents](agent-tooling.md) — The AGENTS.md index, the MCP server, the manifest, llms.txt and the skills that coding agents use.

- [Dev mode](dev-mode.md) — Check a page's layout while developing: the readout and its problems for agents, at any width, and a 3D view with an inspector for people.

- [Develop envUI locally](local-development.md) — Link a checkout while co-developing a consuming application.

- [Extend the shared library](library-development.md) — Public API changes, changesets, catalogue specimens and acceptance checks.

- [Write a component page](component-pages.md) — The page template, frontmatter, generated props and example files, and how to convert a page.

- [Write a pattern page](pattern-pages.md) — The frontmatter, sections and files of pattern pages.

## Foundations

- [Colors & themes](foundations/colors.md) — Colors named by their role, so every screen works in light, dark and high contrast.
- [Typography](foundations/typography.md) — A few text styles, each with one job, from a page's hero line to small notes.
- [Spacing & density](foundations/spacing.md) — How space groups things, controls line up, the compact scale and tighter rows, and what corners say.
- [Adapting to width](foundations/responsive.md) — Components follow the space they sit in, and four window classes name where a layout changes.
- [Icons](foundations/icons.md) — Thousands of Material Symbols that follow their text, outlined or filled.
- [Accessibility](foundations/accessibility.md) — What every component does for keyboard, screen readers, contrast, motion and touch, and what an app still supplies.
- [Content guidelines](foundations/content.md) — Voice, capitalisation, action words, labels, errors, empty states, feedback and the neutral sample data.

## Layout & surfaces

- [Box](components/box.md)
- [Row](components/row.md)
- [Column](components/column.md)
- [Grid](components/grid.md)
- [Scaffold](components/scaffold.md)
- [Panes](components/panes.md)
- [Page](components/page.md)
- [PageHeader](components/page-header.md)
- [Surface](components/surface.md)
- [List](components/list.md)
- [Card](components/card.md)

## Actions

- [Button](components/button.md)
- [Toolbar](components/toolbar.md)
- [Link](components/link.md)

## Forms & selection

- [ColorPicker](components/color-picker.md)
- [TextField](components/text-field.md)
- [Field](components/field.md)
- [Composer](components/composer.md)
- [Checkbox](components/checkbox.md)
- [Switch](components/switch.md)
- [Radio](components/radio.md)
- [Select](components/select.md)
- [SegmentedControl](components/segmented-control.md)
- [Combobox](components/combobox.md)
- [DatePicker](components/date-picker.md)
- [TimePicker](components/time-picker.md)
- [MonthPicker](components/month-picker.md)
- [Slider](components/slider.md)
- [DropZone](components/drop-zone.md)

## Navigation

- [Bar](components/bar.md)
- [Rail](components/rail.md)
- [Drawer](components/drawer.md)
- [Tabs](components/tabs.md)
- [Pager](components/pager.md)
- [TopBar](components/top-bar.md)
- [Tree](components/tree.md)
- [DocumentTabs](components/document-tabs.md)
- [PanelDock](components/panel-dock.md)
- [Breadcrumbs](components/breadcrumbs.md)
- [Pagination](components/pagination.md)

## Content & guidance

- [RichText](components/rich-text.md)
- [Markdown](components/markdown.md)
- [Code](components/code.md)
- [Badge](components/badge.md)
- [Table](components/table.md)
- [DescriptionList](components/description-list.md)
- [Kbd](components/kbd.md)
- [AnimatedNumber](components/animated-number.md)
- [Rating](components/rating.md)
- [RelativeTime](components/relative-time.md)
- [Accordion](components/accordion.md)
- [Disclosure](components/disclosure.md)
- [Avatar](components/avatar.md)
- [Message](components/message.md)
- [CalendarHeatmap](components/calendar-heatmap.md)

## Feedback & overlays

- [Spinner](components/spinner.md)
- [Toast](components/toast.md)
- [Alert](components/alert.md)
- [Dialog](components/dialog.md)
- [Sheet](components/sheet.md)
- [ConfirmDialog](components/confirm-dialog.md)
- [CommandPalette](components/command-palette.md)
- [Menu](components/menu.md)
- [Menubar](components/menubar.md)
- [Tooltip](components/tooltip.md)
- [Popover](components/popover.md)
- [HoverCard](components/hover-card.md)
- [Meter](components/meter.md)
- [Progress](components/progress.md)

## Patterns

- [Form layout and validation](patterns/forms.md)
- [Settings](patterns/settings.md)
- [Destructive actions](patterns/destructive-actions.md)
- [Notifications and feedback](patterns/feedback.md)
- [Loading](patterns/loading.md)
- [Empty states](patterns/empty-states.md)
- [Key figures](patterns/key-figures.md)
- [Navigation](patterns/navigation.md)
- [App frame](patterns/app-frame.md)
- [Account menu](patterns/account-menu.md)
- [Organization switcher](patterns/organization-switcher.md)
- [Search trigger](patterns/search-trigger.md)
- [Window frame](patterns/window-frame.md)
- [Feature cards](patterns/feature-cards.md)
- [Filtering and search](patterns/filtering.md)
- [Data tables](patterns/data-tables.md)
- [Progressive disclosure](patterns/progressive-disclosure.md)
