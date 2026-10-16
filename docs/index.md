# envUI documentation

Choose the pages needed for the current task. Each entry gives its purpose and path; follow related links only when that behavior is involved. Use public TypeScript declarations for exact types.

## Setup and workflows

- [Install the private package](setup.md) — Registry access, styles, themes and public entry points.

- [Migrate an interface to envUI](migration.md) — Replace existing UI while preserving application behavior.

- [Develop envUI locally](local-development.md) — Link a checkout while co-developing a consuming application.

- [Extend the shared library](library-development.md) — Public API changes, changesets, catalogue specimens and acceptance checks.

## Foundations

- [Colors & themes](foundations/colors.md) — Semantic colors that carry the same purpose across light and dark themes.
- [Typography](foundations/typography.md) — Shared styles for headings, body copy and supporting text.
- [Spacing & shape](foundations/spacing.md) — A shared scale for space, corners and controls that grow with content.
- [Composition & extension](foundations/composition.md) — Build product interfaces from shared primitives and existing components.
- [Icons & assets](foundations/icons.md) — Local Material Symbols and official brand assets, ready to use.
- [Accessibility](foundations/accessibility.md) — Keyboard access, visible focus and clear guidance across shared controls.

## Layout & surfaces

- [Stack](components/stack.md) — Use Stack for related content and ActionGroup for buttons.
- [Surface](components/surface.md) — A background pane without automatic spacing between children.
- [List](components/list.md) — Group related items with shared outer corners.
- [Card](components/card.md) — A content surface with automatic spacing and optional actions.

## Actions

- [Button](components/button.md) — Button, IconButton, ConfirmButton, CopyButton, ButtonGroup.
- [SegmentedControl](components/segmented-control.md) — One choice among a few options on a pill rail, such as views or filters.

## Forms & selection

- [ColorPicker](components/color-picker.md) — A color area, hue slider and HEX field for opaque colors, and a color swatch for the button that opens it.
- [TextField](components/text-field.md) — Single-line inputs, search fields and multiline textareas share labels, guidance and states.
- [Composer](components/composer.md) — The message field of a conversation, with a send button that stops a running reply.
- [Checkbox](components/checkbox.md) — Independent choices; partial selection represents a group.
- [Switch](components/switch.md) — Use for an on/off setting that applies immediately.
- [Radio](components/radio.md) — Choose one option from a visible set.
- [Select](components/select.md) — Choose one option while keeping alternatives collapsed.
- [Combobox](components/combobox.md) — Choose one option or several from a list that filters as people type.
- [DatePicker](components/date-picker.md) — Choose a date, or a date and time, from a calendar, which also stands on its own.
- [Slider](components/slider.md) — Choose a value in a range by dragging a thumb or with the keyboard.
- [DropZone](components/drop-zone.md) — Drop files or choose them in the file picker; the application shows what was chosen.

## Navigation

- [NavList](components/nav-list.md) — Links to another destination; routing stays with the app.
- [Tabs](components/tabs.md) — Switches between content panels in the same view.
- [Pager](components/pager.md) — Centered previous and next destinations, together or individually.
- [AppShell](components/app-shell.md) — Topbar, window title bar and collapsible navigation sidebar for a whole application.
- [Tree](components/tree.md) — A virtualized tree of rows for large hierarchies, such as file trees.
- [DocumentTabs](components/document-tabs.md) — Closable editor-style tabs for open documents.
- [PanelDock](components/panel-dock.md) — Windows docked side by side at the bottom of a region that minimize to chips and maximize, keeping their content mounted.
- [Breadcrumbs](components/breadcrumbs.md) — The path from the top level to the current page.
- [Pagination](components/pagination.md) — The range of items shown with previous and next page buttons, compact enough for a toolbar.

## Content & guidance

- [RichText](components/rich-text.md) — Edit formatted content with Tiptap and render the same saved Markdown read-only.
- [Markdown](components/markdown.md) — Render Markdown strings with Markdown, or edit them with MarkdownEditor and its shared preview.
- [Code](components/code.md) — Render inline code, highlighted code blocks and code diffs.
- [InfoChip](components/chips.md) — Read-only metadata beside related content.
- [Badge](components/badge.md) — Small pills that name a state in its tone, compact counts and the size of a change.
- [Table](components/table.md) — Semantic data tables on a rounded surface: sorting, resizable columns, selected rows and stacked rows in narrow containers.
- [Kbd](components/kbd.md) — Key caps for shortcuts in text, menus and hints.
- [AnimatedNumber](components/animated-number.md) — Counts that roll to their new value, so a change is noticed.
- [Rating](components/rating.md) — A read-only rating as stars filled in half steps, named once for assistive technology.
- [RelativeTime](components/relative-time.md) — A moment as text relative to now, such as 3 hours ago, kept current, with the date and time in a tooltip.
- [Disclosure](components/disclosure.md) — Keep optional details collapsed until needed.
- [Avatar](components/avatar.md) — A picture of a person or organization with a default picture or initials as fallback, the avatar button and overlapping avatar groups.
- [Message](components/message.md) — Conversation entries in a log: compact bubbles for your own messages, full-width content from others.
- [Stat](components/stat.md) — Labelled key figures for dashboards, with a trend and detail, grouped in even columns.
- [CalendarHeatmap](components/calendar-heatmap.md) — A calendar of daily values in color steps, with a tooltip and keyboard access for every day.

## Feedback & overlays

- [EmptyState](components/empty-state.md) — Explain missing content and offer the next action.
- [Spinner](components/spinner.md) — Work of unknown length in a small area, such as a panel that is updating.
- [Skeleton](components/skeleton.md) — Placeholders in the shape of incoming content, announced once per region.
- [Toast](components/toast.md) — Managed feedback with configurable duration, placement and stack capacity.
- [Alert](components/alert.md) — Inline banners for page- or section-level messages in four tones.
- [Dialog](components/dialog.md) — Centered modals and side panels share focus and dismissal behavior.
- [CommandPalette](components/command-palette.md) — Quick open: search and choose from a ranked list near the top of the window.
- [Menu](components/menu.md) — Actions, destinations and the shared organization switcher, opened from a trigger or a right click.
- [Menubar](components/menubar.md) — An application menubar of compact menus with shortcuts, submenus and access keys.
- [Tooltip](components/tooltip.md) — Short hints on hover and keyboard focus.
- [Popover](components/popover.md) — A floating panel for details or a small form beside its trigger.
- [HoverCard](components/hover-card.md) — Supplementary details beside a link on hover and keyboard focus, like a link preview.
- [Meter](components/meter.md) — A known quantity within a range, such as used seats or storage.
- [Progress](components/progress.md) — How much of a task is complete, or that it runs while the amount is unknown.

## Patterns

- [Loading](patterns/loading.md) — Choose between the page loading bar, skeletons, spinners, pending buttons and progress.
