# Changelog

## Unreleased

- Add fixed scrolling with bottom-edge pointer and keyboard resizing and automatic content sizing, shared by Textarea and MarkdownEditor, with the same 1 rem corners as Input and a minimum row count. Replace the native corner grip with a subtle full-width resize edge.

- Adopt outlined Input/Textarea fields with floating labels, original 1 rem corners and bottom-edge validation. Reuse the outlined textarea in MarkdownEditor; preserve native values, form reset, refs and accessible field metadata.

- Add MarkdownEditor with native textarea selection, formatting, shared undo/redo, Write/Preview, standard link insertion and an application picker callback.

- Keep code/Markdown rendering and editing on the optional @envsemble/envui/content entry so basic UI consumers exclude parsing and highlighting chunks.

- Add Markdown rendering with react-markdown/remark-gfm, envUI prose typography, shared CodeBlock, semantic heading offsets and application-owned link rendering.

- Add Code and CodeBlock with shared source display, optional copying and lazy Shiki highlighting using standard GitHub Light Default and GitHub Dark Default themes.

- Add NavigationItem iconOnly mode for collapsed sidebars, requiring an icon and accessible destination name while retaining native navigation and selection behavior.
- Unify labeled buttons, icon-only buttons and navigation items with one shared 1 rem control icon size, including important buttons.
- Let DirectionLinks wrap into centered rows when destinations cannot fit side by side, preventing narrow groups from squeezing titles into word fragments.
- Add DirectionLinks to bundle optional previous and next destinations in a centered pair, including single-destination pages; document and use it for page navigation.
- Allow Tabs renderList to compose its existing list inside a card or other layout while retaining selection, keyboard behavior and linked panels.
- Wire existing coarse-pointer height tokens into controls, icon circles, selection labels, disclosure summaries and toast dismissal so the documented 2.75 rem touch minimum applies without consumer overrides.
- Add Surface for palette backgrounds, padding and corners; compose Card from Surface and Stack without extra root wrappers. Reuse Surface for dialogs, dropdown popups, tab rails and contrast row panes.
- Unify plain, interactive and action-strip cards through Card props; keep ClickableCard and ActionCard as compatibility wrappers.
- Add native links to Button, semantic tags to Stack/ActionGroup, token-based Text and compact NavigationItem labels.
- Share labels, hints and errors across Input, Textarea and Select; centralize native form reset handling.
- Share connected-row corners across grouped rows, radio choices and select options, and centralize HSL lightness expressions.
- Compose the documentation from public library controls, surfaces, typography and layouts; remove the retired standalone gallery.
- Add Tabs with composed button styles, accessible keyboard selection and animated panels; use it for documentation reference views.
- Add ClickableCard with native link/button semantics and shared hover, pressed, focus and disabled states.
- Use whole-card links in the documentation catalogue, replacing separate Explore controls.

## 0.1.0

Initial envUI React 19 component library and offline documentation consumer.

- Shared light/dark themes, Inter, branding and official Material Symbols Rounded wrappers.
- envUI branding, theme-aware EnvUILogo, bundled lockups/favicons and envUI.html offline reference.
- Buttons, icon buttons, navigation, rows, cards, chips and optional notes.
- DirectionLink for previous/up-next destinations, with custom text and an optional icon.
- Navigation automatically selects official filled/outline icon geometry from its selected state.
- Shared Stack and ActionGroup composition; cards own their content spacing.
- Native fields, checkboxes, switches and radio groups; accessible selects and dialogs.
- Managed notifications with two placements, FIFO queues and paused timers; independent manual toasts.
- Loading and empty states, public TypeScript APIs and shared agent guidance.

No existing product migration is included. Consumers should review the initial API before adopting it.
