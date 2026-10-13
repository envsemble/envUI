# Changelog

## Unreleased

Components for document-centred desktop applications: a file tree, editor tabs, quick open, context menus and a resizable sidebar, with badges, notices, tables and other everyday pieces.

### Added

- `AppShell` `sidebarContent`: the application's own content below the navigation, which fills the remaining sidebar height and scrolls itself; hidden while the sidebar is compact.
- `AppShell` `resizable`: the expanded sidebar's edge becomes a resize handle for the pointer and the keyboard (<kbd>←</kbd> and <kbd>→</kbd> by 16 px, 48 px with <kbd>Shift</kbd>, <kbd>Home</kbd> and <kbd>End</kbd>), between `sidebarMinWidth` and `sidebarMaxWidth` (12 and 32 rem by default). `sidebarWidth` and `onSidebarWidthChange` control the width; otherwise it persists under `storageKey`. `AppShellSkeleton` accepts the same `resizable` and bounds.
- `ContextMenu`: actions for an area on right click, long press, the <kbd>Menu</kbd> key and <kbd>Shift</kbd>+<kbd>F10</kbd>, with the target element passed to its content; `open`, `onOpenChange` and `anchorPoint` open it programmatically.
- `MenuItem` `description`, `shortcut` (shown as `Kbd` keys) and `trailing`; `MenuGroup`, `MenuRadioGroup`, `MenuRadioItem` and `MenuCheckboxItem`.
- `Tree`: a virtualized WAI-ARIA tree for thousands of rows, with keyboard navigation, type-ahead, preview and open callbacks, a context menu and two densities.
- `DocumentTabs`: closable editor-style tabs with preview tabs, pinning, closing with <kbd>Delete</kbd> or a middle click, and a strip that scrolls sideways. However the focused tab closes, focus moves to the tab that becomes active.
- `CommandPalette`: a quick-open dialog near the top of the window, on the dialog surface, with grouped options rounded like `Select` options, keyboard highlight, modifier selection and key `hints` shown as `Kbd` keys.
- `SegmentedControl`: one choice among a few options on a pill rail, with counts and icons.
- `Badge` in six tones and three variants, `Counter`, and `NavigationItem` `trailing` content (a dot while icon-only). In a button, such as a selected tab, a counter or badge takes the button's text color as an outlined pill, so it keeps the button's contrast in both themes.
- Status tone tokens `--color-tone-neutral`, `--color-tone-accent`, `--color-tone-success`, `--color-tone-warning`, `--color-tone-danger`, `--color-tone-done` and `--color-on-tone`, with at least 4.5:1 contrast on the canvas, panes and rows in both themes.
- `Notice`: an inline banner in four tones with an action, a round dismiss button in its tone and `announce` for alerts.
- `Popover`: a floating panel with a title, two widths and a close function for its content.
- `Table` with `TableHead`, `TableBody`, `TableRow`, `TableHeaderCell` and `TableCell`: density, where compact tables give the controls in their cells the compact height, sticky headers, numeric cells and a focusable scroll region, which keeps content positioned in cells, such as visually hidden text, from widening the page.
- `Breadcrumbs` and `Kbd`.
- `Markdown` `components`, `remarkPlugins` and `rehypePlugins`; application overrides win and attributes such as heading ids reach the elements. Raw HTML is dropped before any rehype plugin runs, so it stays ignored, except keys written as `<kbd>Ctrl</kbd>`, which render as `Kbd`.
- `Dialog` `size="wide"` (about 44 rem), also for right panels, and `placement="top"`.
- `Menu` and `ContextMenu` `density="compact"`: the desktop dropdown for dense surfaces. It takes the raised popup of `Popover` and `Select`, with small corners, 1.75 rem rows that highlight on hover and keyboard focus, labels that line up whether a row has a check mark, an icon or neither, shortcuts as small muted `Kbd` keys, hairline separators and small group labels. A compact `Tree` opens a compact context menu.
- `MenuSubmenu`: a row that opens a nested menu beside it, on hover and with <kbd>→</kbd>, <kbd>Enter</kbd> or <kbd>Space</kbd>, closing with <kbd>←</kbd> and <kbd>Esc</kbd>. Submenus nest, flip at the window edge, line their first row up with the row that opened them and take the density and theme of their menu. `open`, `defaultOpen` and `onOpenChange` control them, for example to load their items as they open.
- `Menubar` and `MenubarMenu`: an application menubar of compact text triggers, each opening a compact menu; once one is open, hovering another trigger or <kbd>←</kbd> and <kbd>→</kbd> switch menus, and opening one neither locks scrolling nor shifts the page. After a command, focus returns to where it was before the menubar took it, which `onOpenChange` reports as `previousFocus` for commands such as Copy. `accessKeys` adds desktop access keys: holding <kbd>Alt</kbd> underlines them, <kbd>Alt</kbd> with a menu's letter opens it, and <kbd>Alt</kbd> alone moves focus to the menubar and back.
- `Select` `density="compact"`: a compact trigger, and the compact menu's popup with a check mark on the selected option.
- `AppShell` and `AppShellSkeleton` `topbar="full"`: one row across the window, independent of the sidebar: the toggle, the context at its natural width, the title and the actions at the end. The sidebar then fits its navigation and sidebar content, and narrow windows give the context the room it needs.
- `AppShell` and `AppShellSkeleton` `titleBar`: the topbar is the window's title bar in installed web apps and desktop shells that draw their own (the Window Controls Overlay). It takes the title bar area's height, at least `--title-bar-height` so a zoomed page keeps room for its controls, and leaves room for the window controls through `env(titlebar-area-*)`. It drags the window from empty space while its controls stay clickable, and makes its controls compact; `--topbar-height` follows it. The shell fills the window and its content area scrolls below the title bar, with a stable scrollbar gutter, so the window controls never cover a scrollbar; the keyboard scrolls it as it would the document, where the browser does not already, with quick presses adding up and held keys repeating.
- `--app-sticky-top` on `AppShell`: the offset for content that sticks with `position: sticky`, the topbar height while the document scrolls and 0 in a title-bar shell's content area. `useAppShell().getScrollElement()` returns the element that scrolls the page content, for reading and restoring scroll positions; it changes once the shell is attached, so effects that depend on it run again with a title-bar shell's content area or a frame's scrolling element, and every copy of it returns the current element.
- `TitleBar`: the same window title bar without the shell, with start, centered and end content, and the `--title-bar-height` token (2.5 rem), the least height of a title bar and its height where the window reports no title bar area.
- `WindowFrame`: a window without the shell, such as a start page, filled by a title bar on top and content that scrolls below it, with a stable scrollbar gutter; `scrollRef` gives the scrolling element. Like a title-bar shell's content area, the keyboard scrolls it as it would the document.
- `Tabs` `fill`: the selected panel takes the height left below the list, for content that fills a region such as a diagram canvas.
- `Surface` `density="compact"`: the controls inside take the compact control height, for toolbars over dense content.
- `Code` `appearance="subtle"` and `Markdown` `inlineCode="subtle"`: inline code that follows the app theme as a quiet chip, for prose dense with identifiers.
- `TableHeaderCell` `sortDirection` and `onSort`: a sortable header is a button across its cell with an arrow for the order, `aria-sort` on the header, and a name that says what pressing it does, such as "Report sort ascending" (`sortLabel` replaces it). The application sorts the rows.
- `Table` `resizableColumns`, with `columnWidths` or `defaultColumnWidths` in percent of the table width, `onColumnWidthsChange` and `minColumnWidths`: a handle at the end of each header cell moves the boundary to the next column without changing the table's width, by dragging or with <kbd>←</kbd> and <kbd>→</kbd> by 1 percent (5 with <kbd>Shift</kbd>), <kbd>Home</kbd> and <kbd>End</kbd>. Double-clicking a handle restores the starting widths. Widths alone fix the columns through a `colgroup`.
- `TableRow` `selected`: `aria-selected` and the navigation selection color, with a bar at the start of the row.
- `Table` `narrowLayout="stack"`: when the table's region is narrower than `stackBelow` (any CSS length, 36 rem by default), each body row becomes a block on the table surface, titled by its first cell, with each `TableCell` `label` before its value in a column as wide as the longest label, up to 10 rem; long values wrap. The header row is visually hidden, and explicit roles keep the table's semantics. The region then has `data-stacked`, and `onStackedChange` reports each change, so an application can offer its own sort control while the header row is hidden.
- `Input` `prefix` and `suffix`: short, non-interactive text inside the field before or after the value, such as the start of an address or a unit. They appear with the floating label once the field has focus or a value, are read after the label, work with `compact`, `startIcon` and `endAction`, and a long prefix is cut short with an ellipsis.
- `Slider`: a value in a range with a visible label, the current value as an output linked to it (`formatValue`, such as "40%", also for assistive technology), `min`, `max`, `step` and `largeStep`, `hint`, `disabled`, and `name` and `form` for native forms, which reset an uncontrolled slider. The arrow keys move by a step, <kbd>Page Up</kbd> and <kbd>Page Down</kbd> by a large step, <kbd>Home</kbd> and <kbd>End</kbd> to the ends; `onValueCommit` reports the value once a change is complete. The thumb grows on touch screens.
- `Composer`: the message field of a conversation, on the raised popup surface. It grows with its text from `minRows` to `maxRows`, then scrolls. <kbd>Enter</kbd> submits through `onSubmit`, or without it submits the field's form, <kbd>Shift</kbd>+<kbd>Enter</kbd> starts a new line and an input method's composition never submits. The round send button stays unavailable while the text is blank and becomes a stop button that calls `onStop` while `running`; `start` holds content such as an attach button, lined up with the field's text, and `footer` describes the field.
- `Message` and `MessageList`: conversation entries in a polite `log`, which reports `aria-busy` through `busy` while a reply streams in or earlier messages load. Messages `from="self"` are compact bubbles at the inline end in the row tone; messages from others are full-width content without a bubble, so long formatted answers read well. `author`, `meta`, small `actions` below the message, and a `sending` or `failed` `status` shown with an icon and text (`statusLabel`).
- `SplitView`: two panes side by side with a divider that resizes them, a focusable `separator` in a gutter. Drag it, or press <kbd>←</kbd> and <kbd>→</kbd> (2 percent, 10 with <kbd>Shift</kbd>), <kbd>Home</kbd> and <kbd>End</kbd>; a double click returns to `defaultSize`. `size` and `onSizeChange` give the start pane's share in percent between `minSize` and `maxSize`, `storageKey` keeps the chosen share, and another key brings the share stored under it, or the default; below the `stackBelow` width of the split view itself the panes stack without the divider; the split view then has `data-stacked`, and `onStackedChange` reports each change.
- `Stat` and `StatGroup`: labelled key figures for dashboards. A stat shows its `label`, a large `value` in tabular digits (an `AnimatedNumber` works too), an optional muted `detail` and a `trend` with a direction icon and text in its tone: up is success, down danger and flat neutral unless `tone` says otherwise. `StatGroup` puts stats on one pane in as many even columns as fit, wrapping as space runs out; a phone keeps two columns, with figures that shrink to stay on one line. A group named with `aria-label` or `aria-labelledby` is exposed as a group.
- `FileDropzone`: a dashed drop target for files with an icon, a label and a description, which opens the file picker when pressed or with <kbd>Enter</kbd> and <kbd>Space</kbd>. Files dragged over it show a solid blue outline; `accept` filters dropped and chosen files, with `onFiles` for the files it takes and `onReject` for the others and, without `multiple`, those after the first. `pending` shows a spinner and takes no new files, `error` colors the outline and is linked to the zone, `compact` makes it one row, `name` submits the files with native forms, or `files` when the application keeps them, such as after a Remove action, and `inputRef` opens the picker from elsewhere, such as a Replace button beside the application's own preview. The same file can be chosen again.
- `Heatmap`: a calendar of daily values with weeks as columns and weekdays as rows, in `levels` color steps mixed from a `tone` into the canvas, or steps that start at `thresholds`, such as quantiles to color by rank, with month and weekday names and a Less–More legend. Every day is a named grid cell; the grid is one tab stop where <kbd>↑</kbd> and <kbd>↓</kbd> move by day, <kbd>←</kbd> and <kbd>→</kbd> by week, <kbd>Home</kbd> and <kbd>End</kbd> along the weekday, <kbd>Page Up</kbd> and <kbd>Page Down</kbd> to the ends of the week and <kbd>Ctrl</kbd>+<kbd>Home</kbd> and <kbd>Ctrl</kbd>+<kbd>End</kbd> to the range's ends. On touch screens the days are 24 px apart. A single `Tooltip`-styled popup follows the hovered, focused or tapped day, so a year renders without a portal per day; it closes when the pointer leaves the days, and a focused day's when the pointer moves elsewhere, and it never takes the pointer, so it never blocks a press on what lies under it. Narrow containers scroll the weeks, starting at the most recent. `startDate`, `endDate`, `maxValue`, `weekStart`, `formatValue`, `formatDate`, `formatTooltip`, `monthLabels`, `weekdayLabels`, `lessLabel` and `moreLabel` adjust and localize it.
- `ConfirmButton` `icon` with a required `aria-label`: a round icon-only button at rest, like `IconButton`, that grows when armed to show the confirm label beside its icon, so the consequence is still named; focus stays on it.
- `Tooltip` `side` takes `inline-start` and `inline-end`, which follow the text direction.

### Changed

- A document root themed through `ThemePreferenceProvider` or the bootstrap script keeps the browser's font size, so 1 rem is 16 px by default instead of 15 px and envUI renders at its designed size, no longer a sixteenth smaller. The document body takes the body type, at zero specificity, so an application's own `body` rule wins. Migration: an application's own rem-based CSS on such a root grows by about 7%; multiply its rem values by 0.9375 to keep their earlier size.
- `ThemePreferenceProvider` follows theme changes made in other windows and tabs of the same origin.
- `Select`'s outlined trigger is the outlined `Button` style. The open list takes the `Popover` surface corners, with rounded options inset by its padding.
- `Dialog` shares the `Popover` look: the raised popup color and a hairline border. In the dark theme dialogs keep the pane color, through the new `--color-dialog` token. The title and description sit together above the content.
- The toast stack's count of hidden notices is a `Counter`. A dismissed notice steps out of the stack at once and fades where it was, so dismissing several in a row moves the stack once each, without jerking or flashing a scrollbar; a notice revealed from the hidden ones fades in.
- A collapsed `AppShell` sidebar no longer treats expanded tree rows as open popups, and stays expanded while a context menu opened from it is open.
- On narrow viewports the `AppShell` sidebar opens as a drawer at least 20 rem wide, or the window less 3 rem, instead of the measured navigation width, so `sidebarContent` such as a list of recent documents has room.
- An icon-only `NavigationItem` shows its label in a `Tooltip` at its inline end on hover and keyboard focus instead of a native title, which doubled an application's own tooltip; a disabled one shows it on hover. An application `Tooltip` around the item replaces it.
- A `Dialog` panel with `placement="right"` takes the whole width of a narrow window, such as a phone's, instead of leaving a sliver of the page beside it, with its content clear of the safe areas on both sides.

### Fixed

- `ThemePreferenceProvider` gives every `<meta name="theme-color">` the canvas color of the theme in use, including tags written for a system color scheme with `media`, instead of only the first tag.
- Text entered in `Input`, `Textarea`, `SearchField`, the `CommandPalette` search and the rich text and Markdown editors takes `--control-font-size`, 1 rem on touch screens, so mobile browsers no longer zoom the page when such a field gets focus. Resting labels, prefixes and suffixes match it.
- `Card` and `ActionCard` `meta` sits at the end of the heading row, also in right-to-left text, instead of right after the heading, where the text margin reset kept it.
- A `Textarea` with `sizing="content"` and `rows` starts at that many lines, such as one for a short reply, instead of at least 7.5 rem; without `rows` it still starts at 7.5 rem.
- Icon-only buttons keep their square size where their container is squeezed narrower, such as a slot beside long text in a flex row, instead of shrinking to nothing.

### Documentation

- New pages for the tree, document tabs, breadcrumbs, command palette, segmented controls, badges and counters, notices, popovers, tables and keyboard keys. Colors list the status tones.
- The application shell page shows the frame alone, resizable, and a full-width topbar as a window title bar, with `TitleBar` in a `WindowFrame` on its own. The menus page shows the account and organization menus, and the building blocks for the application's own menus, compact menus and submenus included.
- New page for the menubar.
- New pages for the composer, messages, split views, stats and heatmaps.
- Keys in the documentation and the catalogue show as `Kbd` keys.
- The browser suite's ports can be changed with `ENVUI_CATALOGUE_PORT` and `ENVUI_FIXTURE_PORT`.
- The tables page shows sorting, resizable columns, selected rows and stacked rows.
- The text fields page shows an input's prefix and suffix.
- New pages for sliders and file drop zones; the drop zone page shows a chosen image with actions to replace or remove it.
- Spacing & shape lists the spacing, corner and control size tokens by name, for application CSS that arranges its own frames with the components.

## 0.4.0 — 2026-10-11

Clearer contrast in both themes, more ways to show loading, and refinements from reviewing the catalogue and an application built with it.

### Changed

- Fills are translucent layers of the text color instead of fixed grays, so they stay distinct on panes, rows, cards and dialogs while keeping their tone on the canvas.
  - `--color-secondary-action`, `--color-chip`, `--color-switch-off`, `--color-skeleton-base` and meter tracks use the new `--color-fill` (6% in light, 12.5% in dark), with `--color-fill-hover` and `--color-fill-pressed`.
  - Secondary buttons in dialogs and side panels, tab rails on panes, and chips and switches on rows no longer blend into their surface.
  - The 0.2.0 rule that shifted secondary buttons on row fills is replaced by the translucent fill.
- Hover and press on cards, rows, select options, radio rows and menu items shift 6 and 10 points of lightness, up from 2 and 4.
- A floated field label hides only the outline behind it, so it no longer shows the field color as a box above the outline on panes and dialogs.
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
- A Select's open list is a raised popup in its own color (`--color-popup`) with a hairline border (`--color-popup-border`). It no longer blends with dialogs and panes of the same tone. Options show only hover, press and selection; in dark, the selected option has a blue tint.

### Added

- `AvatarButton`: a person's avatar as a button, typically the account menu trigger. A halo shows hover, press and an open menu, and the tooltip shows the name and an optional detail such as the e-mail address.
- `LoadingBar`: page-level progress that appears after a short delay, creeps forward while work continues, then completes and fades out. `AppShell`'s `loading` prop shows it along the topbar's bottom edge.
- `Spinner`: work of unknown length in a small area, in small, standard and large sizes.
- `pending` on `Button` and `IconButton`: a spinner replaces the content at the same size, and the button reports busy and ignores activation.
- `showLabel` on text fields: compact fields can show a label that rests inside and floats into the outline, without changing their height.
- `--color-state-layer-hover`, `--color-state-layer-pressed` and `--row-padding-inline` tokens.
- `ConfirmButton`: an action that takes effect at once is confirmed in place. The first press arms the button and names the consequence, and the second press runs it. A double click only arms it, and the arming ends after a few seconds, when focus leaves and on Escape.
- `AnimatedNumber`: a count rolls up as it grows and down as it shrinks, and fades with reduced motion.
- `OrganizationMenu` organizations accept a `detail`, such as the person's role, shown muted after the name.
- `headingLevel` on `EmptyState`, for an empty or error state that is the whole page.
- `variant` on `Select`: secondary (default) is the filled pill, and outlined a bordered pill for panes, dialogs, rows and toolbars.

### Documentation

- The loading page covers page progress, spinners, pending buttons and placeholders, with guidance on when to use each.
- The catalogue's icon search uses `SearchField`, and the compact field examples show the floating label and end action.
- The dialogs page shows dialogs with forms (fields and validation, a choice, a typed confirmation), and its pending example uses a pending button.
- The buttons page asks labels to say what will happen, with examples of a live count and confirming in place. A new page covers animated numbers.

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

Foundations found missing while adopting envUI in the first application to use it.

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
  - `Code` and `CodeBlock`, with lazy Shiki highlighting in the dark code theme in both app themes; `CodeBlock` accepts an explicit theme;
  - `Markdown`, with CommonMark plus tables, task lists, strikethrough, automatic links and footnotes, envUI prose and application-owned links;
  - `MarkdownEditor`, with Write/Preview, formatting, shared undo/redo and link insertion through an application picker.
- `@envsemble/envui/rich-text`: `RichTextEditor`, the read-only `RichText` and `createRichTextExtensions`.
  - Built on Tiptap, with Markdown values and configurable reference lookup.
  - Includes slash commands, with uploads and navigation handled by the application.
- Content and rich text are separate entry points, so applications that use only the basic components don't load parsing or highlighting code.

### Documentation

- An offline catalogue (`envUI.html`), built from the library's own components, is attached to each release.
- The packaged `envui-use` and `envui-migrate` agent skills.
