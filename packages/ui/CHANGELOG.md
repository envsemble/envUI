# Changelog

## Unreleased

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
