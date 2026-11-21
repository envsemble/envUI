# envUI documentation

Where things are in `node_modules/@envsemble/envui/`:

| Path                              | What it holds                                                                 |
| --------------------------------- | ----------------------------------------------------------------------------- |
| `dist/**/*.d.ts`                  | The exact API, with doc comments.                                             |
| `docs/components/<name>.md`       | A component's page: what it is for, its examples, props and styling contract. |
| `docs/examples/<page>/<Name>.tsx` | Every example as a file to copy.                                              |
| `docs/generated/props.json`       | The props of every export.                                                    |
| `docs/generated/parts.json`       | Every component's part classes, state attributes and color properties.        |
| `docs/foundations/`               | The tokens and scales, in tables.                                             |

## Setup and workflows

- [Install and set up](setup.md) — Install, theme, router, locale and entry points.
- [Customize](customizing.md) — The styling contract of every component, the theme settings and colors.
- [Writing](writing.md) — The words of an interface: the vocabulary and sentence case.

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

## Navigation

- [NavigationDrawer](components/navigation-drawer.md)
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
- [Graphic](components/graphic.md)
- [Meter](components/meter.md)
- [RelativeTime](components/relative-time.md)

## Text & content

- [Markdown](components/markdown.md)
- [Code](components/code.md)
- [Kbd](components/kbd.md)
- [VisuallyHidden](components/visually-hidden.md)
- [Message](components/message.md)
- [Composer](components/composer.md)
- [Accordion](components/accordion.md)
- [Disclosure](components/disclosure.md)

## Feedback

- [Alert](components/alert.md)
- [EmptyState](components/empty-state.md)
- [Toast](components/toast.md)
- [Progress](components/progress.md)
- [Spinner](components/spinner.md)
- [Halo](components/halo.md)

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
- [ResizeHandle](components/resize-handle.md)
- [TopBar](components/top-bar.md)
- [Surface](components/surface.md)
- [Card](components/card.md)
- [Box](components/box.md)
- [Row](components/row.md)
- [Column](components/column.md)
- [Grid](components/grid.md)
