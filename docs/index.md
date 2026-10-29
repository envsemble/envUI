# envUI documentation

Read only the pages the task needs; each entry says what it is for. For a screen, read its pattern first, under Patterns at the end, then the pages of the components it names.

| Path in `node_modules/@envsemble/envui/` | What it holds                                                          |
| ---------------------------------------- | ---------------------------------------------------------------------- |
| `docs/`                                  | These pages, with their examples and props filled in.                  |
| `docs/examples/<page>/<Name>.tsx`        | Every example as a file an application can copy.                       |
| `docs/generated/props.json`              | The props of every export, from the TypeScript declarations.           |
| `docs/generated/parts.json`              | Every component's part classes, state attributes and color properties. |
| `dist/**/*.d.ts`                         | The type declarations, the exact API.                                  |

Every component, pattern and foundation page reads in one order: its frontmatter, with what it is for, what to use instead and its `examples`, each file with its role and caption; then Variants (Options on a foundation), Anatomy, Behaviour, Rules, Accessibility and Words to use, each block a short lead and its rules; then `## Compose`, its code: imports, usage, composition and customizing. Accessibility's **You provide** lists what the application must add, and **Props** lists envUI's own props; every component also takes its element's native props, such as `ref`, `className` and `aria-*`. Every example is a file in `examples/<page>/<Name>.tsx`. The TypeScript declarations hold the exact types.

## Setup and workflows

- [Install and set up](setup.md) — Registry access, styles, themes and public entry points.
- [Move an app to envUI](migration.md) — Bring an application with a UI of its own onto envUI a slice at a time, keeping what it does.
- [Customize and extend](customizing.md) — Give one element colors of its own or recolor an area, compose components into the application's own, and style their parts.
- [Writing](writing.md) — The words of an interface built with envUI: voice, capitalisation, action words, numbers and dates, and wording ready for translation.
- [Dev mode](dev-mode.md) — Check a page's layout while developing: the readout and its problems for agents, at any width, and a 3D view with an inspector for people.
- [Develop envUI locally](local-development.md) — Link a checkout while co-developing a consuming application.
- [Extend the shared library](library-development.md) — Public API changes, changesets, catalogue specimens and acceptance checks.
- [Write a component page](component-pages.md) — The one-file structure, its frontmatter, figures and writing rules, generated props and example files.
- [Write a pattern page](pattern-pages.md) — What a pattern says, and its frontmatter and sections in the one-file structure.

## Foundations

- [Colors & themes](foundations/colors.md)
- [Typography](foundations/typography.md)
- [Spacing & density](foundations/spacing.md)
- [Adapting to width](foundations/responsive.md)
- [Icons](foundations/icons.md)
- [Accessibility](foundations/accessibility.md)

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
- [RichText](components/rich-text.md)

## Navigation

- [Drawer](components/drawer.md)
- [Tabs](components/tabs.md)
- [Breadcrumbs](components/breadcrumbs.md)
- [TableOfContents](components/table-of-contents.md)
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
- [Composer](components/composer.md)
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
- [Panes](components/panes.md)
- [TopBar](components/top-bar.md)
- [PanelDock](components/panel-dock.md)
- [Surface](components/surface.md)
- [Card](components/card.md)
- [LineArt](components/line-art.md)
- [Box](components/box.md)
- [Row](components/row.md)
- [Column](components/column.md)
- [Grid](components/grid.md)

## Patterns

- [Form layout and validation](patterns/forms.md)
- [Settings](patterns/settings.md)
- [Destructive actions](patterns/destructive-actions.md)
- [File upload](patterns/file-upload.md)
- [Notifications and feedback](patterns/feedback.md)
- [Loading](patterns/loading.md)
- [Empty states](patterns/empty-states.md)
- [Key figures](patterns/key-figures.md)
- [Conversation](patterns/conversation.md)
- [Filtering and search](patterns/filtering.md)
- [Data tables](patterns/data-tables.md)
- [Progressive disclosure](patterns/progressive-disclosure.md)
- [App frame](patterns/app-frame.md)
- [Navigation](patterns/navigation.md)
- [Account and organizations](patterns/account-and-organizations.md)
