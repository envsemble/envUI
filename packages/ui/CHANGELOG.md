# Changelog

## Unreleased

- Add an optional Tiptap rich-text entry with RichTextEditor, the matching read-only RichText viewer and a shared extension factory. Keep Markdown values, configurable reference lookup with stable IDs, slash commands and application-owned upload/navigation callbacks generic; retain MarkdownEditor for source editing.

- Add ColorPicker with a labeled color area, hue slider and native HEX field. Share validation, normalization, disabled/read-only behavior, keyboard focus and form reset through the public API; documentation palette editing consumes the library control.

- Compose documentation color swatches, state disclosures, link demonstrations and vertical layouts from existing Button, Link, DisclosureNote and Stack components.

- Use GitHub Dark Default for code blocks and inline code in both application themes, including Markdown. Preserve CodeBlock's explicit theme override, syntax highlighting, source text and copying.

- Adopt sampled Chrome Web Store and Google Ads colors for the light palette: white canvas, cool pale panes, gray surfaces, Google blue actions and selection, charcoal text and soft gray borders.

- Separate color roles by primitive purpose for surfaces, rows, button variants, navigation, direction links, form controls, feedback and loading placeholders. Composed components reuse their primitives: tabs, icon buttons, links and toast actions share Button colors; cards, tab rails, dialog shells and menus share Surface colors; Select shares secondary Button and field colors. Derive interaction shades from each primitive's base in both themes.

- Give light-theme rows and cards a more defined default fill. Use gentle 2-point hover and 4-point pressed lightness shifts for cards and selectable rows in both themes, derived from each surface's base color.

- Give DirectionLink the raised surface background role in both themes, with white light-theme fills and hover/pressed states derived from the same surface color.

- Refine light theme backgrounds with a cool page canvas, softly tinted panes and lighter neutral rows and controls. Align loading placeholders with the row fill and strengthen caption contrast.

- Restart a timed toast's full visible duration when it returns from overflow. Scope keyboard-focus pauses to the individual notice, preserving F6 viewport access; persistent notices no longer pause unrelated timers.

- Keep newest managed toasts visible immediately, pushing older notices behind the count indicator. Enter from the top at top-center and the bottom at bottom-right. Use Base UI's visibility limit, pause hidden timers and restart the visible duration when older notices reappear.

- Add a text Button variant with no fill or border, an optional underline and shared blue link interaction colors. Build inline Link on the same implementation, with inherited typography and an underline by default. Use Link for Markdown rendering; retain native action/link semantics, keyboard focus and disabled behavior.

- Support explicit dismissal durations for every managed toast, including `Infinity` for persistence. Show a per-placement older-notice count above stacks that exceed `visibleLimit`; preserve pause-aware timers.

- Preserve hover and pressed feedback on focused invalid text fields and plain error underlines. Make the textarea resize edge inherit the field’s hover, focus, error and dragging colors. Add matching red-border interactions to invalid Select controls; all shades follow the shared HSL rule without changing backgrounds.

- Make text field hover visible with a single blue border or a plain-field underline. Derive interaction shades from link blue or the validation red using the shared HSL rule, without changing the background or adding a focus ring.

- Remove the text field hover fill and keep border-only hover feedback. Invalid outlined Input/Textarea, MarkdownEditor and Select controls use a full thin red border; plain fields retain their red underline.

- Add an animated neutral hover fill to outlined Input/Textarea fields using the shared HSL lightness rule. Keep the single blue focus border, suppress hover changes on disabled fields and respect reduced motion.

- Keep a single thin blue border on focused Input/Textarea fields in both themes. Remove the extra focus outline from the shared text field and textarea resize edge, including MarkdownEditor source fields.

- Replace Select’s full red validation outline with a shared bottom-edge accent across Select, Input, Textarea and MarkdownEditor. Keep error colors, recovery messages and keyboard focus styling consistent.

- Add a plain Input/Textarea appearance with a transparent background, no outline and an underline on focus. Share labels, validation and sizing with the outlined default, including MarkdownEditor source fields.

- Add fixed scrolling with bottom-edge pointer and keyboard resizing and automatic content sizing, shared by Textarea and MarkdownEditor, with the same 1 rem corners as Input and a minimum row count. Replace the native corner grip with a subtle full-width resize edge.

- Adopt outlined Input/Textarea fields with floating labels, original 1 rem corners and bottom-edge validation. Reuse the outlined textarea in MarkdownEditor; preserve native values, form reset, refs and accessible field metadata.

- Add ButtonGroup for connected horizontal rows and vertical columns, with mixed button variants, shared row inner corners and each end button’s normal outer corners.

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
