# Changelog

## 0.4.0 — 2026-10-11

Clearer contrast in both themes, more ways to show loading, and refinements from reviewing the catalogue and Platform.

### Changed

- Fills are translucent layers of the text color instead of fixed grays, so they stay distinct on panes, rows, cards and dialogs while keeping their tone on the canvas.
  - `--color-secondary-action`, `--color-chip`, `--color-switch-off`, `--color-skeleton-base` and meter tracks use the new `--color-fill` (6% in light, 12.5% in dark), with `--color-fill-hover` and `--color-fill-pressed`.
  - Secondary buttons in dialogs and side panels, tab rails on panes, and chips and switches on rows no longer blend into their surface.
  - The 0.2.0 rule that shifted secondary buttons on row fills is replaced by the translucent fill.
- Hover and press on cards, rows, select options, radio rows and menu items shift 6 and 10 points of lightness, up from 2 and 4.
- `CodeBlock`'s heading follows the code theme, so its copy action uses that theme's colors and stays visible on the dark code background in a light application.
- Inactive tabs show translucent hover and press layers, visible on their rail in both themes.
- Icon-only text buttons, such as a field's clear action, show the same state layers instead of only a faint color change. Inside a field they use its quiet icon color rather than the link blue.
- Press feedback reaches every control:
  - Select triggers, the sidebar toggle and toast dismiss settle like buttons.
  - Direction links and radio rows settle like clickable cards.
  - Checkboxes, radios and switches shrink slightly whether the control or its label is pressed.
- Rows, radio rows, select options and menu items keep 1.5 rem inline padding (`--row-padding-inline`), up from 1 rem, so text clears the large corners on single and connected rows alike. Surfaces keep at least 1.25 rem padding.
- `AppShell`'s expanded sidebar fits its widest content (the navigation or the context beside the toggle) between 12 and 20 rem instead of a fixed 16 rem, and stores the width with `storageKey` so `AppShellSkeleton` matches it. The collapsed sidebar is one control plus its insets wide, so the toggle lines up with the navigation icons.
- The `OrganizationMenu` trigger is a secondary `Button` with the up and down arrows, instead of its own style.
- The `AppShell` sidebar toggle becomes a secondary icon button while its toggle icon shows, instead of using the navigation hover tint; at rest it remains the brand mark.
- `Avatar` initials use the avatar blue of the default person picture (`--color-avatar`, `--color-on-avatar`).
- Toasts glide to their new place when another notice arrives or leaves. The hidden-notice count of the top-center placement sits below the stack, centered.

### Added

- `AvatarButton`: a person's avatar as a button, typically the account menu trigger. A halo shows hover, press and an open menu, and the tooltip shows the name and an optional detail such as the e-mail address.
- `LoadingBar`: page-level progress that appears after a short delay, creeps forward while work continues, then completes and fades out. `AppShell`'s `loading` prop shows it along the topbar's bottom edge.
- `Spinner`: work of unknown length in a small area, in small, standard and large sizes.
- `pending` on `Button` and `IconButton`: a spinner replaces the content at the same size, and the button reports busy and ignores activation.
- `showLabel` on text fields: compact fields can show a label that rests inside and floats into the outline, without changing their height.
- `--color-state-layer-hover`, `--color-state-layer-pressed` and `--row-padding-inline` tokens.

### Documentation

- The loading page covers page progress, spinners, pending buttons and placeholders, with guidance on when to use each.
- The catalogue's icon search uses `SearchField`, and the compact field examples show the floating label and end action.

## 0.3.0 — 2026-10-11

The application frame and menus, so products share one sidebar and navigation.

### Added

- `AppShell`: a topbar and a collapsible navigation sidebar for a whole application.
  - The brand mark doubles as the sidebar toggle and shows the toggle icon while the sidebar area is hovered.
  - The collapsed preference persists through `storageKey`, or can be controlled.
  - A collapsed sidebar expands over the content on hover, on keyboard focus and while a popup opened from it is open.
  - Narrow viewports open the sidebar over the content; it closes after navigation, on Escape and on the backdrop.
  - `context` for an organization switcher, `title`, `actions`, and `dividers` for the separator lines.
  - `useAppShell()` and `AppShellSkeleton`, the matching loading frame.
- `NavigationItem` follows a compact `AppShell` sidebar automatically, showing its icon with the label as accessible name.
- `Menu`, `MenuHeader`, `MenuItem` (actions and LinkProvider destinations) and `MenuSeparator`.
- `OrganizationMenu`: the active organization in the shell's context area, switching between organizations and offering to create one; shared by every product.
- Subtle motion across the library:
  - controls settle slightly while pressed;
  - dialogs and side panels rise or slide in over a fading backdrop;
  - menus, select options and tooltips grow from their trigger;
  - toasts arrive from their screen edge;
  - disclosure content, avatar pictures, checkbox marks and field end actions ease in;
  - skeletons pulse.
- `--motion-duration-slow`, `--motion-ease-enter` and `--motion-ease-exit` tokens. Reduced-motion preferences keep only opacity changes.

### Fixed

- A quick click on the `AppShell` sidebar toggle is no longer lost while a collapsed sidebar expands. The topbar keeps a fixed row, so context content squeezed by the animation cannot grow the row and move the toggle away from the pointer.
- Content after `Tabs` moves once when the tab changes, instead of jumping when the outgoing panel's fade ends. The outgoing panel fades out of flow, so a click right after switching tabs lands where it was aimed.

### Documentation

- New pages for the application shell and menus, with catalogue previews.

## 0.2.0 — 2026-10-11

Foundations found missing while adopting envUI in Platform, the first product to use it.

### Breaking changes

- The content and rich-text dependencies (Shiki, react-markdown, remark-gfm, marked and Tiptap) are optional peer dependencies. Applications that import `@envsemble/envui/content` or `@envsemble/envui/rich-text` install them; applications using only the main entry no longer download them.
- Secondary buttons on row fills (grouped rows, row-tone cards and card action strips) shift from the fill by the control lightness rule instead of using the row color, so they stay visible.
- Toast messages wrap to three lines within 28 rem instead of truncating to one line.

### Added

- `ThemePreferenceProvider`, `useThemePreference` and `ThemeToggle`: a stored light, dark or system preference that themes the document root, so the page background, native controls and other libraries' portals match.
- `createThemeBootstrapScript` from the new `@envsemble/envui/theme-bootstrap` entry: an inline startup script that applies the saved theme before the first paint.
- `LinkProvider`: Button, Link, NavigationItem, Card and DirectionLink destinations render through the application's router link, without a router dependency in envUI.
- `Input` `startIcon`, `endAction` and `compact`; compact fields match the button height for toolbars.
- `SearchField`: a compact search input with a search icon and a clear action; Escape also clears.
- `Dialog` `pending`: Escape, outside presses and the built-in close button cannot dismiss the dialog while work is in progress.
- `EmptyState` `tone="error"` for content that failed to load.
- `Text` `variant="display"` for page heroes.
- `Tooltip`, `Avatar` (with the default person picture or initials as fallback, and `getInitials`), `Meter` and `Progress`.

### Documentation

- New pages for tooltips, avatars, and meters and progress; theme preference, router links and optional dependencies in setup; source mode and checks while linked in local development.

## 0.1.0 — 2026-10-10

The first published release of envUI: a private React 19 component library with light and dark themes, an offline catalogue and packaged agent skills.

### Foundations

- `Theme` and `useTheme` for scoped light and dark themes. The design tokens give each component family its own color roles: surfaces, rows, buttons, navigation, form controls and feedback. Hover and pressed shades are derived from each base color.
- Local Inter, the official Material Symbols Rounded icons as React wrappers, and envUI branding (`EnvUILogo`, `BrandLogo`, lockups and favicons).
- Responsive layouts, and a 2.75 rem minimum touch target on coarse pointers with no consumer overrides.
- Layout and text: `Stack`, `ActionGroup` (both with semantic tags), token-based `Text`, and `Surface` for backgrounds, padding and corners.

### Actions and navigation

- `Button`:
  - variants, including a borderless `text` variant;
  - native links through `href`;
  - one shared control icon size.
- `IconButton`.
- `Link`: an inline link built on `Button`, underlined by default.
- `ButtonGroup`: connected horizontal or vertical button rows.
- `NavigationItem`:
  - selected and unselected icon variants;
  - `compact` labels;
  - `iconOnly` for collapsed sidebars.
- `DirectionLink` and `DirectionLinks`: previous/next destinations that wrap on narrow screens.
- `Tabs`: keyboard selection, animated panels, and `renderList` to place the tab list inside other layouts.

### Content

- `Card` covers plain, interactive and action-strip cards. `ClickableCard` and `ActionCard` remain as wrappers for compatibility.
- `FeatureCard`, `GroupedRows`/`Row` with connected corners, `DisclosureNote` and `InfoChip`.

### Forms

- `Input` and `Textarea` come in two appearances:
  - outlined, with floating labels;
  - plain, with an underline.
- They share labels, hints and errors. Validation shows as a red border, or a red underline on plain fields. Focus shows as a single blue border.
- `Textarea` sizes itself to its content, scrolls when fixed, and has a subtle full-width resize edge.
- `Select`, `Checkbox`, `Switch`, `Radio` and `RadioGroup`.
- `ColorPicker`: a color area, a hue slider and a HEX field.
- Form controls reset with their native form.

### Feedback

- `Dialog` and `DialogClose`.
- Managed toasts through `ToastProvider` and `useToast`:
  - top-center and bottom-right placements;
  - the newest notices stay visible, and older ones hide behind a count;
  - explicit durations, including `Infinity`;
  - timers pause while hidden and while focused.
- Independent manual `Toast`.
- `EmptyState`, `Skeleton` and `LoadingState`.

### Optional entries

- `@envsemble/envui/content`:
  - `Code` and `CodeBlock`, with lazy Shiki highlighting using GitHub Dark Default in both themes; `CodeBlock` accepts an explicit theme;
  - `Markdown`, with GitHub-flavored Markdown, envUI prose and application-owned links;
  - `MarkdownEditor`, with Write/Preview, formatting, shared undo/redo and link insertion through an application picker.
- `@envsemble/envui/rich-text`: `RichTextEditor`, the read-only `RichText` and `createRichTextExtensions`.
  - Built on Tiptap, with Markdown values and configurable reference lookup.
  - Includes slash commands, with uploads and navigation handled by the application.
- Content and rich text are separate entry points, so applications that use only the basic components don't load parsing or highlighting code.

### Documentation

- An offline catalogue (`envUI.html`), built from the library's own components, is attached to each release.
- The packaged `envui-use` and `envui-migrate` agent skills.
