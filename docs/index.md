# envUI documentation

Choose the pages needed for the current task. Each entry gives its purpose and path; follow related links only when that behavior is involved. Use public TypeScript declarations for exact types.

## Setup and workflows

- [Install the private package](setup.md) — Registry access, styles, themes and public entry points.

- [Migrate an interface to envUI](migration.md) — Replace existing UI while preserving application behavior.

- [Customize colors](customizing-colors.md) — Give one element its own colors through its color properties, or recolor an area with a nested Theme.

- [For agents](agent-tooling.md) — The AGENTS.md index, the MCP server, the manifest, llms.txt and the skills that coding agents use.

- [Dev mode](dev-mode.md) — Check a page's layout while developing: the readout and its problems for agents, at any width, and a 3D view with an inspector for people.

- [Develop envUI locally](local-development.md) — Link a checkout while co-developing a consuming application.

- [Extend the shared library](library-development.md) — Public API changes, changesets, catalogue specimens and acceptance checks.

- [Write a component page](component-pages.md) — The page template, frontmatter, generated props and example files, and how to convert a page.

- [Write a pattern page](pattern-pages.md) — The frontmatter, sections and files of pattern pages.

## Foundations

- [Colors & themes](foundations/colors.md) — Colors named by their role, so every screen works in light, dark and high contrast.
- [Typography](foundations/typography.md) — Shared styles for headings, body copy and supporting text.
- [Spacing & shape](foundations/spacing.md) — How space groups things, controls line up and corners say what a thing is.
- [Scale & density](foundations/scale.md) — The comfortable and compact app scales, control sizes and the row density of data components.
- [Layout & stacking](foundations/responsive.md) — Window classes, container queries, measuring a container and the stacking order of frames and popups.
- [Composition & extension](foundations/composition.md) — Build product interfaces from shared primitives and existing components.
- [Icons & assets](foundations/icons.md) — Local Material Symbols and official brand assets, ready to use.
- [Accessibility](foundations/accessibility.md) — Keyboard access, visible focus and clear guidance across shared controls.
- [Content guidelines](foundations/content.md) — Voice, capitalisation, action words, labels, errors, empty states, feedback and the neutral sample data.

## Actions

- [Button](components/button.md)
- [Link](components/link.md)
- [Toolbar](components/toolbar.md)
- [Menu](components/menu.md)
- [Menubar](components/menubar.md)
- [CommandPalette](components/command-palette.md)

## Forms & selection

- [TextField](components/text-field.md)
- [Field](components/field.md)
- [Select](components/select.md)
- [Combobox](components/combobox.md)
- [Checkbox](components/checkbox.md)
- [Radio](components/radio.md)
- [Switch](components/switch.md)
- [SegmentedControl](components/segmented-control.md)
- [Slider](components/slider.md)
- [DatePicker](components/date-picker.md)
- [TimePicker](components/time-picker.md)
- [MonthPicker](components/month-picker.md)
- [ColorPicker](components/color-picker.md)
- [DropZone](components/drop-zone.md)
- [Composer](components/composer.md)
- [RichText](components/rich-text.md)

## Navigation

- [Bar](components/bar.md)
- [Rail](components/rail.md)
- [Drawer](components/drawer.md)
- [Tabs](components/tabs.md)
- [Breadcrumbs](components/breadcrumbs.md)
- [Pager](components/pager.md)
- [Pagination](components/pagination.md)
- [Tree](components/tree.md)
- [DocumentTabs](components/document-tabs.md)

## Data display

- [Table](components/table.md)
- [List](components/list.md)
- [DescriptionList](components/description-list.md)
- [Badge](components/badge.md)
- [Avatar](components/avatar.md)
- [Meter](components/meter.md)
- [Rating](components/rating.md)
- [CalendarHeatmap](components/calendar-heatmap.md)
- [AnimatedNumber](components/animated-number.md)
- [RelativeTime](components/relative-time.md)

## Text & content

- [Markdown](components/markdown.md)
- [Code](components/code.md)
- [Kbd](components/kbd.md)
- [Message](components/message.md)
- [Accordion](components/accordion.md)
- [Disclosure](components/disclosure.md)

## Feedback

- [Alert](components/alert.md)
- [Toast](components/toast.md)
- [Progress](components/progress.md)
- [Spinner](components/spinner.md)

## Overlays

- [Dialog](components/dialog.md)
- [ConfirmDialog](components/confirm-dialog.md)
- [Sheet](components/sheet.md)
- [Popover](components/popover.md)
- [HoverCard](components/hover-card.md)
- [Tooltip](components/tooltip.md)

## App frame & layout

- [Scaffold](components/scaffold.md)
- [Page](components/page.md)
- [PageHeader](components/page-header.md)
- [Panes](components/panes.md)
- [TopBar](components/top-bar.md)
- [PanelDock](components/panel-dock.md)
- [Surface](components/surface.md)
- [Card](components/card.md)
- [Box](components/box.md)
- [Row](components/row.md)
- [Column](components/column.md)
- [Grid](components/grid.md)

## Patterns

- [Form layout and validation](patterns/forms.md)
- [Settings](patterns/settings.md)
- [Destructive actions](patterns/destructive-actions.md)
- [Notifications and feedback](patterns/feedback.md)
- [Loading](patterns/loading.md)
- [Empty states](patterns/empty-states.md)
- [Key figures](patterns/key-figures.md)
- [Filtering and search](patterns/filtering.md)
- [Data tables](patterns/data-tables.md)
- [Progressive disclosure](patterns/progressive-disclosure.md)
- [App frame](patterns/app-frame.md)
- [Navigation](patterns/navigation.md)
- [Account menu](patterns/account-menu.md)
- [Organization switcher](patterns/organization-switcher.md)
- [Window frame](patterns/window-frame.md)
- [Search trigger](patterns/search-trigger.md)
- [Feature cards](patterns/feature-cards.md)
