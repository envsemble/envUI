# Changelog

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
