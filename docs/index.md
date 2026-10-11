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

## Content & guidance

- [Rich text](components/rich-text.md) — Edit formatted content with Tiptap and render the same saved Markdown read-only.
- [Markdown](components/markdown.md) — Render Markdown strings with Markdown, or edit them with MarkdownEditor and its shared preview.
- [Code](components/code.md) — Render inline code and highlighted code blocks.
- [Info chips](components/chips.md) — Read-only metadata beside related content.
- [Disclosure notes](components/disclosures.md) — Keep optional details collapsed until needed.
- [Avatars](components/avatar.md) — A picture of a person or organization with a default picture or initials as fallback.

## Feedback & overlays

- [Empty states](components/empty-state.md) — Explain missing content and offer the next action.
- [Loading](components/loading.md) — Announces loading and reserves space for incoming content.
- [Toasts](components/toasts.md) — Managed feedback with configurable duration, placement and stack capacity.
- [Dialogs](components/dialogs.md) — Centered modals and side panels share focus and dismissal behavior.
- [Tooltips](components/tooltip.md) — Short hints on hover and keyboard focus.
- [Meters & progress](components/meters.md) — Quantities within a range and task completion.
