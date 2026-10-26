# Release notes

<!--
The highlights on the Docs' Changelog page: one entry per release of @envsemble/envui, newest
first, each with up to five highlights in plain sentences and a short list of breaking changes. Each
breaking change links to the section of the migration guide that covers it, /docs/migration#…, or
for a 0.x release to its entry in the full changelog below them, /docs/changelog#….
scripts/site/ReleaseNotes.ts reads and checks this file; the full changelog is packages/ui/CHANGELOG.md.

## <version> — <YYYY-MM-DD, or Upcoming>
- A highlight.
### Breaking changes
- A change, [with a link to its migration](/docs/migration#section).
-->

## 1.0.0-prerelease.4 — 2026-10-25

- Every component, pattern and foundation is one page of Markdown, which the catalogue shows to people, the Docs to developers and the package to coding agents; each page lists its contents beside it, and links to its counterpart in the other part.
- One prompt sets envUI up with a coding agent: `Set up envUI in my app: envui.envsemble.com/SKILL.md`, on the Docs' home, leads it to the setup skill the site hosts.
- Dev mode opens in a tab of its own, rebuilt on today's envUI, and its guide in the Docs shows it at work.
- Drawer nests destinations in sections that open and close, and TableOfContents marks the section the reader is in with a wave of dashes.
- Slider fills from end to end, and stretches like a rubber band when dragged past either end.

### Breaking changes

- The `envui` command, its MCP server, the packaged skills and the agent plugin are gone; [the setup prompt and the `AGENTS.md` pointer replace them](/docs/migration#templates-and-agent-tools).

## 1.0.0-prerelease.3 — 2026-10-25

- The website is two parts: the catalogue introduces envUI with its components, patterns and foundations, and the Docs, under /docs, are the developer reference, with each component's props, part names and changelog.
- Every component takes public color properties, such as `--env-button-container`, to color one instance, and its hover, focus and press follow the colors you set.
- ColorPicker is rebuilt on React Aria in its own entry, `@envsemble/envui/color`, compact with hex, RGB and HSL fields, alpha, copy and an eyedropper; the pickers keep their footer actions on one line, and the editors draw their formatting buttons as one Toolbar in groups.
- A calmer look: Slider is a field, SegmentedControl is connected segments unlike Tabs, fields take the background of what they sit on, the full corner is capped so tall elements become rounded rectangles, and skeletons shimmer.
- Avatars take a pastel palette and can show as selected, AvatarGroup spreads along an arch on hover, Drawer and side Sheets resize by their edge with `resizable`, and PanelDock is marked experimental.

### Breaking changes

- ColorPicker and ColorSwatch are no longer in the main entry; [import them from `@envsemble/envui/color`](/docs/migration#color-picker-and-swatches).
- SearchTrigger is [a pattern of a Button with the shortcut's keys in its `end` slot](/docs/migration#folded-components-and-patterns), not a component.
- The avatar hues are [named for their colors](/docs/migration#content-and-display): `teal` is `seafoam`, and so on, in `hue`, `data-hue` and the avatar tokens.
- The underline variant of the text fields and editors is [gone](/docs/migration#fields-and-choice-controls).
- The component tokens of List rows, Alert and Toast are [color properties](/docs/migration#color-properties-and-state-layers), which don't inherit: set them on the component itself.

## 1.0.0-prerelease.1 — 2026-10-23

- Scaffold, TopBar and the navigation forms, Bar, Rail and Drawer, lay out an application's screen by the width of its window.
- Row, Column, Grid and Box are the layout primitives, and Panes shows two panes side by side.
- Dev mode, `@envsemble/envui/dev`, shows a page's layout and its problems while you develop.
- Any surface can show itself as a skeleton while it loads, with `skeleton`.
- envUI draws no shadows and no dividing lines between regions: surfaces stand apart by their fill.

### Breaking changes

- AppShell, Sidebar and NavList are gone; [build the app frame from Scaffold and the navigation forms](/docs/migration#the-app-frame).
- Stack is [Row or Column](/docs/migration#layout-primitives), and SplitPane and ListDetail are [Panes](/docs/migration#split-panes).
- The Skeleton component is gone; [surfaces take `skeleton`](/docs/migration#skeletons).
- EmptyState, Stat, OrganizationSwitcher, WindowFrame and AccountMenu are [patterns now](/docs/migration#folded-components-and-patterns).
- The sliding panel is [Sheet](/docs/migration#overlays-and-feedback), and Drawer names the navigation drawer.

## 1.0.0-prerelease.0 — 2026-10-18

- Components, parts and classes take the established names envUI keeps for 1.0, and compound components are namespaces of parts, such as `Menu.Item`.
- Colors come from a palette with contrast built in, and every theme passes the contrast gate, including two new high-contrast themes.
- An app scale: `comfortable` for most applications and `compact` for dense desktop tools.
- Buttons take a `variant` for their emphasis and a `tone` for their meaning.
- The codemods, `@envsemble/envui-codemods`, and the lint rules make most of the upgrade from 0.x.

### Breaking changes

- Components, parts and classes are [renamed](/docs/migration#renamed-components-parts-and-pages), and nothing is exported under its old name.
- Every token takes the [`--env-` prefix](/docs/migration#tokens), and envUI's CSS moves into [cascade layers](/docs/migration#cascade-layers).
- `density`, `compact` and size-as-density props give way to [the app scale](/docs/migration#scale-and-density).
- `as` is [`render`](/docs/migration#variants-tones-and-render), and buttons take the new variants and tones.

## 0.7.0 — 2026-10-15

- Code diffs, in the new `@envsemble/envui/diff` entry.
- Centred empty states, compact tabs, diff counts, ratings and color swatches.
- A soft blue primary action in the dark theme.

### Breaking changes

- [SplitView is removed](/docs/changelog#070--2026-10-15), with its divider.
- [Code's `appearance` and CodeBlock's `theme` are removed](/docs/changelog#070--2026-10-15): code follows the app theme.

## 0.6.0 — 2026-10-15

- Comboboxes, date and time fields, calendars and pagination.
- Docked panels for work that sits beside a page.
- Relative times, avatar groups, copy buttons and a hover card.
- A quiet text field and a quiet button for an application's own chrome.
- A table with a sticky header no longer swallows the wheel.

## 0.5.0 — 2026-10-14

- A file tree, editor tabs, quick open and context menus for document-centred applications.
- Sortable, resizable tables, key figures and a calendar heatmap for dashboards.
- Conversation messages and a composer.
- Badges, notices, popovers, sliders and a menubar.

### Breaking changes

- [1 rem is the browser's font size again](/docs/changelog#050--2026-10-14), so envUI renders at its designed size.

## 0.4.0 — 2026-10-11

- Clearer contrast in both themes, with fills that stay distinct on any surface.
- Page progress, spinners and pending buttons for showing that work is under way.
- Buttons that confirm in place, and numbers that roll as they change.

## 0.3.0 — 2026-10-11

- The application frame, with a collapsible sidebar, and menus.
- Subtle motion across the library, which reduced motion keeps to fades.

## 0.2.0 — 2026-10-11

- A stored light, dark or system theme that applies before the first paint.
- Links through the application's own router.
- A search field, tooltips, avatars, meters and progress.

### Breaking changes

- [The content and rich text libraries are optional peers](/docs/changelog#020--2026-10-11): install them to use those entries.

## 0.1.0 — 2026-10-10

- The first release: React 19 components with light and dark themes.
- Buttons, links, tabs, cards, fields, dialogs and toasts.
- Optional entries for Markdown, code and rich text.
- Agent skills in the package.
