# envUI documentation

Choose the pages needed for the current task. Each entry gives its purpose and path; follow related links only when that behavior is involved. Use public TypeScript declarations for exact types.

## Setup and workflows

- [Install the private package](setup.md) — Registry access, styles, themes and public entry points.

- [Migrate an interface to envUI](migration.md) — Replace existing UI while preserving application behavior.

- [Develop envUI locally](local-development.md) — Link a checkout while co-developing a consuming application.

- [Extend the shared library](library-development.md) — Public API changes, catalogue specimens and acceptance checks.

## Foundations

- [Colors & themes](foundations/colors.md) — Semantic colors that carry the same purpose across light and dark themes.
- [Typography](foundations/typography.md) — Shared styles for headings, body copy and supporting text.
- [Spacing & shape](foundations/spacing.md) — A shared scale for space, corners and controls that grow with content.
- [Composition & extension](foundations/composition.md) — Build product interfaces from shared primitives and existing components.
- [Icons & assets](foundations/icons.md) — Local Material Symbols and official brand assets, ready to use.
- [Accessibility](foundations/accessibility.md) — Keyboard access, visible focus and clear guidance across shared controls.

## Layout & surfaces

- [Stacks & action groups](components/layout.md) — Use Stack for related content and ActionGroup for buttons.
- [Surface](components/surface.md) — A background pane without automatic spacing between children.
- [Grouped rows](components/rows.md) — Group related items with shared outer corners.
- [Cards](components/cards.md) — A content surface with automatic spacing and optional actions.

## Actions

- [Buttons](components/buttons.md) — Button, IconButton, ButtonGroup.
- [Segmented controls](components/segmented-control.md) — One choice among a few options on a pill rail, such as views or filters.

## Forms & selection

- [Color picker](components/color-picker.md) — A color area, hue slider and HEX field for opaque colors.
- [Text fields](components/fields.md) — Single-line inputs, search fields and multiline textareas share labels, guidance and states.
- [Checkboxes](components/checkbox.md) — Independent choices; partial selection represents a group.
- [Switches](components/switch.md) — Use for an on/off setting that applies immediately.
- [Radio groups](components/radio.md) — Choose one option from a visible set.
- [Selects](components/select.md) — Choose one option while keeping alternatives collapsed.

## Navigation

- [Navigation items](components/navigation.md) — Links to another destination; routing stays with the app.
- [Tabs](components/tabs.md) — Switches between content panels in the same view.
- [Direction links](components/direction-links.md) — Centered previous and next destinations, together or individually.
- [Application shell](components/app-shell.md) — Topbar and collapsible navigation sidebar for a whole application.
- [Tree](components/tree.md) — A virtualized tree of rows for large hierarchies, such as file trees.
- [Document tabs](components/document-tabs.md) — Closable editor-style tabs for open documents.
- [Breadcrumbs](components/breadcrumbs.md) — The path from the top level to the current page.

## Content & guidance

- [Rich text](components/rich-text.md) — Edit formatted content with Tiptap and render the same saved Markdown read-only.
- [Markdown](components/markdown.md) — Render Markdown strings with Markdown, or edit them with MarkdownEditor and its shared preview.
- [Code](components/code.md) — Render inline code and highlighted code blocks.
- [Info chips](components/chips.md) — Read-only metadata beside related content.
- [Badges & counters](components/badges.md) — Small pills that name a state in its tone, and compact counts.
- [Tables](components/tables.md) — Semantic data tables on a rounded surface, with dense and sticky options.
- [Keyboard keys](components/keyboard.md) — Key caps for shortcuts in text, menus and hints.
- [Animated numbers](components/animated-number.md) — Counts that roll to their new value, so a change is noticed.
- [Disclosure notes](components/disclosures.md) — Keep optional details collapsed until needed.
- [Avatars](components/avatar.md) — A picture of a person or organization with a default picture or initials as fallback, and the avatar button.

## Feedback & overlays

- [Empty states](components/empty-state.md) — Explain missing content and offer the next action.
- [Loading](components/loading.md) — Page progress, spinners, pending buttons and placeholders for incoming content.
- [Toasts](components/toasts.md) — Managed feedback with configurable duration, placement and stack capacity.
- [Notices](components/notices.md) — Inline banners for page- or section-level messages in four tones.
- [Dialogs](components/dialogs.md) — Centered modals and side panels share focus and dismissal behavior.
- [Command palette](components/command-palette.md) — Quick open: search and choose from a ranked list near the top of the window.
- [Menus](components/menu.md) — Actions, destinations and the shared organization menu, opened from a trigger or a right click.
- [Tooltips](components/tooltip.md) — Short hints on hover and keyboard focus.
- [Popovers](components/popover.md) — A floating panel for details or a small form beside its trigger.
- [Meters & progress](components/meters.md) — Quantities within a range and task completion.
