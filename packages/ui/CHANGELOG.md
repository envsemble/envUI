# Changelog

## 1.0.0-prerelease.0 — 2026-10-18

The first prerelease of envUI 1.0, published under the `prerelease` dist-tag; 1.0.0 follows after further changes. It brings contrast-safe themes built from design tokens, established component names, AppShell and its parts, page templates, new pickers for times and months, and documentation and tooling for people and agents alike. It breaks code written for 0.x: `@envsemble/envui-codemods` makes most of the changes, and the [migration guide](https://github.com/envsemble/envUI/blob/main/docs/migration.md) covers the rest.

### Major Changes

- Alert and EmptyState say `danger` for the status that was `error`.
  - Alert's `tone` is `info`, `success`, `warning` or `danger`, and `AlertTone` follows. Its dismiss button is a CloseButton, named Dismiss through `messages.alert.dismiss`, and Alert stays a server component.
  - EmptyState's `tone` is `neutral` or `danger`. Its modifier classes are attributes: `env-empty-state-error` is `[data-tone='danger']` and `env-empty-state-center` is `[data-align='center']`; `env-empty-copy` is `env-empty-state-description`.

  Migrate with the codemods: `envui-codemods v1-props` maps `tone="error"` to `tone="danger"` and reports an expression; `v1-classes` rewrites the classes.

  Migration guide: [Overlays and feedback](https://github.com/envsemble/envUI/blob/main/docs/migration.md#overlays-and-feedback).

- AnimatedNumber's `format`, the function that writes its value, is `formatValue`, as on Slider and CalendarHeatmap.

  Migrate with the codemods: `envui-codemods v1-props` renames `format` to `formatValue`.

  Migration guide: [Content and display](https://github.com/envsemble/envUI/blob/main/docs/migration.md#content-and-display).

- AppShell is made of parts: `AppShell.Root` lays out `AppShell.SkipLinks`, `AppShell.Header`, `AppShell.Main`, an `AppShell.Aside` and the sidebars in a grid that follows the text direction, and keeps the sidebars' state per side. The sidebars are `Sidebar.Root` with `Sidebar.Header`, `Content`, `Group`, `Footer` and `Handle`, opened and closed by `SidebarTrigger` and read with `useSidebar`; `Sidebar.Provider` gives a sidebar the same state without the frame. A sidebar collapses to a rail of icons (`collapsible="rail"`) or out of view (`offcanvas`), its rail opens over the content on hover and focus (`peek`), it docks from `dockAt` up, resizes with its handle, and below the frame's breakpoint (48 rem by default, 40 rem before) its content opens in a drawer from its side. Expanding and collapsing never remount its content.

  `persist` keeps both sidebars' docked preference and width (in rem) in localStorage, or in a cookie that the server reads with `readAppShellCookie` for `initialState`, so a server-rendered frame paints as it was left. `shortcut="mod+b"` toggles a sidebar; it is off by default. The frame publishes `--env-frame-header-block-size` and `--env-frame-sticky-top`, which replace `--env-app-topbar-block-size` and `--env-app-sticky-top`, and `useAppShell().getStickyTop()` reads the second; WindowFrame.Root publishes the same, and `useAppShell` works inside it. `titleBar` makes the header the window's title bar, on WindowFrame's title bar internals, with Main scrolling below it. `closeNarrowSidebar` is `useSidebar().dismiss()`. AppShellSkeleton is removed: the frame's parts with the new `NavList.Skeleton` inside a LoadingState are its loading state. Under a coarse pointer the trigger is 44 px and the rail grows with it.

  Migration guide: [The app frame](https://github.com/envsemble/envUI/blob/main/docs/migration.md#the-app-frame).

- An app scale: `Theme` and `ThemePreferenceProvider` take `scale`, `comfortable` (the default, today's sizes) or `compact`, about 0.8 of them with type one step smaller, for desktop productivity apps. Left out, a Theme takes the scale of the Theme around it. Theme writes it to `data-env-scale` on every boundary, nested ones and those around popups included, and `useTheme()` returns `{ theme, contrast, scale }`. `createThemeBootstrapScript({ scale: 'compact' })` puts the compact scale on the root before the first paint. Outside any Theme, a `ThemePreferenceProvider` without a `scale` or a `contrast` gives its boundary the scale and contrast the page set on the root, so the application matches the page and other libraries' portals; one that unmounts, or whose `applyToDocument` turns false, removes the scale and contrast it wrote on the root, unless the page wrote over them or another provider holds them. Use one scale per app or window, and another only on a Theme around a whole region.

  Every size is a token, with a value per scale: `--env-control-height-xs`, `-sm`, `-md` and `-lg`, `--env-row-height`, the row densities' `--env-row-padding-block-*`, `--env-control-gap`, `--env-font-size-caption` and `--env-font-size-label`, `--env-icon-size-sm`, `-md` and `-lg`, `--env-radius-lg`, `--env-field-floating-height`, `--env-row-content-height` and a tree row's paddings, `--env-tree-row-padding-block-sm`, `-md` and `-lg`, are new, and the spacing, type, corner, top bar and title bar tokens take their compact values in the compact scale. Icons keep a 1 rem floor, and borders and focus rings keep their widths. The type roles `--env-type-h1`, `--env-type-h2`, `--env-type-body` and `--env-type-body-small` are tokens now, with a custom property for each part, such as `--env-type-body-font-size`.

  Removed custom properties: `--control-height-small` and `--icon-button-size`, which `--env-control-height` replaces, `--control-height-compact`, which `--env-control-height-sm` replaces, and the `--scale` multiplier, which components no longer read. `--env-control-height` is the height of a control that sets no size; a container can set it to another control height for what it holds, as table cells do with `--env-control-height-sm`.

  Under a coarse pointer, `@media (pointer: coarse)`, controls grow to at least 2.75 rem in either scale: buttons and icon buttons, tall and wide, fields, Select, the rails of SegmentedControl and Tabs, ButtonGroup, Pagination, menubar triggers, AppShell's sidebar toggle and collapsed sidebar, a toast's dismiss button, AvatarButton, sortable table headers, and the close buttons of PanelDock chips and DocumentTabs. The control tokens keep their values; an application's own control takes `max(var(--env-control-height), var(--env-control-height-touch))` under the same query. A link in running text, a breadcrumb link, a combobox chip's remove button, an interactive AvatarGroup's avatars and a Switch's track stay smaller and rely on WCAG 2.5.8's spacing exception. The controls of a row still match, and a control's own box is its hit area, so a press always reaches the control it lands on, whatever the layout around it. Segments, tabs and the actions inside fields take presses across their control's height, within it. Rows, navigation items and table rows with an action grow to at least 2.75 rem too, and the top bar and the title bar to 3.25 rem.

  Migration guide: [Scale and density](https://github.com/envsemble/envUI/blob/main/docs/migration.md#scale-and-density).

- Avatar's `label`, a boolean that named the avatar as an image by its `name`, is `named`, as every other `label` is text. Without it, an avatar is still decorative.

  Migrate with the codemods: `envui-codemods v1-props` renames `label` to `named`, whatever its value.

  Migration guide: [Content and display](https://github.com/envsemble/envUI/blob/main/docs/migration.md#content-and-display).

- Avatar, AvatarGroup and AvatarButton take the 1.0 sizes and slot words.
  - `size` is `sm`, `md` (the default), `lg` or `xl` on Avatar and AvatarGroup, and `sm`, `md` or `lg` on AvatarButton, for `small`, `standard`, `large` and `display`; the sizes are `data-size` attributes instead of the `env-avatar-{size}` and `env-avatar-group-{size}` classes.
  - AvatarButton's `detail` is `description`. It renders through envUI's action element and takes `ref`.
  - AvatarGroup's strings come from `messages.avatarGroup`, whose `more` and `label` receive the count in the locale's digits as `number`; `formatMore` and `formatLabel` still override them. It rings its avatars through Avatar's new `--env-avatar-ring` hook.
  - Avatar's initials take the provider's locale for their capitals.

  Migrate with the codemods: `envui-codemods v1-props` maps the sizes and renames `detail`, and `v1-classes` turns the size classes into attribute selectors.

  Migration guide: [Content and display](https://github.com/envsemble/envUI/blob/main/docs/migration.md#content-and-display).

- InfoChip is a Badge, and Badge's `subtle` variant is `soft`.
  - `<InfoChip>` is `<Badge>`, a neutral soft pill: it is slightly larger, at medium weight, fully rounded and on one line. Its page joins Badge's, which shows neutral metadata, and the search finds Badge by chip, info chip, tag and metadata.
  - `variant="subtle"`, the default, is `soft`.
  - A badge, counter badge or diff stat inside a control takes its colors from custom properties the control sets on its own element: `--env-badge-fg`, `-bg` and `-border` (a border shorthand), `--env-counter-badge-*` and `--env-diff-stat-*`. Button sets them, as it styled the badges inside it before.
  - DiffStat writes its numbers in the locale, and its name comes from `messages.diffStat.label`, which receives the counts as numbers and in the locale's digits; `formatLabel` still overrides it.

  Migrate with the codemods: `envui-codemods v1-names` renames InfoChip and InfoChipProps, `v1-props` drops `variant="subtle"`, and `v1-classes` renames `env-info-chip`.

  Migration guide: [Content and display](https://github.com/envsemble/envUI/blob/main/docs/migration.md#content-and-display).

- Buttons take a `variant` for their emphasis and a `tone` for their meaning. `variant` is `primary`, `secondary`, `outline`, `ghost` or `text`, and `tone` is `neutral`, the default, `accent` or `danger`, in the designed pairs: a primary button takes any tone, outline, ghost and text buttons take neutral or danger, and a secondary button is neutral. This applies to Button, IconButton, ConfirmButton, CopyButton, DialogClose, ThemeToggle and Pagination.
  - `variant="important"` is `variant="primary" tone="accent"`, with the same square corners and fill.
  - `variant="destructive"` is `variant="primary" tone="danger"`.
  - `variant="outlined"` is `variant="outline"`, and `variant="quiet"` is `variant="ghost"`.
  - New: outline, ghost and text buttons in the danger tone, which take the danger color; `fullWidth`, which makes a labelled button as wide as its container; and `ButtonTone` and `ButtonEmphasisProps`.
  - A button without a `variant` takes the one its container gives, such as `ghost` inside a Toolbar, where that variant has the button's tone (a `tone="accent"` Button stays primary), and else primary; IconButton and CopyButton secondary, ConfirmButton outline (secondary when icon-only).
  - Only the designed pairs type-check, also on IconButton, ConfirmButton and CopyButton, which add `IconButtonEmphasisProps`. A pair outside them, which only code past the types can ask for, renders neutral, and a development build reports it.
  - The modifier classes become attributes on `.env-button`: `env-button-primary` is `[data-variant='primary'][data-tone='neutral']`, `env-button-important` `[data-variant='primary'][data-tone='accent']`, `env-button-destructive` `[data-variant='primary'][data-tone='danger']`, `env-button-secondary` `[data-variant='secondary']`, `env-button-outlined` `[data-variant='outline']`, `env-button-text` `[data-variant='text']`, `env-button-quiet` `[data-variant='ghost']` and `env-button-underlined` `[data-underline]`.

  Migrate with the codemods: `envui-codemods v1-props` rewrites each literal `variant` (an expression is reported), and `envui-codemods v1-classes` rewrites the classes in style sheets and selector strings with the specificity they had, and reports them in `className`, where the props set them now.

  Migration guide: [Variants, tones and render](https://github.com/envsemble/envUI/blob/main/docs/migration.md#variants-tones-and-render).

- ClickableCard, ActionCard and FeatureCard are one Card.
  - A card with `href` is a link and one with `onClick` a native button; `as` is gone, and `render` sets the element of a content card, such as `render={<article />}`.
  - A content card takes `title`, `meta`, `description` and `actions`, which puts its controls in a strip along the bottom; `headingLevel` sets the title's level, `h3` by default. `layout="feature"` is FeatureCard: an icon, an `h2` heading in the headline type, a description and the actions at the end, which stack in a card narrower than 38 rem. `layout`'s `content` and `action` values are gone.
  - `tone` is `background`: `row` is `muted`, the default, `pane` is `default` and `canvas` is `page`.
  - A link card's accessible name is its text: the components overview names its cards by their content, which removes the overview's label-content-name-mismatch entries.
  - The classes are `env-card` with `data-interactive`, `data-actions` and `data-layout`, and the parts `env-card-header`, `-heading`, `-meta`, `-body`, `-footer`, `-layout`, `-icon` and `-description`.

  Migrate with the codemods: `envui-codemods v1-names` renames ClickableCard and its props type; `v1-structure` turns ActionCard and FeatureCard into a Card and drops or converts Card's `as`; `v1-props` moves `tone` and drops `layout="content"` and `"action"`; `v1-classes` renames the classes. An `as` that is an expression is reported.

  Migration guide: [Content and display](https://github.com/envsemble/envUI/blob/main/docs/migration.md#content-and-display).

- Card takes its heading as `title`, as Alert, EmptyState and Dialog do, where it was `heading`; `headingLevel` still sets its level. The native `title` attribute is no longer a prop of a card.

  Migrate with the codemods: `envui-codemods v1-props` renames `heading` to `title`, and `v1-structure` keeps ActionCard's and FeatureCard's `title` as it is. Move a native `title` tooltip of a 0.x content card to an element inside it.

  Migration guide: [Content and display](https://github.com/envsemble/envUI/blob/main/docs/migration.md#content-and-display).

- CodeBlock and CodeDiff take their words from EnvUIProvider's `messages.codeBlock` and `messages.codeDiff`: the heading of a block without a label or language, the copy button's names and announcements, the name of the code region, and CodeDiff's loading name, error, its description and Retry. CodeBlock copies as CopyButton does: where the Clipboard API is unavailable it copies a selection of a hidden field, and only where that fails too does it select the code for people to copy. Its visually hidden status is `env-code-block-copy-status`, where it was `env-code-copy-status`; `v1-classes` renames it.

  Migration guide: [Shell, dock, editors and code](https://github.com/envsemble/envUI/blob/main/docs/migration.md#shell-dock-editors-and-code).

- ColorPicker's color area and hue are envUI's own, the hue on Base UI's Slider, and the package no longer depends on react-colorful. The look stays; the `.react-colorful` classes are gone, and envUI's style sheet declares nothing `!important`. The area and the hue are named after the picker's label, such as "Accent color saturation and brightness" and "Accent color hue", by EnvUIProvider's `messages.colorPicker.area` and `.hue`, functions of `{ label }`; the area's value comes from `.areaValue`, and the hue's is in degrees, both in the provider's locale; the area moves by 1 % per arrow key and 10 % with Shift, and the hue by one degree, or 18 with Shift. `ref` reaches the HEX field.

  Migration guide: [Fields and choice controls](https://github.com/envsemble/envUI/blob/main/docs/migration.md#fields-and-choice-controls).

- A Combobox option takes its content before the label, such as an Avatar, as `start`, as List.Item does, where it was `leading`.

  Migrate with the codemods: `envui-codemods v1-props` renames `leading` to `start` in an array written in `items`, also in a group's `items`, and reports items it can't read, such as a variable; TypeScript points at the rest.

  Migration guide: [Fields and choice controls](https://github.com/envsemble/envUI/blob/main/docs/migration.md#fields-and-choice-controls).

- CommandPalette is built on Base UI's autocomplete and announces its results.
  - `query`, `onQueryChange`, `onSelect` and `closeOnSelect` are `inputValue`, `onInputValueChange`, `onAction` and `closeOnAction`; `CommandPaletteSelectOptions` is `CommandPaletteActionOptions`.
  - An item's `detail` and `trailing` are `description` and `end`, and an item can be `disabled`. Options are list rows, with the description under the label.
  - A polite status announces the number of results as they change (`messages.commandPalette.results`) and says the empty message when nothing matches.
  - `className`, `style`, `ref` and data attributes reach the palette's surface.

  Migrate with the codemods: `envui-codemods v1-props` renames the props and `v1-names` the type. Rename the items' `detail` and `trailing` by hand; the type checker reports them where the array is typed.

  Migration guide: [Overlays and feedback](https://github.com/envsemble/envUI/blob/main/docs/migration.md#overlays-and-feedback).

- Control sizes and row density replace the `density`, `compact` and size-as-density props. The `v1-props` codemod moves what it can and reports the rest.
  - **`size="sm" | "md" | "lg"`** on Button, IconButton, CopyButton, TextField, SearchField, Select, Combobox, DatePicker, SegmentedControl and Pagination: every control of a size has the same height in a scale, 2, 2.5 and 3 rem in the comfortable one. Without a size, a control takes the control height of its container, `md` by default. Tabs' `size` is its rail's: `lg`, the default, keeps today's rail, and `sm` replaces `compact`. TextField no longer takes the native `size` attribute.
  - **Row `density="xs" | "sm" | "md" | "lg"`** on Table.Root (default `md`), Tree (default `sm`) and the new one on List.Root (default `md`): it changes only the rows' block padding, never their text, icons or corners. Table's `compact` is `sm`, Tree's `compact` is `sm` and its `standard` is `md`. Compact tables no longer make their text smaller, and Tree's `md` keeps the text and icons of `sm`.
  - **Removed:** `density` on Select, Combobox, DatePicker, Surface, Menu.Root, ContextMenu and Menubar.Menu; `compact` on TextField and SearchField; `size` on NavList.Item; the `standard` and `compact` sizes of Tabs, SegmentedControl, Pagination and CopyButton, which are `md` or `lg` and `sm`. DropZone's `compact` is `size="sm"`. For a compact app or region, set `scale="compact"` on its Theme; for a small control, set `size="sm"`.
  - **Rows match:** buttons, icon buttons and fields in table cells take the small control height at every density, so a row with an action is no taller than it needs to be. Title bars, panel headers, message actions and the date picker's popup hold small controls.

  Migration guide: [Scale and density](https://github.com/envsemble/envUI/blob/main/docs/migration.md#scale-and-density).

- envUI's CSS moves into cascade layers, and every token takes the `--env-` prefix.
  - **Cascade layers.** Every rule of `styles.css` is in a layer of `env`: `env.reset`, `env.tokens`, `env.base`, `env.components` and `env.utilities`, in that order. An application's CSS outside cascade layers overrides envUI's whatever its specificity, so selectors and `!important` that only out-weighed envUI's rules can go. An application puts its resets and element styles in a layer before `env` and its own layers after it, declared once, such as `@layer reset, env, app;`: an element rule outside layers would restyle envUI's components too. The font face stays outside layers.
  - **The `--env-` prefix.** Every token is a custom property with the prefix: `--space-4` is `--env-space-4` and `--color-fg-muted` is `--env-color-fg-muted`, in Tokens.css, the token reference, the manifest and the MCP server. The application hooks take it too: `--env-line-height-body`, `--env-avatar-group-ring` and the pill corner `--env-radius-full`.
  - **The 0.7 aliases are removed.** `--color-text-muted`, `--color-row`, `--color-checkbox` and the other 0.7 names that were aliases of the semantic roles are gone; use the role that replaces each. The list item's per-theme fill and the avatar's fixed blues are component tokens now: `--env-color-list-item-bg` with `-hover` and `-pressed`, and `--env-color-avatar-bg`, `-fg` and `-figure`. `--md-sys-shape-corner-*` is retired for one radius scale, `--env-radius-{none|xs|sm|md|lg|xl|full}`, with `--env-radius-surface` and the row radii as its roles; `--radius-standard` is `--env-radius-sm` and `--radius-large` `--env-radius-lg`.
  - **Consistent color names.** A tone's edges grow from `border-{tone}-muted`, an alert's faint edge, through `border-{tone}`, an outlined badge's translucent edge, to the solid `border-accent-emphasis` and `border-danger-emphasis`, the edges of a focused and an invalid field, which were `border-accent` and `border-danger`. `border-translucent` is `border-media` and `bg-page-muted` is `bg-inset`, named for their roles, and the tones' state layers gain a resting `bg-{tone}-subtle`.
  - **Forced colors.** Under `forced-colors: active`, such as the system's contrast themes, selected, chosen, current, highlighted, checked, focused, invalid and unavailable states take system colors where a fill or shadow carried them, so they stay visible, and swatches, the color picker and calendar heatmaps keep their colors.
  - **Motion** lives in each component's style sheet; it is unchanged, with fades always and movement only without a reduced-motion preference.

  To migrate, run `npx @envsemble/envui-codemods v1-classes src`: it rewrites the old custom properties in style sheets and scripts, declared or read, to their 1.0 names, the 0.7 aliases straight to the tokens that replace them, and reports `--color-white`, `--color-canvas-dark` and the removed names with what to use instead. The migration guide lists every name. The ESLint plugin and the Stylelint config suggest the prefixed tokens.

  Migration guide: [Cascade layers](https://github.com/envsemble/envUI/blob/main/docs/migration.md#cascade-layers) and [Tokens](https://github.com/envsemble/envUI/blob/main/docs/migration.md#tokens).

- Dialog's side panel is a new component, Drawer, and Dialog takes `width`.
  - Drawer is a full-height panel at the `start` or `end` edge of the window (`side`, default `end`), which follows the text direction: it slides in from its edge, and closes with a swipe toward it on a touch screen. It takes Dialog's `title`, `description`, `actions`, `trigger`, `modal`, `disablePointerDismissal`, `pending`, `initialFocus` and `finalFocus`, and adds `aria-label` for a drawer without a visible title, `closeButton`, and `width`: `md` (24 rem, the default), `lg` (44 rem) or any CSS length. Its close button is a CloseButton. Opened by keyboard or mouse, focus starts on the first element inside that takes Tab; opened by touch, or with nothing inside that takes focus, on the drawer itself, so a field inside doesn't open the on-screen keyboard.
  - Dialog's `placement` is `center` or `top`; `placement="right"` is `<Drawer side="end">`. Dialog's `size` is `width`: `standard` is `md`, the default, and `wide` is `lg`.
  - `onOpenChange` of Dialog and Drawer receives the reason as its second argument, such as `escape-key` or `close-press`; `initialFocus` and `finalFocus` also take a function of the interaction. Dialog and DialogClose take `ref` as a prop.
  - The dialog's surface class `env-modal-pane` is `env-dialog-popup`; a drawer's is `env-drawer-popup`, and both carry `env-dialog-surface`.

  Migrate with the codemods: `envui-codemods v1-structure` turns a `<Dialog placement="right">` into a `<Drawer side="end">`, with its `size` as `width`, and reports a `placement` that is an expression; `v1-props` turns Dialog's `size` into `width`; `v1-classes` renames `env-modal-pane`.

  Migration guide: [Overlays and feedback](https://github.com/envsemble/envUI/blob/main/docs/migration.md#overlays-and-feedback).

- MarkdownEditor and RichTextEditor share their toolbar, their link dialog and their status, and take their words from EnvUIProvider's `messages` (`markdownEditor`, `richText`, `editor` for the formatting commands and `linkDialog`):
  - The toolbar is a Toolbar of buttons, each named in a tooltip instead of a native `title`; it keeps the selection in the editor and scrolls sideways where it doesn't fit. Its class is `env-editor-toolbar`, where it was `env-markdown-toolbar`, and the status line's is `env-editor-status`, where it was `env-markdown-editor-status`.
  - The link dialog says "Enter a valid URL." for an empty destination and "Enter a valid URL or relative path." for one the editor can't link to, before it inserts anything.
  - MarkdownEditor takes `ref` as a prop.

  RichTextEditor takes the field vocabulary and the field's look, in the experimental `./rich-text` entry:
  - `hint` is `description`, and `variant` is `outline` (the default), `underline` or `ghost`, as on a text area: `outlined` is `outline`, `plain` is `underline`, and `quiet`, which drew as outlined, is `ghost`. The `v1-props` codemod writes both.
  - The document sits in the field's control box, with the field border, its invalid and disabled states and the variants; a disabled editor dims the box and keeps its label at the text color. RichTextEditor takes `ref` as a prop.
  - Task items in the editor are envUI checkboxes beside their text, named by it.
  - Suggestions are the rows of a listbox in the editor, so they show above a Dialog the editor sits in, and they close as focus leaves the document, also with Tab.
  - A controlled editor applies a new `value` after React's commit, so replacing a document with references or tasks raises no `flushSync` warning.
  - References with a destination are links through `LinkProvider`.

  MarkdownEditor stays beta, and the `./rich-text` entry, RichText, RichTextEditor and `createRichTextExtensions`, is experimental.

  Migration guide: [Shell, dock, editors and code](https://github.com/envsemble/envUI/blob/main/docs/migration.md#shell-dock-editors-and-code).

- Fields and popups have one anatomy each, at the sizes of the app's scale:
  - **Fields take the control height.** TextField, SearchField, Combobox and DatePicker are pills as tall as a button of their size, whose label rests inside and floats into the outline without adding height, so they line up with buttons. The 3.5 rem field whose label floats above the value is the opt-in `variant="floating"`, for a long form on a page; plain fields and text areas keep that height. `showLabel` defaults to true, and SearchField's to false, as before; `showLabel={false}` hides a label and leaves the placeholder as the visible guidance.
  - **Menus and the popups of Select and Combobox** share the raised popup of 0.7's compact menu: small corners, a hairline edge and rows of the scale's row height, 2.25 rem, or 1.75 rem compact, with 0.875 rem labels, which highlight on hover and keyboard focus. A check mark and a medium-weight label show a select's chosen option, in place of the selection fill. OrganizationSwitcher composes the same popup.
  - **Menubar triggers** are as tall as a small control, and menus no longer have their own density.

  Migration guide: [Fields and choice controls](https://github.com/envsemble/envUI/blob/main/docs/migration.md#fields-and-choice-controls).

- Fields and choice controls take the 1.0 vocabulary, and envUI's fields are built from Field's parts:
  - `hint` is `description` on TextField, SearchField, Textarea, Select, Combobox, DatePicker, ColorPicker, Slider and MarkdownEditor.
  - The field variants are `outline`, `floating`, `underline` and `ghost`: `outlined` is `outline`, `plain` is `underline` and `quiet` is `ghost`. Select's trigger is `secondary` or `outline`.
  - Select takes `items`, of `SelectItem`, instead of `options` and `SelectOption`.
  - DatePicker's `withTime` is `granularity`, `"day"` (the default) or `"minute"`.
  - Slider's `onValueCommit` is `onValueCommitted`, as Base UI names it.
  - DropZone's `onFiles` is `onDropAccepted` and `onReject` is `onDropRejected`. The zone is named by its label and description, as its visible text is, and described by its error.
  - RadioGroup's `variant` is `orientation`: `inline` is `horizontal` and `rows` is `vertical`. Radio's `detail` is `description`. A focused radio shows the focus ring.
  - `className` and `style` style the root, the field or the label around a choice, on TextField, SearchField, Textarea, Select, Combobox, DatePicker, Checkbox, Switch and Radio, and MarkdownEditor's `env-markdown-editor`; `ref` and the other native props reach the native control. Every one takes `ref` as a prop.
  - TextField and Textarea take `onValueChange`, after the native `onChange`. An uncontrolled SearchField returns to its `defaultValue` on a native form reset.
  - A button in a field's `endAction` takes the `ghost` variant where it sets none; the buttons of a popover or menu it opens don't. Textarea's resize edge is a focusable `separator`.
  - Combobox's read-only chips no longer carry `aria-readonly`, which the input reports.
  - The built-in strings of SearchField, Textarea, Combobox, DatePicker, Calendar, ColorPicker and Composer come from EnvUIProvider's `messages`, and Calendar, DatePicker and Slider format in its `locale`.
  - Select's and Combobox's popups are the shared popup with its rows, and the classes follow the components: `env-text-input` is `env-text-field-input`, `env-text-field-well` `env-text-field-control`, `env-form-field` `env-field`, `env-field-hint` `env-field-description`; `env-dropdown-trigger`, `-options`, `-list`, `-option` and `-option-check` are `env-select-trigger`, `-popup`, `-list`, `-item` and `-item-indicator` (`env-combobox-popup` and `env-combobox-list` inside a combobox); `env-combobox-well`, `-option` and `-check` are `env-combobox-control`, `-item` and `-item-indicator`; `env-date-time-well` is `env-date-picker-control`; `env-checkbox-control` and `-mark` are `env-checkbox-input` and `-indicator`; `env-switch-control` is `env-switch-input`; `env-radio-options`, `-control` and `-detail` are `env-radio-group`, `env-radio-input` and `env-radio-description`; `env-choice-control` is `env-checkbox`, `env-switch` or `env-radio`.

  Migrate with the codemods: `v1-props` moves the props and their literal values (an expression is reported), `v1-names` renames `SelectOption`, and `v1-classes` the classes. `v1-props` reports each `className` and `style` on these components; move one meant for the native control to a selector under the root by hand, as the migration guide shows.

  Migration guide: [Fields and choice controls](https://github.com/envsemble/envUI/blob/main/docs/migration.md#fields-and-choice-controls).

- Markdown names its table regions and task checkboxes from EnvUIProvider's `messages.markdown`: a table is named after its caption, else the heading before it (`tableNamed`, "Prices table"), else `table` ("Table"), numbered where several share a name. Words in a table cell, inline code included, break only where they would overflow the cell, so a column keeps room for its longest word and the table's region scrolls instead; `Code` takes the hook `--env-code-overflow-wrap` for this.

  The prose typography that Markdown, RichText and RichTextEditor's document share is the `env-prose` class: Markdown's root is `env-markdown env-prose`, and RichText's root and the editor's document no longer carry `env-markdown`. Select them by `env-prose`, or by their own `env-rich-text` and `env-rich-text-document`.

  Migration guide: [Shell, dock, editors and code](https://github.com/envsemble/envUI/blob/main/docs/migration.md#shell-dock-editors-and-code).

- Message's actions are small ghost buttons by default, and its statuses come from messages.
  - A Button or IconButton in `actions` without a variant or size of its own is a small ghost button; one that sets them keeps them. A text IconButton at the edge still lines its icon up with the message, now through Button's `--env-button-text-icon-edge-start` and `-end` hooks.
  - The statuses are `messages.message.sending` and `.failed`; `statusLabel` still overrides them for one message. Message stays a server component and renders its status text in a client leaf.
  - The spinner of a sending message takes its color through Spinner's `--env-spinner-color` hook.

  Migration guide: [Content and display](https://github.com/envsemble/envUI/blob/main/docs/migration.md#content-and-display).

- Components, compound parts, classes and documentation pages take the established names envUI keeps for 1.0. Nothing is exported under an old name. `npx @envsemble/envui-codemods v1-names src` and `v1-classes src` rewrite most of an application; the rename map in that package lists every change.
  - Renamed components and their props types: `Input` is `TextField`, `DateTimeField` is `DatePicker`, `FileDropzone` is `DropZone`, `DisclosureNote` is `Disclosure`, `Notice` is `Alert` (with `AlertTone`), `Counter` is `CounterBadge`, `DiffCount` is `DiffStat`, `Heatmap` is `CalendarHeatmap` (with `CalendarHeatmapDay` and `CalendarHeatmapCell`) and `OrganizationMenu` is `OrganizationSwitcher` (with `OrganizationSwitcherOrganization`). Their props, behavior and look are unchanged.
  - Compound parts are members of ES module namespaces, as in Base UI, and each part's `displayName` is its qualified name, such as `Menu.Item`. Import the namespace and use its parts: `import { Menu } from '@envsemble/envui'`, then `<Menu.Root trigger={…}>` with `<Menu.Item>`. Their props types live in the namespace too, such as `Menu.ItemProps`.
    - `Menu` is `Menu.Root`, and `MenuItem`, `MenuGroup`, `MenuRadioGroup`, `MenuRadioItem`, `MenuCheckboxItem`, `MenuSeparator`, `MenuHeader` and `MenuSubmenu` are `Menu.Item`, `Menu.Group`, `Menu.RadioGroup`, `Menu.RadioItem`, `Menu.CheckboxItem`, `Menu.Separator`, `Menu.Header` and `Menu.Submenu`; `MenuDensity` is `Menu.Density`. `ContextMenu` stays a flat export.
    - `Menubar` is `Menubar.Root` and `MenubarMenu` is `Menubar.Menu`, with `Menubar.MenuOpenChangeDetails`.
    - `Table`, `TableHead`, `TableBody`, `TableRow`, `TableHeaderCell` and `TableCell` are `Table.Root`, `Table.Head`, `Table.Body`, `Table.Row`, `Table.HeaderCell` and `Table.Cell`; `TableSortDirection` is `Table.SortDirection`.
    - `Stat` is `Stat.Root` and `StatGroup` is `Stat.Group`, with `Stat.Trend` and `Stat.TrendTone`.
    - `GroupedRows` is `List.Root` and `Row` is `List.Item`.
    - `NavigationItem` is `NavList.Item`. New: `NavList.Root`, a plain labelled list of items, and `NavList.Group`, related items under a small heading; items inside them render as list items.
    - `DirectionLinks` is `Pager.Root`, and `DirectionLink` is `Pager.Previous` or `Pager.Next`, which no longer take `direction`. `Pager.Root` also accepts the two parts as children. `DirectionLinkProps` and `DirectionLinksDestination` are `Pager.LinkProps`.
    - `ToastProvider` is `Toast.Provider`; `useToast` and the notification types stay flat.
  - No longer exported: the manual `Toast` component and `ToastProps` (show notifications with `useToast()` inside `Toast.Provider`); `LoadingBar` (AppShell's `loading` and `loadingLabel` show page progress, and `Progress` shows a task's); `getInitials` (`Avatar` shows initials with `fallback="initials"`); `useLinkComponent` (envUI's links use the `LinkProvider` component); `useSidebarCompact`; and `defaultThemeStorageKey` from `./theme-bootstrap`, whose value is the string `"env-theme"`.
  - Class names follow the components: `env-date-time-*` is `env-date-picker-*`, `env-file-dropzone-*` is `env-drop-zone-*`, `env-disclosure-note` is `env-disclosure` and its content `env-disclosure-panel`, `env-notice-*` is `env-alert-*`, `env-counter-*` is `env-counter-badge-*`, `env-diff-count-*` is `env-diff-stat-*`, `env-heatmap-*` is `env-calendar-heatmap-*`, `env-organization-menu-*` and `env-organization-trigger-*` are `env-organization-switcher-*`, `env-grouped-rows` is `env-list`, `env-row` is `env-list-item`, `env-contrast-row-pane` is `env-list-surface`, `env-navigation-*` is `env-nav-list-item-*`, and `env-direction-link(s)` is `env-pager` and `env-pager-link-*`. Component custom properties follow the same names, such as `--env-alert-tone`. Styles that select envUI's classes need the new names.
  - Documentation pages move to the new names: `text-field`, `date-picker`, `drop-zone`, `disclosure`, `alert`, `calendar-heatmap`, `list`, `nav-list` and `pager`. The offline catalogue redirects the old routes.

  Migration guide: [Renamed components, parts and pages](https://github.com/envsemble/envUI/blob/main/docs/migration.md#renamed-components-parts-and-pages).

- Menus, navigation and collections take the 1.0 vocabulary, and several of their bugs are fixed.
  - Menu: `Menu.Item`'s `trailing` is `end`. An item with `href` closes the menu as it is followed and runs its `onClick`, if any, such as for analytics, and a disabled one renders no link, so nothing follows it. Every menu's popup, Menu.Root's, Menu.Submenu's, ContextMenu's and Menubar.Menu's, is the shared popup surface in the theme, scale and text direction of its trigger; Menu.RadioGroup takes `aria-labelledby`, which OrganizationSwitcher points at its heading; Menu.Root takes `side="inline-start"` and `"inline-end"`, and these parts pass `ref`, `style` and data attributes to the popup.
  - OrganizationSwitcher: `organizations`, `currentOrganizationId` and `onSelect` are `items`, `value` and `onValueChange`; `OrganizationSwitcherOrganization` is `OrganizationSwitcherItem`, whose `detail` is `description`. Its rows are Menu.RadioItems, and its strings come from `messages.organizationSwitcher`.
  - NavList.Item: `trailing` is `end`. An icon-only item, or one named by `aria-label`, says its end content in its name: a number, or a CounterBadge without `aria-label`, as a count, such as "Inbox, 12 new", from `messages.navList.itemCount`, and a CounterBadge's `aria-label` or other content's text as it is, such as "Inbox, 12 unread" or "Labs, Beta", from `messages.navList.itemEnd`; the dot alone was hidden from assistive technology. `env-nav-list-item-selected` and `-icon-only` are `[data-selected]` and `[data-icon-only]`.
  - Tabs pass the text direction to their list, so the arrow keys follow it in right-to-left text, while the panels keep the direction around them. `env-tab` and `env-tab-panel` are `env-tabs-tab` and `env-tabs-panel`.
  - DocumentTabs is rebuilt on Base UI Tabs: each tab sits beside its close button instead of around it, a CloseButton out of the tab order and hidden from assistive technology, and announces Delete and Backspace, which close it, through `aria-keyshortcuts`; each tab opens a context menu with Close, also without `onCloseAll`, which adds Close all tabs and the strip's own menu. A ContextMenu `content` function that returns `null` leaves the menu closed on that element. The arrow keys and the wheel follow the text direction; strings come from `messages.documentTabs`; the strip takes `ref` and `style`. `env-document-tab`, `-label` and `-close` are `env-document-tabs-tab`, `-tab-label` and `env-document-tabs-close`, and a new `env-document-tabs-item` holds each tab and its close button.
  - Breadcrumbs: a label cut short shows in full in a tooltip on hover and keyboard focus, and a plain level or the current page cut short takes keyboard focus for it; the name comes from `messages.breadcrumbs`; the `nav` takes native props. `env-breadcrumb` and `env-breadcrumb-*` are `env-breadcrumbs-item` and `env-breadcrumbs-*`.
  - Pagination formats its range in the locale and takes its strings from `messages.pagination`. Pager takes its labels from `messages.pager`, and its children render between the `previous` and `next` props' links.
  - Tree: `selectedId` and `onOpen` are `value` and `onAction`, `TreeOpenOptions` is `TreeActionOptions`, and a TreeItem's `detail` and `trailing` are `description` and `end`; it takes `ref` and `style`. `env-tree-row`, `-detail` and `-trailing` are `env-tree-item`, `-description` and `-end`, and the row height's custom property, `--env-tree-row-height`, is `--env-tree-item-height`; the `--env-tree-row-padding-block-*` tokens keep their names.
  - Table: `Table.HeaderCell`'s `onSort` is `onSortChange`, called with the order pressing asks for. A table named by `aria-labelledby` names its scroll region too. The sort and resize words come from `messages.table`.
  - List: `List.Item`'s `title` and `detail` are `label` and `description`. `List.Root`'s `contrast` is gone: a list in `<Surface background="muted" padding={3}>` of its own takes the raised row fill.
  - Kbd reads `--env-kbd-size`, `-padding-inline`, `-radius`, `-fg`, `-font-size`, `--env-kbd-separator-padding-inline` and `-font`, which a container sets to show smaller keys.

  Migrate with the codemods: `envui-codemods v1-props` renames `trailing`, OrganizationSwitcher's, Tree's, Table.HeaderCell's and List.Item's props; `v1-structure` wraps a `contrast` List.Root in a muted Surface and reports a computed one; `v1-names` renames `OrganizationSwitcherOrganization` and `TreeOpenOptions`; and `v1-classes` renames the classes, `env-menu-theme` to `env-popup-theme` among them, and turns NavList's modifiers into attributes; it reports OrganizationSwitcher's `env-organization-menu-radio` and `-radio-dot`, whose radio is Menu's `.env-menu-item-check` and `-check-mark` now, and a selector that puts `.env-document-tabs-close` inside `.env-document-tabs-tab`, its sibling now. By hand: the `detail` and `trailing` fields of Tree and OrganizationSwitcher data, which TypeScript reports, and the count in an icon-only NavList.Item's `aria-label`, which the item now adds itself. The ESLint plugin reports the renamed types.

  Migration guide: [Navigation and collections](https://github.com/envsemble/envUI/blob/main/docs/migration.md#navigation-and-collections).

- envUI ships no logos: BrandLogo and EnvUILogo, with their props types, are gone, and so is the brand artwork among the package's assets: the envUI lockups and favicons under `@envsemble/envui/assets/envUI/` and the envsemble lockup. The package README no longer shows a logo.

  Keep your artwork in the application, as an SVG file or a component that draws it with `Icon`, which follows the text color. The codemods report each use (`envui-codemods v1-names`), and the ESLint plugin's `no-renamed-exports` reports the imports.

  Migration guide: [Content and display](https://github.com/envsemble/envUI/blob/main/docs/migration.md#content-and-display).

- OrganizationSwitcher passes `className` to its menu popup, as Menu.Root, AccountMenu and ContextMenu do, and names each organization with `label`, as every other item does.
  - `className` goes to the popup, beside `env-organization-switcher`, with `style` and `ref`; the new `triggerClassName` styles the trigger, or the create button without organizations, which `className` styled before.
  - An `OrganizationSwitcherItem`'s `name` is `label`, also in AccountMenu.OrganizationSubmenu's `items`.

  Migrate with the codemods: `envui-codemods v1-props` renames `className` to `triggerClassName`, and an organization's `name` to `label`, and 0.x's `detail` to `description`, in an array written in `items` or 0.x's `organizations`; it reports items it can't read, such as a variable.

  Migration guide: [Navigation and collections](https://github.com/envsemble/envUI/blob/main/docs/migration.md#navigation-and-collections).

- Colors now come from a primitive palette with contrast built in, through semantic color tokens, and every theme passes the contrast gate with no exceptions, including two new high-contrast themes.
  - **Palette.** Ten hues (neutral, blue, slate, steel, green, teal, amber, red, violet, purple) seeded from the previous colors, on one grade scale from 0 (white) to 100 (black). Each grade is a band of WCAG luminance, so colors 40, 50 and 70 grades apart have at least 3:1, 4.5:1 and 7:1, in any hue. The palette is internal.
  - **Semantic tokens.** `--env-color-{bg|fg|border}-{role}-{emphasis}[-{state}]`, for example `--env-color-bg-default`, `--env-color-fg-muted`, `--env-color-border-default` and `--env-color-bg-brand-emphasis-hover`. Hover and pressed colors are tokens of their own instead of a runtime lightness shift. The 0.7 names, such as `--color-text-muted`, are replaced by these roles; the synonyms of muted text (quiet, icon, field label, hint, placeholder, row detail) now share one value.
  - **High contrast.** Set `contrast="high"` on a Theme, or let the system's `prefers-contrast: more` apply it, for text at 7:1 and boundaries, indicators and focus rings at 4.5:1. The translucent tone colors, such as the edges of outlined badges and alerts, an alert dismiss button's hover and the slider halo, follow the high-contrast tone too. `contrast="standard"` keeps the standard colors.
  - **Elevation.** `--env-elevation-{0…3}-shadow` and `--env-elevation-{0…3}-border`. Every popup takes a shadow and a hairline edge: menus, Select lists, popovers, tooltips and toasts at level 2, so they stand out from a page of their own color, dialogs and the command palette at level 3. Tooltips and toasts take an edge that follows their fill, `--env-color-border-{neutral|success|info|danger}-strong`: in light the fill a step darker, so a dark tooltip or toast on a light page has no light halo, and in dark the popup edge. The edge is the boundary in high contrast and under forced colors.
  - **Selection and states.** The selection can't be mistaken for another item at rest or under the pointer in any theme: a blue tint in light, a blue-gray in dark. Navigation items hover in the blue-gray again in light, deeper than the selection as in 0.7, and in a gray at high contrast; destructive buttons lighten on hover, and success toasts are teal again. In dark, checked checkboxes, switches, sliders, meters and spinners take the soft blue of the radio with dark marks. Disabled choice controls and sliders fade with their labels, and a disabled Slider marks its group `aria-disabled`, so its label and value read as part of the inactive control. Solid badges and counters take `--env-color-bg-{tone}-emphasis`, and the composer takes the field boundary.
  - **Contrast fixes.** Links reach 4.5:1 on panes and rows. Outlined fields and buttons, and the track of a switch that is off, get a 3:1 boundary. Dark checkboxes, switches, sliders and meters reach 3:1 on every surface, with marks at 4.5:1. Pressed and hover states keep their labels at 4.5:1. The empty stars of a Rating reach 3:1. A focus ring inside a solid fill gains an inner ring in the label color.

  Removed custom properties: the runtime state rule (`--state-lightness-threshold`, `--state-hover-shift`, `--state-pressed-shift`, `--state-surface-hover-shift`, `--state-surface-pressed-shift`, `--state-lightness-direction` and the `--state-*-lightness` values), the state opacities that are color tokens now (`--state-layer-hover-opacity`, `--state-layer-pressed-opacity`, `--state-fill-hover-opacity`, `--state-fill-pressed-opacity`, `--state-tone-subtle-opacity`, `--state-fill-opacity`, `--state-dialog-overlay-opacity`), and the unused `--color-surface-base`, `--color-surface-raised`, `--color-text-subtle`, `--color-control-text`, `--color-neutral-fill`, `--color-border-pressed`, `--color-control-blue-hover`, `--color-control-blue-pressed`, `--color-fill-hover`, `--color-fill-pressed`, `--state-card-strip-weight`, `--state-selected-base-weight` and `--member-identity-*`. The 1.0 migration lists the replacement of each, where there is one.

  Migration guide: [Tokens](https://github.com/envsemble/envUI/blob/main/docs/migration.md#tokens).

- PanelDock is a namespace, `PanelDock.Root` and `PanelDock.Header`, and its words come from EnvUIProvider's `messages.panelDock`:
  - `PanelDock` is `PanelDock.Root` and `PanelDockHeader` is `PanelDock.Header`, with `PanelDock.RootProps` and `PanelDock.HeaderProps`; `PanelDockPanel` and `PanelDockMode` keep their names.
  - PanelDockControls is internal. `PanelDock.Header`'s `controls` is a boolean, `true` by default, and `false` leaves the window controls out, where `null` did. Their names, Minimize, Maximize, Restore and Close, come from `messages.panelDock`, which also names the list of tabs, a tab's buttons and the resize handle; the dock's `minimizedLabel`, `openLabel`, `closeLabel` and `resizeLabel` still override those for one dock.
  - Buttons in a header's `actions` that set no variant are `ghost`, as the window controls are, in place of the icon color hook for icon-only text buttons: an icon-only `variant="text"` button there shows the link color now, so drop its variant.
  - Minimized panels are tabs, as on a taskbar: `env-panel-dock-chip*` is `env-panel-dock-tab*`, and the dock's `data-chips` is `data-tabs`. A tab's close button is a CloseButton.
  - The resize handle runs on the shared window splitter: <kbd>Page Up</kbd> and <kbd>Page Down</kbd> change the height by 64 px as <kbd>Shift</kbd> with an arrow does, and a drag that loses its pointer keeps the height it began with.

  The codemods rename the exports (`v1-names`), turn `controls={null}` into `controls={false}` and report a `controls` element (`v1-props`), report `PanelDockControls` with what replaces it, and rename the classes (`v1-classes`). Rename `[data-chips]` in style sheets by hand.

  Migration guide: [Shell, dock, editors and code](https://github.com/envsemble/envUI/blob/main/docs/migration.md#shell-dock-editors-and-code).

- PanelDock.Root's `showLabel`, the function that names a tab's button, is `openLabel`, as SidebarTrigger's `openLabel` names the button that opens a sidebar; a field's `showLabel` stays a boolean.

  Migrate with the codemods: `envui-codemods v1-props` renames `showLabel` to `openLabel` on PanelDock.Root.

  Migration guide: [Shell, dock, editors and code](https://github.com/envsemble/envUI/blob/main/docs/migration.md#shell-dock-editors-and-code).

- Popover, HoverCard and Tooltip open on the shared popup surface.
  - Popover's and HoverCard's `width` is `md`, the default, or `lg`, where it was `standard` or `wide`. Popover's `side` takes `inline-start` and `inline-end`, and the `onOpenChange` of Popover and HoverCard receives the reason as its second argument (`PopoverOpenChangeReason`).
  - `className`, `style`, `ref` and data attributes of Popover and HoverCard reach their popup, and Tooltip's `popupClassName` its popup; each popup takes the text direction of its trigger. Their theme and positioner classes are `env-popup-theme` and `env-popup-positioner`, and HoverCard's surface is `env-hover-card`.
  - A Tooltip describes a control with a name of its own while it is open (`aria-describedby` to its `role="tooltip"` popup). Around a disabled button, link, tab or menu item, its wrapper is a tab stop where it can read the control's name, and takes its role and name with `aria-disabled`, and a button's or tab's pressed, expanded, popup and selected state. A disabled checkbox, radio, switch, slider or select keeps its own role and state, with no stand-in. A Kbd in a tooltip takes light key caps.

  Migrate with the codemods: `envui-codemods v1-props` maps `width` and reports an expression.

  Migration guide: [Overlays and feedback](https://github.com/envsemble/envUI/blob/main/docs/migration.md#overlays-and-feedback).

- SegmentedControl takes `items`, and an unchosen segment's count keeps its contrast.
  - `options` is `items`, and `SegmentedControlOption` is `SegmentedControlItem`.
  - The segments' classes are `env-segmented-control-item`, `-item-label` and `-item-count`, for `env-segment`, `env-segment-label` and `env-segment-count`.
  - An unchosen segment's count is muted text, at 4.5:1 on the rail, rather than 80% of the label's color, which measured about 3.6:1.
  - SegmentedControl takes `ref`, `style`, `id` and the other attributes of its rail. Its page is listed under Forms & selection.

  Migrate with the codemods: `envui-codemods v1-props` renames `options`, `v1-names` the type and `v1-classes` the classes.

  Migration guide: [Content and display](https://github.com/envsemble/envUI/blob/main/docs/migration.md#content-and-display).

- Spinner, Meter and Progress take the 1.0 sizes and classes, and read their values right.
  - Spinner's `size` is `sm`, `md` (the default) or `lg`, set as `data-size` where the class `env-spinner-{size}` was. Its drawing is hidden from assistive technology also when it has a label.
  - Meter and Progress emit their own classes, `env-meter*` and `env-progress*`, where both emitted `env-bar*`, and take `className`, `style`, `ref` and data attributes on their root. Without `aria-valuetext` the formatted value stays, in the provider's locale; an indeterminate Progress is read as Loading, and its sweep runs toward the end of the line in right-to-left text.
  - New: Progress `segments`, which splits the track into steps that fill in turn.
  - LoadingState's name defaults to `messages.common.loading`.

  Migrate with the codemods: `envui-codemods v1-props` maps Spinner's `size`; `v1-classes` renames `env-bar` to `env-meter` and the Spinner size classes; rename a Progress's `env-bar` selectors to `env-progress` by hand.

  Migration guide: [Overlays and feedback](https://github.com/envsemble/envUI/blob/main/docs/migration.md#overlays-and-feedback).

- New: `SplitPane` and `ListDetail`, which replace 0.6's SplitView.
  - `SplitPane.Root` lays out two `SplitPane.Pane`s, side by side or one above the other (`orientation`), with a `SplitPane.ResizeHandle` between them: an APG window splitter that the pointer drags and the arrow keys move, in the text direction, and a double click resets. The first pane's `size`, `defaultSize`, `minSize` and `maxSize` are in `unit`, `%` of the split pane or `rem`; `onSizeChange` receives each size with `{ committed }`, and `persist` keeps it in localStorage, read after the first render. Below `stackBelow` of its own width the panes stack and the handle goes (`onStackedChange`, `data-stacked`). A Pane with `label` is a named region; the handle's name comes from `label` or `messages.splitPane.resize`.
  - `ListDetail.Root`, `ListDetail.List` and `ListDetail.Detail` put a list beside the detail of its chosen item on SplitPane, the list's width resizable and persisted. Below `stackBelow`, 44 rem by default, they show one at a time: `detailShown` shows the detail with a back button named by `backLabel`, which calls `onBack`. Focus moves to the back button as the detail opens, and back to the list's current row, the element with `aria-current`, as it closes.

  Migrate a SplitView with the codemods: `v1-names` and `v1-structure` turn `<SplitView start end resizeLabel storageKey>` into `<SplitPane.Root persist>` around `<SplitPane.Pane>{start}</SplitPane.Pane>`, `<SplitPane.ResizeHandle label />` and `<SplitPane.Pane>{end}</SplitPane.Pane>`, `SplitViewProps` into `SplitPane.RootProps`, and `v1-classes` renames `env-split-view` and its parts. The sizes keep their percentages, now of the whole split pane.

  Migration guide: [Split panes](https://github.com/envsemble/envUI/blob/main/docs/migration.md#split-panes).

- Stacking tokens: `--env-z-base` (0), `--env-z-raised` (1), `--env-z-sticky` (20), `--env-z-peek` (30), `--env-z-overlay` (90), `--env-z-modal` (100), `--env-z-popover` (110), `--env-z-toast` (120) and `--env-z-tooltip` (130), one z-index scale for envUI's components and the application's own layers. Every component takes its z-index from them, in the order it had: a tooltip stays above a toast, a toast above a menu, and a menu, a select list or a popover opened inside a dialog above the dialog. A dialog and the command palette sit at `modal`, over their scrim at `overlay`. Give an application's layers a token, with `calc()` for a step between two, such as `calc(var(--env-z-sticky) + 1)`.

  Breakpoint tokens: `--env-breakpoint-sm` (40 rem), `-md` (48 rem), `-lg` (64 rem) and `-xl` (80 rem), the viewport widths where a page's layout may change. CSS can't read a custom property inside `@media`, so style sheets write the value itself; components respond to their container's width instead.

  `--env-topbar-height` is `--env-app-shell-header-height`, with the same values: 3.25 rem, 2.625 rem in the compact scale, and 3.25 rem under a coarse pointer. `v1-classes` rewrites it, and the names the app frame's sticky offsets had before 1.0, `--topbar-height`, `--app-sticky-top`, `--env-app-sticky-top` and `--env-app-topbar-block-size`, to the 1.0 frame's `--env-app-shell-header-height`, `--env-frame-sticky-top` and `--env-frame-header-block-size`.

  Migration guide: [Tokens](https://github.com/envsemble/envUI/blob/main/docs/migration.md#tokens).

- Stat.Root's `detail` is `description`, and Stat.Group's `tone` is `background`.
  - `detail` is `description`, and its class `env-stat-detail` is `env-stat-description`.
  - Stat.Group's `tone` is `background`, as Surface's: `pane` is `default`, the default, `row` is `muted`, `canvas` is `page` and `alternate` is `raised`.

  Migrate with the codemods: `envui-codemods v1-props` renames both props and maps the values, and `v1-classes` renames the class.

  Migration guide: [Content and display](https://github.com/envsemble/envUI/blob/main/docs/migration.md#content-and-display).

- Text, Skeleton, Surface and Stack take the 1.0 vocabulary, and `render` replaces `as`.
  - Text: `tone` is `emphasis`, `default`, `muted` or `subtle` (`primary` is `default`, `quiet` is `subtle`). The variants `page-heading`, `section-heading` and `supporting` are `headline`, `title` and `body-sm`. `as="h2"` is `render={<h2 />}`. `TextTone` is `TextEmphasis`, and `TextElement` is gone. The classes `env-text-{variant}` and `env-text-tone-{tone}` are `[data-variant]` and `[data-emphasis]` on `.env-text`.
  - Skeleton: `tone` is `emphasis`: `base` is `muted`, the default, and `highlight` is `default`; `env-skeleton-highlight` is `[data-emphasis='default']`.
  - Surface: `tone` is `background`, `default`, `muted`, `page` or `raised` (`pane`, `row`, `canvas` and `alternate` before), and `corners` is `radius`, named after the radius tokens: `xl`, `sm`, `full` or `none` (`surface`, `standard`, `pill` and `none` before). `as` is `render`. `SurfaceTone` is `SurfaceBackground` and `SurfaceCorners` `SurfaceRadius`. The classes `env-surface-{tone}` and `env-surface-corners-{corners}` are `[data-background]` and `[data-radius]`.
  - Stack lays out rows too: `direction="row"`, `wrap` and `justify` (`start`, `center`, `end` or `between`). `as` is `render`, and `StackElement` is gone.
  - ActionGroup is gone. A row of actions is `<Stack direction="row" wrap align="center" gap={4}>`, with `justify="end"` for `align="end"`, and a stacked group `<Stack gap={2}>` with `fullWidth` on each labelled Button.
  - The icon wrapper's class `env-symbol` is `env-icon`, sized by the custom property `--env-icon-size`, which a container such as a button sets.

  Migrate with the codemods: `envui-codemods v1-structure` rewrites ActionGroup into Stack and reports a `stacked` it can't read; `v1-render` turns a literal `as` into `render` and reports an expression; `v1-props` renames `tone`, `corners` and the Text variants and maps their literal values, reporting an expression; `v1-names` renames the types and reports the removed ones; and `v1-classes` rewrites the classes and `env-symbol`.

  Migration guide: [Variants, tones and render](https://github.com/envsemble/envUI/blob/main/docs/migration.md#variants-tones-and-render).

- `Theme` and `ThemePreferenceProvider` take a `contrast`: `high` for the high-contrast colors, `standard` to keep the standard ones even when the system asks for more contrast, or `system` to follow `prefers-contrast: more`. Left out, a Theme takes the contrast of the Theme around it, and `system` outside any. Nested Themes and envUI's popups, such as menus, Select lists, tooltips, toasts and dialogs, keep the contrast of the boundary they open from, as they keep its color scheme. With `applyToDocument`, the provider writes the contrast on the document root too, marked with `data-env-contrast-source` and the value written, such as `envui:high`, and removes from it only a contrast so marked that the page has not written over, so a provider mounted in place of another, such as one keyed by the signed-in user, removes its predecessor's contrast. One provider per document applies to it: any other passes `applyToDocument={false}`, and development reports two that both apply. `createThemeBootstrapScript` takes the same `contrast`, so a fixed high or standard contrast is on the root before the first paint. The script marks what it writes the same way, and the provider treats that contrast as its own once the application starts: its contrast replaces it, and at `system` it removes it, so a contrast the application stores as a user setting does not stay at the script's value after a reload.

  `useTheme()` returns `{ theme, contrast }` instead of the color scheme alone: read the scheme as `const { theme } = useTheme()`, and re-theme an application's own portal with `<Theme {...useTheme()}>`, which the `v1-names` codemod writes for `<Theme theme={useTheme()}>`; it turns other calls into `useTheme().theme` unless the file already reads them as `{ theme, contrast }`, and reports those that are returned or passed to a context. In development, where the bundler defines `process.env.NODE_ENV`, Theme reports a `theme` that is not `light` or `dark`; a production build leaves the report out, and without a bundler it stays silent. Its `contrast` wins over a `data-env-contrast` attribute passed to it; without the prop, such an attribute sets the contrast for the boundary and everything in it.

  Migration guide: [useTheme returns the theme, its contrast and its scale](https://github.com/envsemble/envUI/blob/main/docs/migration.md#usetheme-returns-the-theme-its-contrast-and-its-scale).

- Toast takes the 1.0 vocabulary and reads in every language and direction.
  - A notification's `variant` is `tone`: `neutral`, `success`, `info` or `danger`, where `error` was. `ToastVariant` is `ToastTone`.
  - The `bottom-right` placement is `bottom-end`, the default, which is the left edge in right-to-left text and keeps clear of that side's safe area; the `top-center` stack is centred in either direction.
  - A danger notification is an alert as it appears, read once and outside any polite region, readable without moving focus to its region first, and never waits behind the count of older notifications: it takes its place first. The other notifications are read by a polite status beside the regions, and a swipe toward the end of the line dismisses one, to the left in right-to-left text.
  - The region names, now Notifications and Top notifications, the hidden count and the dismiss button's name come from `EnvUIProvider`'s `messages.toast`. The dismiss button is a CloseButton.
  - The manual `Toast` component and `ToastProps` are deleted.
  - Classes: `env-toast-{variant}` is `.env-toast[data-tone]`, and `env-toast-viewport-{placement}` is `.env-toast-viewport[data-placement]`.

  Migrate with the codemods: `envui-codemods v1-props` moves `variant` and `placement` in `useToast().show({ … })` object literals and `defaultPlacement` on Toast.Provider, and reports an argument it can't read; `v1-names` renames `ToastVariant`; `v1-classes` rewrites the classes.

  Migration guide: [Overlays and feedback](https://github.com/envsemble/envUI/blob/main/docs/migration.md#overlays-and-feedback).

- TitleBar and WindowFrame are one namespace, `WindowFrame`, with three parts:
  - `WindowFrame.Root` fills the window and scrolls `WindowFrame.Content` with the keyboard as it would the document; the title bar is its first child instead of its `titleBar` prop.
  - `WindowFrame.TitleBar` is 0.x's TitleBar, with the same `start`, centred `children` and `end`, also on its own. Buttons inside that set no variant are `ghost` and take the small height, as the window controls beside them; a button's own `variant` still wins, so an icon-only `variant="text"` button shows the link color now: drop the variant.
  - `WindowFrame.Content` holds the content below the title bar; its `ref` is the scrolling element, which 0.x's `scrollRef` gave.
  - The classes follow: `env-title-bar` is `env-window-frame-title-bar`, with its parts `-layout`, `-start`, `-center` and `-end`, and the custom properties `--env-title-bar-start` and `--env-title-bar-end` are `--env-window-frame-title-bar-start` and `-end`. `--env-title-bar-height` keeps its name.

  The codemods cover it: `v1-names` renames `TitleBar` to `WindowFrame.TitleBar` and `<WindowFrame>` to `<WindowFrame.Root>`; `v1-structure` makes the `titleBar` prop the first child and wraps the children in `WindowFrame.Content`, which takes `scrollRef` as its `ref`; `v1-classes` renames the classes and custom properties.

  Migration guide: [Shell, dock, editors and code](https://github.com/envsemble/envUI/blob/main/docs/migration.md#shell-dock-editors-and-code).

- The content, rich-text and diff entries' libraries (Shiki, the Pierre themes, react-markdown, remark-gfm, marked, Tiptap and Diffs) are no longer peer dependencies. GitHub Packages drops the field that marked them optional, so npm installed all of them in every application. An application importing one of these entries installs its libraries itself, with the commands in [Setup](https://github.com/envsemble/envUI/blob/main/docs/setup.md#public-entry-points); one using only the main entry installs none of them.

### Minor Changes

- AccountMenu and ThemeRadioGroup.
  - `AccountMenu.Root` is the signed-in person's menu: their avatar, or a row with the avatar, `name` and `description` (`trigger="row"`, or `auto`, a row in an expanded sidebar and the avatar elsewhere), opens a Menu with a header that shows who is signed in, then its children. It is named "Account" from `messages.accountMenu.label`.
  - `AccountMenu.ThemeSubmenu` holds the theme choice, and `AccountMenu.OrganizationSubmenu` switches between the person's organizations with OrganizationSwitcher's rows, the active one named under its row. OrganizationSwitcher stays a component of its own.
  - `ThemeRadioGroup` is the theme choice, System, Light and Dark, as radio items for any Menu. Inside a ThemePreferenceProvider it checks and stores the provider's preference; `value` and `onValueChange` connect it to a theme the application stores itself. The menu stays open after a choice unless `closeOnClick`. Its labels come from the new `messages.themeToggle.system`, `light` and `dark`.

- The skills and the MCP server install together as one agent plugin, `envui@envui`, from the envUI repository, which is its private plugin marketplace. The plugin's server runs from the project's installed envUI, and each release raises the plugin's version with the package's. For agents, `docs/agent-tooling.md`, gives the install commands.
- Tooling for coding agents, all generated from the documentation and describing the installed version:
  - `npx --no envui agents` writes a compressed index of envUI, under 8 KB, into the project's `AGENTS.md` between `<!-- BEGIN envui -->` and `<!-- END envui -->`: the rule to search envUI before writing any UI element and to propose an envUI addition instead of a local copy, where the installed docs are, and every component page with its exports and aliases. It keeps the rest of the file and creates it when missing; `--check` fails in CI when the index is missing or outdated, and `--file` writes to another file.
  - `npx --no envui mcp` is an MCP server over stdio with the tools `search`, `list_components`, `get_component`, `get_props`, `get_example`, `list_patterns`, `list_templates`, `get_tokens` and `plan`, which proposes candidate components, patterns and tokens for a description of a screen, each with the words that matched, to confirm with `get_component`. Any MCP client registers it in the project as `node node_modules/@envsemble/envui/bin/envui.mjs mcp`. It needs nothing beyond Node, so envUI gains no dependency.
  - The package root has `manifest.json`, every component with its summary, aliases, when to use it and what instead, exports, import paths, props and examples, plus the other pages and the tokens; `llms.txt`, the index of the documentation; and `llms-full.txt`, every page in one file for tools that index it.
  - The skills are rewritten around these: `envui-use` and `envui-migrate` look every element up first, and the new `envui-contribute` covers adding what envUI lacks upstream.

  The documentation's new For agents page, `docs/agent-tooling.md`, describes them.

- An `Avatar` without a picture takes a solid color that its `name` chooses, one of eight (blue, teal, green, amber, red, violet, purple and slate), with white initials or a white figure, so a person or an organization keeps the same color everywhere. `hue` sets the color instead, such as an organization's own, and `avatarHue(name)` returns the one a name chooses; the fills are the `--env-color-avatar-bg-{hue}` tokens, a grade darker at high contrast. Initials are semibold at 0.38 of the avatar's size, and every avatar has a hairline just inside its edge, so a white figure or a light photo keeps its circle on a page of the same color.
- A Button `variant` typed as a union of variants, such as `variant={pressed ? 'primary' : 'secondary'}` or a prop typed `'primary' | 'secondary'`, type-checks with the tones every variant in it takes, on Button, IconButton, ConfirmButton, CopyButton and the buttons built on them; a pair outside the designed ones, such as a secondary danger button, still fails. Surface, Stack and Text take a ref to the element `render` makes: their ref's element is a type parameter that the ref sets, so `useRef<HTMLElement>(null)` with `render={<section />}` and `useRef<HTMLDivElement>(null)` with `render={<div />}` on Text type-check. `SurfaceProps`, `StackProps` and `TextProps` take the element too, `SurfaceProps<HTMLElement>`, and without it their `ref` stays a ref to the default element, a div or a paragraph, so a wrapper that forwards it to that element still type-checks.
- ConfirmDialog, an alert dialog that asks people to confirm an action whose consequence needs a sentence: a `title` that asks the question, a `description`, Cancel (`cancelLabel`, from `messages.confirmDialog.cancel`) and a confirm button named by `confirmLabel`. `tone="danger"` makes the confirm button a danger one and starts focus on Cancel; a neutral confirmation starts on the confirm button. `onConfirm` runs the action: when it returns a promise, the confirm button is pending and nothing dismisses the dialog until it resolves, and a rejection keeps the dialog open, with `error` shown as an announced danger Alert. It opens from `trigger`, or from `open` and `onOpenChange`, and `finalFocus` returns focus to the control that opened it, such as a menu's button.
- Content components follow EnvUIProvider's locale and messages.
  - Rating shows its number in the locale's format, such as 4,5 in German, and names its stars with `messages.rating.label`, which receives the value and the scale as text in the locale's digits; `formatLabel` still overrides it.
  - RelativeTime takes the provider's `locale` and `messages.relativeTime.now`; its own `locale` and `nowLabel` still win.
  - AnimatedNumber's default format is the provider's locale's number format.
  - CalendarHeatmap names its months, weekdays and days and writes its values in the locale, from `Intl`, and its legend comes from `messages.calendarHeatmap`; its label and format props still override them. Its tooltip is the shared tooltip popup.
  - SegmentedControl writes its counts in the locale's number format, AvatarGroup separates the names in its label as the locale lists them, and Avatar's initials take the locale's capitals, from the provider's locale or, without one, the runtime's.
  - Rating, DiffStat, AvatarGroup and Disclosure are client components.

- CopyButton takes `write`, a clipboard writer of the application's own, such as a desktop shell's bridge, used instead of the browser's Clipboard API; a promise that rejects shows and announces "Couldn’t copy". CopyButton copies through the shared copy logic that CodeBlock will use too.
- New: `DescriptionList`, the facts about one thing as labels and their values. `DescriptionList.Root` is a `dl` with `layout` `auto` (labels beside their values, above them below 24 rem of the list's own width, the default), `inline` or `stacked`, `size` `sm` (the default) or `md`, and `controls` for values that are small controls. Each `DescriptionList.Item` is a `div` around its `label` as the `dt` and its children as the `dd`.
- Disclosure takes `defaultOpen` and `onOpenChange(open)`, which receives whether it is open each time it opens or closes, also when find in page opens it. `open` with `onOpenChange` controls it: it shows what `open` says, also when the parent leaves `open` as it is; a native `onToggle` still passes through.
- `DocumentTabs` gains three things:
  - `onReorder`: a tab dragged with a mouse or pen dims in place while a copy of it follows the pointer and a line marks the gap it will drop into; letting go moves it there and <kbd>Esc</kbd> cancels. Each tab's context menu offers Move left and Move right (`messages.documentTabs.moveLeft` and `moveRight`), which the keyboard and touch reach too.
  - `end`: content after the tabs, outside the strip that scrolls and on its hairline, such as a button that opens a document or closes them all. The hairline and height move from the strip to the new `env-document-tabs-bar` around it.
  - Tabs that run past an edge of the strip fade out toward it, and the active tab scrolls clear of the fade.

- List rows can be the current one, lead with content and be put in order.
  - `List.Item` takes `selected`, the current row of a list beside its details, in the selected fill with `aria-current="true"` on its row target; `start`, content before the label, such as an Avatar, an icon or a Checkbox, whose checked state gives its row the selected fill; and `textValue`, the row's label as text where `label` isn't one.
  - `List.Root` takes `onReorder(from, to)`, which gives each row a drag handle. Space or Enter on the handle lifts the row, the arrow keys, Home and End move it while the other rows make room, Space or Enter drops it and Escape puts it back; Alt+↑ and Alt+↓ on a row target move its row at once; and the handle drags the row with a pointer, scrolling the scroll area near its edges. Each step is announced from a polite live region with the row's position and the count, from the new `messages.list` strings, and focus stays on the control that moved the row. Nothing moves until the row is dropped, when the application moves the item in its own state.

- New: `Page` and `PageHeader`, the page column and its heading.
  - `Page` is the column a page's content sits in, centered at `width` `sm` (40 rem), `md` (60 rem), `lg` (76 rem, the default) or `full`, with the page gutter at its inline edges (`gutter`, from 1 to 2 rem with the viewport) and its `header` at the top. It adds no landmark, and takes `render` for its element, such as `render={<article />}`. The widths are `--env-page-width-sm`, `-md` and `-lg` on `.env-page`.
  - `PageHeader` holds a page's `title`, at `headingLevel` 1 unless set, with `breadcrumbs` above it, `description` under it, `start` before it, `meta` beside it, `actions` at the end of its row and a `toolbar` row below. It responds to its own width: below 32 rem the actions move under the title and wrap. `controlSize` gives its buttons the `md` or `sm` size. `sticky` keeps it at the top of the page, at `--env-frame-sticky-top`, and publishes its height on its Page as `--env-page-header-block-size`, so content can stick below both.

- Pattern and template pages, and the tools that serve them to agents:
  - Pattern pages (`docs/patterns/`) and template pages (`docs/templates/`) follow the page template, with frontmatter of their own: a pattern's `intent`, the exports a page `composes`, a template's `frame` (inside the app frame, or a whole screen) and `see` in `avoidWhen` for a page to read instead. A template's screens are source in `docs/examples/<template>/<Name>.tsx`, to copy into the application and edit; they are not exports. The loading pattern moves to the new format, with live examples.
  - `manifest.json` lists patterns with their intent, status, `composes` and examples, templates with their frame, scales and screen files, the `intents`, and each component's `usedIn`, the patterns and templates that compose it. `llms.txt` lists patterns by intent.
  - The MCP server gains `get_pattern` and `get_template`, which returns a screen's source with where it renders. `list_patterns` takes an `intent`, `get_example` takes a pattern or template, search matches their situations and what they compose, and `plan` points at a template that matches.
  - The `npx --no envui agents` index says where template sources are, once there are templates.

- New: `EnvUIProvider`, `Toolbar`, `Field` and `CloseButton`.
  - `EnvUIProvider` sets the `locale` envUI formats in, overrides of its built-in English strings through `messages`, per namespace, and the text direction for keyboard and placement logic through `dir`. envUI works without it. `useLocale()` returns the provider's locale, and `@envsemble/envui/messages` exports `defaultMessages`, every namespace and key with its English default. ConfirmButton, CopyButton, Dialog's close button and ThemeToggle read their strings from it; ThemeToggle takes an `aria-label` of its own too.
  - `Toolbar.Root`, `Toolbar.Group`, `Toolbar.Separator`, `Toolbar.Button` and `Toolbar.Link`: a row or column of controls for one subject, one tab stop moved through with the arrow keys, on Base UI's Toolbar. Its buttons are icon-only, named by their label in a tooltip with their shortcut, and take `pressed` for a toggle; buttons inside take the ghost variant, though not those of a popover, menu or dialog opened from it.
  - `Field.Root`, `Field.Label`, `Field.Control`, `Field.Description` and `Field.Error`: the parts of a labelled field for a control envUI has no field for, on Base UI's Field, with the outlined control look.
  - `CloseButton`: the ghost icon button that closes, dismisses or removes what it sits in, named Close in the provider's language, with a touch-size hit area under a coarse pointer.

- `breakpoints` (`{ sm: '40rem', md: '48rem', lg: '64rem', xl: '80rem' }`, the breakpoint tokens' values) and `breakpointQuery(breakpoint, 'up' | 'down')`, which returns the media query from a breakpoint up, such as `(width >= 48rem)`, or below it. `useMediaQuery(query, { defaultValue })` tells whether the viewport matches a media query and follows its changes, and `useBreakpoint(breakpoint, { defaultValue })` whether the viewport is at least as wide as a breakpoint. On the server and while hydrating, both return `defaultValue` (false), so hydration meets the server's markup; the browser's answer follows. A new foundations page, Responsive layout & stacking, documents them, when to use container queries instead, and the stacking tokens.
- SearchTrigger, the button that opens search or a command palette. It reads like a search field, with the search icon, its `label` ("Search" by default, from `messages.searchTrigger.label`) and the shortcut's keys at the end, or shows only its icon with the label and keys in a tooltip (`iconOnly`, automatic in a sidebar showing icons only). Its `shortcut`, `mod+k` by default, is ⌘K on Apple platforms and Ctrl+K elsewhere: the trigger shows it, announces it with `aria-keyshortcuts` and presses itself when it is pressed anywhere in the window, so `onClick` is the one place the application opens search. With several triggers for one shortcut, the most recently mounted visible one takes it; `listen={false}` keeps a trigger from listening, and a key something else already handled, such as an editor's own, is left alone.
- envUI works with React Server Components. Every module that keeps state, runs effects, reads context or uses Base UI, and every icon that follows a selection's fill, starts with `'use client'`; the entry points carry no directive. A server component imports from `@envsemble/envui` as before: `Menu.Item` and the other client parts arrive as client references, markup-only components such as `Card`, `Badge`, `Text`, `Button` and `Alert` render on the server, including `Button` and `IconButton` while `pending`, and `createThemeBootstrapScript`, `formatRelativeTime`, `countDiffLines` and `createRichTextExtensions` run there. The setup guide says what runs where.
  - `NavList.Item` renders its `<li>` only as an item of `NavList.Root` or `NavList.Group`, also through the application's components, and no longer inside the application's own `<li>` or inside another item; the list styles select only the lists' own items.
  - The package no longer ships `dist/generated`, the internal token module that no export reached.

- TimePicker and MonthPicker, and time wheels in DatePicker.
  - `TimePicker` is a field for a time of day. Its value is `HH:mm` on the 24-hour clock, and it opens wheels side by side: Hours, Minutes every `minuteStep` minutes (15 by default, from 1 to 60) and, where the locale uses a 12-hour clock, AM/PM, in the order the locale writes a time. Each wheel's middle row is its value, on its own solid fill, so the time reads as one line; hours and minutes loop endlessly, and the rows above and below are smaller and dimmer. Scrolling a wheel snaps a row to the middle and chooses it as it comes to rest, pressing a row turns it there, and each choice sets the whole time at once. `min` and `max` make the values outside them unavailable, and a minute between the steps still shows in its place. Each wheel is a spinbutton: the arrow keys step by one, wrapping around, Page Up and Page Down by five, Home and End to its ends, digits to an hour or minute and A or P to a day period, and Left and Right move between the wheels. Now and, with `clearable`, Clear sit under the wheels as on DatePicker. Its strings, the wheels' names among them, come from the new `messages.timePicker`.
  - `MonthPicker` is a field for a month. Its value is `YYYY-MM`, shown as the month and year in the locale (`formatOptions` changes it), and it opens a year of months in four rows of three, with previous and next year buttons, this month marked and This month as a shortcut. `min` and `max` make the months outside them unavailable. The arrow keys move by month and row, on into the next or previous year, Home and End to the row's ends, Page Up and Page Down by year, and Enter or Space chooses. Its strings come from the new `messages.monthPicker`.
  - Both share DatePicker's field: the floating label, description and error, `variant`, `size`, `clearable`, `placeholder`, `required`, `name` and `form` with form reset, `readOnly`, `disabled`, controlled or uncontrolled `value` and `open`, and `locale`.
  - `DatePicker` with `granularity="minute"` shows TimePicker's wheels beside the calendar, under the heading `timeLabel`, in place of the time field under the calendar; on a narrow window they stack under the calendar. Turning a wheel sets the time at once, within `min` and `max`, whose values outside them are unavailable on their days. The new `minuteStep` sets the minutes between the minute wheel's rows. The calendar no longer has a Done button: like a date-only one it closes with Esc, a press outside or the field, so `doneLabel` and `messages.datePicker.done` are gone; remove them.

- A Tooltip can name or describe the icon-only trigger of a menu or popover.
  - Tooltip passes its native props and `ref` on to its control, as a Menu.Root's, Popover's, Dialog's, Drawer's or ConfirmDialog's `trigger` gives them: the press handler, `aria-haspopup`, `aria-expanded`, `aria-controls` and the ref reach the button. Wrapped around one of those five, the Tooltip goes to their `trigger`; around any other component it describes that component.
  - While the control's menu or popover is open, the tooltip stays closed, so Esc closes the menu or popover first. When it closes and focus returns to the control, the tooltip stays closed until the pointer enters the control or a key is pressed, so one Esc is enough.
  - Around a HoverCard, or as its `trigger`, a Tooltip shows no tooltip, and says so while developing.
  - A Tooltip whose child is text, a Fragment or a component that doesn't pass the ref on says so while developing, where it crashed or showed nothing.
  - `popupClassName` adds a class to the tooltip's popup, which no longer takes the Tooltip's `className`, `style`, `ref` or data attributes: they go to the control, whose own `id` wins over the Tooltip's.

- New: `useContainerSize(target, { box })`, an element's inline and block size in CSS pixels along its writing mode, kept up to date by a ResizeObserver: its content box, or its border box. It is measured before the element paints, is undefined on the server, and keeps the last size while the element isn't rendered. Prefer a container query where only styles change.

### Patch Changes

- Checkbox and Switch follow the scale: the checkbox's box takes the medium icon size and the smallest corners, 1 rem in the compact scale, and the switch's thumb is half the small control height, so its track is 2.125 by 1.3125 rem in the compact scale. The comfortable sizes are unchanged. Their label rows are at least the 24 px minimum target in both scales, and a Checkbox without a visible label takes presses across a 24 px hit area, 44 px under a coarse pointer, with its box and layout unchanged. The check mark's padding snaps to whole pixels.
- Fixes found while documenting the components on the page template:
  - A `Disclosure`'s panel is indented at the inline start, so in right-to-left text it sits under the summary's chevron instead of on the left.

- ConfirmDialog: Enter in a field in its content, such as a typed name, now confirms through `onConfirm` as the confirm button does, with the same pending state, run-once guard and error. The dialog's content and actions sit in a form whose submit button is the confirm button; the form lays out as if it weren't there and its submit doesn't reach a form around the dialog.
- ConfirmDialog says in the console while developing when its children hold a `<form>`, which would nest in the dialog's own form. Its page says to use Dialog for a real form.
- The arrow keys of SegmentedControl, Tabs, Menubar and the Markdown and rich text editors' toolbars follow the text direction in a right-to-left region without an `EnvUIProvider` `dir`, as Toolbar's do: each reads the direction at its element, from `dir` attributes and CSS, and tells Base UI. Before, they ran left to right there.
- A controlled Disclosure no longer shows its details for a frame when the parent refuses the change: a click or key on the summary asks through `onOpenChange` and leaves the element as `open` says. An uncontrolled Disclosure keeps the native behaviour, and a link or button inside the summary still takes its own click.
- Labels no longer break mid-word in Firefox:
  - A `Disclosure`'s summary keeps a one-word title such as Code on one line; long words still wrap when the summary is narrower than they are.
  - A `Toast`'s action keeps its label on one line and the message wraps beside it; only a label longer than half the toast wraps.

  A `NavList` in a `Sidebar` rail hides its group labels, as the rail hides its own group headings, instead of squeezing them into the rail letter by letter.

- A font-weight scale, compact counters and document tabs, and smaller fixes.
  - The new `--env-font-weight-regular`, `--env-font-weight-medium` and `--env-font-weight-semibold` tokens (400, 500 and 600) are the font weights. The body and heading type roles and every component take their weights from them.
  - Counter badges and diff stats are a size smaller in the compact scale, 1 rem rather than 1.25 rem, from the new `--env-counter-badge-height` token, and badges, counters and diff stats take the caption size of the scale. The DocumentTabs strip is as tall as a medium control, 2 rem in the compact scale rather than 2.5 rem.
  - In an AvatarGroup, each avatar covers an eighth of the one before rather than a quarter, and initials center in the part of the circle the next avatar leaves uncovered, so they stay readable.
  - The gap cursor of RichText no longer blinks under reduced motion.
  - Card, List and RadioGroup lay out with logical properties where they still used physical ones.

- The exports documented on guide and foundations pages, such as EnvUIProvider, useTheme and useContainerSize, have a status in the manifest and the MCP server: `stable`, unless the page's new `statuses` frontmatter gives one another.
- Links keep 4.5:1 on tints, and toast labels on their hover and press fills.
  - The new `--env-color-fg-link-on-tint` tokens, with `-hover` and `-pressed`, are the link colors for a tint, where `--env-color-fg-link` falls below 4.5:1 in the light theme: alerts, list rows under the pointer or pressed and unselected interactive table rows under the pointer or holding focus point the link tokens at them, so links and text buttons there stay readable. Links an application puts on `--env-color-bg-brand-muted` take them too.
  - The hover and pressed fills of success and information toasts are a grade darker, so white text on them keeps 4.5:1, as on the toast itself.

- The status beside RichText's suggestions mounts empty and takes its message a frame later, so assistive technology announces the first message, such as "Loading suggestions", too.
- `useMediaQuery` and `useBreakpoint`, and with them a sidebar provider's breakpoint, no longer keep a stale answer in WebKit when the window crosses a breakpoint and comes straight back, as an iPad rotating to portrait and back to landscape does. The hook read each answer from a new MediaQueryList but listened to another one; a render between two frames read the new answer, and WebKit, which sends change events against what a list last answered, sent none as the window went back, so a sidebar its provider hid below the breakpoint stayed hidden. The hooks now read and listen to one list per query, and ask again on resize.
- Highlighted code is readable in both app themes and under high contrast. Code blocks and code diffs keep the Pierre code themes, but each token color below 4.5:1 on code's background, or below 7:1 where the nearest Theme's contrast is high (or `system` while `prefers-contrast: more`), takes the closest color of the same hue that reaches it, with as much of its chroma as the color space allows: in the light theme the oranges, yellows, greens and cyans are darker, and in the dark theme the grey of comments and JSX text is lighter. Tokens that had different colors keep visibly different ones. Code diffs also keep their tokens readable on the lines they tint for additions and deletions, and their change counts on code's background. The colors are computed when code first loads, from whichever version of `@pierre/theme` is installed.
- RichTextEditor's code blocks keep their lines and scroll sideways, as the document's style says: the editor no longer has Tiptap add ProseMirror's base styles in a style element outside any cascade layer, where they won; envUI's style sheet holds them in its layer, so an application's CSS overrides them too.
- `RichTextEditor` shows a task item's checkbox beside its text, as `RichText` does, instead of on a line of its own above it.
- In an expanded Sidebar, navigation items place their icons on the rail's centre line, which SidebarTrigger keeps too, so the icons line up with the trigger in the compact scale and under a coarse pointer, and stay in place as the sidebar collapses to a rail.
- A `Switch` that is on keeps its thumb inside the track in right-to-left text, at the track's end on the left.
- In a selected Table row, a link that looks like a link, a Link without its underline or a text button that is a link, is underlined: it shares the selection's text color with the row's own text, so color alone no longer tells them apart. Links styled as buttons keep their look.
- Links and text buttons in a selected table row take the selection's text color, `--env-color-fg-on-selected`, at rest, on hover and on press, also while the row is under the pointer or holds focus. The link blue measured 4.33:1 on the selection fill in the light theme, and 4.06:1 on the hovered one. The row sets the link colors to it, so icon-only text buttons and links in rich text follow; danger text buttons keep the danger color.
- Tooltip reads its control's name as assistive technology does, without text hidden from it, such as an `aria-hidden` arrow, and follows the name while the tooltip is open, so a control whose name and tooltip turn to "Copied" together isn't described by words that repeat its name. A disabled control's stand-in follows its control through a mutation observer instead of reading it again on every render. A hidden label that `aria-labelledby` references directly still names the control.
- Under a coarse pointer, every pressable avatar in an AvatarGroup is a target of at least the touch height, its picture and state layer in the middle, and keeps that much uncovered, so smaller avatars sit apart. A Combobox chip's remove button keeps a hit area of the touch size also on a wrapped row of chips, which now lie that far apart, and under the label on the field's edge.

## 0.7.0 — 2026-10-15

Code in the Pierre themes that Diffs (diffs.com) uses, and code diffs rendered by Diffs; centred empty states, compact tabs, diff counts, ratings and color swatches; the soft blue primary action in the dark theme. Split views are gone.

### Breaking changes

- `SplitView` is removed, with its divider. Lay out a list beside its detail with an application grid and a `Surface` pane for the detail; follow the region's width with a `ResizeObserver` where the layout changes, such as to open the detail in a `Dialog` on narrow screens.
- `Code`'s `appearance` and `Markdown`'s `inlineCode` are removed, with the subtle inline code; `CodeBlock`'s `theme` is removed. Code always takes the code theme of the app theme. Migration: delete the props.
- The content entry's optional peer `@shikijs/themes` is replaced by `@pierre/theme` (2.x): install `@pierre/theme` and remove `@shikijs/themes`.

### Added

- `@envsemble/envui/diff`, with `CodeDiff` and `countDiffLines`: the changes between two versions of a file rendered by Diffs (`@pierre/diffs` 1.5.2 or later, an optional peer installed with this entry). `before`, `after` and `filename`, which names the header and chooses the language unless `language` does; `header` (true by default), `expandUnchanged`, and `layout`: `auto` sets old and new side by side from 56 rem of the diff's own width, `unified` keeps one column. The diff takes Diffs' own Pierre theme for the app theme on the code blocks' background, and applications do not choose its colors; long lines wrap, and it shows a loading state while its highlighter loads and an error state with Retry if it fails. A diff without changes shows the whole file. `countDiffLines(before, after)` returns the added and removed lines, for a `DiffCount`.
- `DiffCount`: the size of a change in one counter-sized pill, such as +12 −3, additions in the success tone and deletions in the danger tone, named once for assistive technology (`formatLabel`; "12 added lines and 3 removed lines" by default). In a button, such as a tab, it keeps its pill, on a fill that leans back toward the canvas where the button's and a tab rail's fills would add up, so the tones keep 4.5:1 contrast; on primary and important fills it takes the outlined pill.
- `EmptyState` `align="center"`: for a state that takes the place of a page's or region's content, a larger, quieter icon, centred text and action, centred vertically in the height the application gives it; an error keeps its error icon color. `start` stays the default for states inside cards, panels and dialogs.
- `Tabs` `size="compact"`: the whole rail as tall as a compact control, as a compact `SegmentedControl` is, for bars and toolbars; coarse pointers keep the touch height.
- `Rating`: a read-only rating as stars filled to the value in half steps in the warning tone, the rest in the strong border color, named once as an image ("4.5 out of 5 stars", `formatLabel`), with `max` and `showValue`; a half star fills its inline-start half, also in right-to-left text.
- `ColorSwatch`: a round, decorative sample of a color; as a `Button`'s start icon it takes the icon's size, as on a button that opens a `ColorPicker` in a `Popover`.

### Changed

- Inline code, code blocks and code diffs use the Pierre code themes, the ones Diffs uses: Pierre Light in the light app theme, on the theme's own light grey so code stands out on the white canvas, and Pierre Dark in the dark one. Code follows the app theme instead of staying dark.
- A code block's copy button is a quiet icon button.
- The primary action in the dark theme takes the link's soft blue with dark text instead of the light grey, so the dark theme carries the same blue emphasis as the light one. Everything that uses the primary colors follows, such as the chosen segment of a `SegmentedControl`.
- A counter in a button, such as a tab's count, keeps its own filled pill, neutral or accent; only on the solid primary and important fills does it take the button's text color as an outlined pill, as a badge does.

### Documentation

- The Code page covers code diffs and the code themes; a new Rating page; the color picker page shows the swatch; the badges and counters page covers the diff count; the empty state and tabs pages cover centred states and compact tabs; the setup page names the diff entry and its peers.

## 0.6.0 — 2026-10-15

Components for workspaces that track jobs and for tools that sit beside a page: docked panels, comboboxes, date and time fields, calendars, pagination, relative times, avatar groups and copy buttons; a hover card, a quiet text field and a quiet button, and Close all tabs in the document tab strip. A table with a sticky header no longer swallows the wheel.

### Added

- `Combobox`: a text field that filters a list of options as people type, to choose one option or, with `multiple`, several. Options have a `label`, an optional muted `description` and `leading` content such as an `Avatar` or an icon, which takes the size of its slot; they can be `disabled` or grouped under headings. The default filter matches the label and the description, ignoring case and accents; `filter` replaces it, and `filter={null}` with `onInputValueChange` and `loading` shows options the application finds itself, such as on a server, while chosen options keep their labels. `onInputValueChange` receives the typed text, and an empty string once the query ends: when the text is cleared, or when the field shows its chosen label again after a choice or as people leave the query, so results for an abandoned query never stay for <kbd>Enter</kbd> to choose. The first match is highlighted, also when options arrive after typing, so <kbd>Enter</kbd> chooses it; `emptyLabel` (No matches) and `loadingLabel` (Loading…) show in the popup, where the loading label is announced while the list is busy. Chosen options of a multiple combobox are chips in the field: <kbd>Backspace</kbd> in the empty text removes the last one, the arrow keys reach them, and each has a remove button named after its option (`removeLabel`); `onValueChange` receives an option for every value, in the same order, with `{ value, label: value }` for a value the field never saw among `items`. The field is the shared text field, with a floating `label`, `hint`, `error`, `required`, `disabled`, `readOnly`, `placeholder` and `showLabel`, and `density="compact"` for the 2 rem height of a compact `Select`, where `Input` has `compact`. With `clearable`, a clear button, <kbd>Esc</kbd> on a closed single field and emptied text remove the value; with nothing to clear, and on chips always, <kbd>Esc</kbd> changes nothing and goes on to close an enclosing dialog. Focusing a single combobox selects its label, so typing replaces it. The popup is `Select`'s raised popup, with rounded options inset by its padding and a check mark on chosen options; it scrolls beyond 20 rem, flips above the field near the edge of the window and keeps the originating theme, also inside a `Dialog`. `name` submits the value, or one entry per chosen value, a native form reset restores `defaultValue`, and `onValueChange` also receives the chosen option or options.
- `PanelDock`, `PanelDockHeader` and `PanelDockControls`: panels docked to the bottom inline-end edge of a region, beside the page, for items people work on alongside it, such as drafts and conversations. Open panels sit side by side on the dialog surface, shrinking in proportion down to their minimum widths before the row scrolls sideways and keeps the newest in view; a maximized panel fills the region behind them; minimized panels wait as chips in a strip named Hidden panels, each a button named Show and the panel's label beside a close button, with an optional icon, an attention dot described for assistive technology and a tooltip. The application controls the panels through `panels`, `onModeChange`, `onClose`, `onActivate` and `onHeightChange` and renders their content, which mounts once and keeps its state, focus and scroll positions through every change of mode and order, so a panel can hold an unsaved draft; content that scrolls itself as panels move keeps its own position. The top edge resizes an open panel by dragging, or with <kbd>↑</kbd> and <kbd>↓</kbd> (16 px, 64 px with <kbd>Shift</kbd>), <kbd>Home</kbd> and <kbd>End</kbd>, within its bounds and the region, and reads its height as a share of the room; a drag ends when the edge goes, as when the panel is maximized meanwhile. With `overflow="minimize"`, open panels that cannot all fit at their minimum widths make room instead of the row scrolling: the dock asks `onModeChange` to minimize the least recently active open panel until the rest fit, never the active panel, the newest, such as one just brought back from its chip, or the one that holds focus; where those cannot fit by themselves, the row scrolls instead. The dock waits for each answer, also one given in a transition or after an asynchronous step; a panel the application keeps open for 5 seconds, or opens again itself, stays until the region changes size, and the dock asks for the next one. Once the region widens and a panel the dock minimized fits again at its width while open, the dock asks to open it again; room that people free brings no panel back, and panels people minimize stay chips. Below `stackBelow` (40 rem by default) one panel at a time fills the region like a sheet, and a chip shows its panel there, also without `onActivate`, until another panel becomes active or the dock widens, while a panel that opens meanwhile shows in its place; the dock then has `data-stacked`, and `onStackedChange` reports each change. Focus follows the panels: a panel that hides hands focus to its chip, a panel brought back takes it again, scrolled into view where its content hid it, and focus outside the dock stays there. `PanelDockHeader` lays out a sticky title and metadata, the application's actions and the window controls: Minimize, Maximize or Restore, and Close as compact icon buttons with tooltips. In a panel too narrow to keep about 10 rem of title beside them, they take a row of their own above the title, which wraps between words. The content's scroll padding follows the header's height, so a control that takes focus beneath it comes out below it, and once the content scrolls beneath the header, a hairline sets it apart, also where the header sits in a form that holds the content. Panels and chips play their entrance as they show, not as a reorder moves them. Labels localize the dock: `minimizedLabel`, and `showLabel`, `closeLabel` and `resizeLabel`, functions of each panel's label or title, while `PanelDockControls` takes plain strings for its one panel.
- `AvatarGroup`: overlapping avatars for a set of people in the four `Avatar` sizes, with `max` avatars shown and an overflow chip that counts the rest, such as +2, and lists their names in its `Tooltip`, followed by N more (`formatMore`) for people counted in `total` but not passed. The chip is a tab stop, so the keyboard reaches the names too, and an image named by those names for assistive technology. The group is named with the count and every name by default, such as "3 people: Alex Morgan, Sam Lee, Priya Shah"; `formatLabel` writes that name in another language. A `total` or `max` that is not a count, such as NaN, an endless total or a null max, counts and shows everyone passed. `onPersonClick`, or a person's `href` through `LinkProvider`, makes each avatar a button or link named after the person, with the name in a tooltip, which comes in front of its neighbours on hover and keyboard focus. A ring in the color of the surface below separates the avatars: the envUI surface it sits on, such as a `Card`, or the canvas, and `--avatar-group-ring` for any other fill. A standard group is as tall as 2 rem compact controls; on touch screens pressable avatars keep 1.5 rem uncovered, and right-to-left text runs the avatars from the right.
- `RelativeTime`: a moment in a `time` element as text relative to now, from `Intl.RelativeTimeFormat`, such as "in 2 days", "3 hours ago" or "just now", for past and coming moments. It rounds to the nearest unit, from minutes to years, in the `long`, `short` or `narrow` `format` and any `locale`, with `nowLabel` for the moments under 45 seconds away, and shows the date and time in a `Tooltip` on hover unless `tooltip={false}`; inside an application's own `Tooltip`, that one describes it instead. One shared clock keeps every time on the page current: every second while a moment is less than a minute away, every minute below a day and every hour beyond, and at once when a hidden page shows again; only times whose text changed render again. `now` fixes the moment to compare with, for tests and server rendering; an invalid one is ignored. Server output hydrates without a mismatch error even where the server's clock or language differs from the browser's, and then shows the browser's text. `formatRelativeTime(value, options)` returns the same text as a string, and also ignores an invalid `now`.
- `CopyButton`: copies a string, or what a function returns, also as a promise, with the asynchronous Clipboard API, and falls back to copying a selection of a hidden field where the page has no clipboard access, also inside a dialog. It is icon-only with a required `aria-label`, which its tooltip shows, also while disabled, or a labelled button with visible children (`CopyButtonLabel`; children of false or null leave it icon-only, so they need `aria-label` too); without a name of its own, such as with an empty label or a blank `aria-label`, it is named Copy (`copyLabel`), and a label without words leaves it icon-only, with that name in its tooltip, in the `Button` variants and the surrounding density, and `size="compact"` gives it the 2 rem height anywhere. After a press the icon turns into a check, and "Copied" shows in the tooltip and is announced for about two seconds, or "Couldn’t copy" (`copiedLabel`, `failedLabel`), also when a promised text fails. `onCopy` receives the text; `preventDefault` in `onClick` skips the copy.
- `Pagination`: a compact pager for toolbars in a named navigation landmark: the range of items shown, such as "1–60 of 245", or "61–120" without `total`, where `hasNextPage` ends the list, then previous and next `IconButton`s with their names in tooltips (`previousLabel`, `nextLabel`). `page` counts from 1 in pages of `pageSize`, and `onPageChange` receives the page before or after it. While `pending` the button pressed shows a spinner and both wait, also when the application starts the load in an effect after the page changes, and the buttons at either end stay focusable, so focus is never lost; the range is announced as it changes. `formatRange` writes the range in another language, `hideWhenSinglePage` hides a pager with one page, and `size="compact"` gives 2 rem buttons outside a compact surface. In a toolbar the pager keeps its line while fields beside it shrink.
- `DateTimeField`: a field for a day as `YYYY-MM-DD`, or with `withTime` a local date and time as `YYYY-MM-DDTHH:mm`, also before 1970, that shows the value in its `locale` in the Gregorian calendar (`formatOptions` adjusts it) and opens a calendar on the `Popover` surface from the field, its label or its calendar icon, or with <kbd>↓</kbd>; pressing the field or its label again, or <kbd>Esc</kbd>, closes it and returns focus to the field. The calendar keeps the field's text direction. `min` and `max` make the days outside them unavailable and keep values within them, and `defaultTime` starts a newly chosen day. With `withTime` the calendar has a time field, Now and Done; otherwise Today; with `clearable`, Clear and a clear button in the field. It is the shared text field, with `Input`'s `label`, `hint`, `error`, `required`, `disabled`, `readOnly`, `placeholder` and `showLabel`, `aria-label` or `aria-labelledby` without a label, and `density="compact"` for the compact height, where `Input` has `compact`; `name` and `form` take part in native forms, which reset an uncontrolled field, and a read-only field is not validated. The calendar fits a phone's width.
- `Calendar`: a month of days to choose one from, following the WAI-ARIA date picker: the arrow keys move by day and week, also in right-to-left text, <kbd>Page Up</kbd> and <kbd>Page Down</kbd> by month and with <kbd>Shift</kbd> by year, <kbd>Home</kbd> and <kbd>End</kbd> to the ends of the week, and <kbd>Enter</kbd> or <kbd>Space</kbd> chooses; a key that keeps the day leaves focus alone. Today has a ring and the chosen day a solid fill; days outside `min` and `max` are unavailable, and the month buttons stop at them. `weekStart` is the locale's by default, or Monday where the browser cannot tell, and the month and weekday names and day numbers come from `locale`, naming Gregorian months also in a locale with a calendar of its own. Named with `aria-label` or `aria-labelledby`, it is a group around the month's grid. Six weeks keep its height from month to month, empty cells keep each day under its weekday, also for assistive technology, and days take the touch size on coarse pointers. Rendered on a server without `locale`, a calendar or date field writes British English, and a calendar without a value leaves its days, and where its month buttons stop, to the browser; once hydrated, they show the reader's language, week and today, without a mismatch error.
- `Button`, `IconButton` and `ConfirmButton` `variant="quiet"`: an action in the application's chrome, such as a sidebar toggle or the actions of a toolbar or of a section inside a surface. The icon, or label, takes the quiet icon color, darkens to the text color over a state layer on hover and press, and shows the shared focus ring, without a fill or border, in both themes; an armed `ConfirmButton` is destructive, as with its other variants. Other variants are unchanged.
- `SegmentedControl` `fullWidth`: the rail fills its container and splits it evenly between the options instead of scrolling; a label too long for its share ends with an ellipsis and shows whole in a tooltip on hover and keyboard focus, or wraps onto more lines on touch screens, where tooltips do not show, while its accessible name stays whole.
- `ButtonGroup` `fullWidth`: the group fills its container, such as a sidebar: in a row, labelled buttons share the room the icon-only ones leave, which keep their square size, and a row of icon-only buttons shares it evenly; in a column every button is as wide as the group. An application no longer styles the group itself to fill.
- Color tokens `--color-calendar-selected`, `--color-on-calendar-selected` and `--color-calendar-today`, for a calendar's chosen day and today in both themes, each at least 3:1 against the surface.
- `DocumentTabs` `onCloseAll`: the strip and each tab open a compact context menu on right click, long press, the <kbd>Menu</kbd> key and <kbd>Shift</kbd>+<kbd>F10</kbd>, with Close all tabs, which calls it; on a tab, the menu first offers closing that tab through `onClose`. When the tab that had focus closes from the menu, focus moves to the tab that becomes active. `closeAllLabel` and `contextMenuLabel` localize the item and the menu's name. Without `onCloseAll`, the strip keeps the browser's own context menu.
- `Input`, `SearchField` and other text fields take `variant="quiet"`: only the text and the start icon at rest, with no border, underline or fill; a soft fill under the pointer and while focused; the placeholder clears once the field has focus. For a search at the top of a sidebar or a list.
- `HoverCard`: supplementary details beside a trigger such as a link, like a link preview, on `Popover`'s raised surface, padding and type, in two widths. It opens once the pointer rests on the trigger for `delay` (600 ms) and at once on keyboard focus, stays open while the pointer moves onto it so its text can be selected, and closes `closeDelay` (300 ms) after the pointer leaves the trigger and the card, or with <kbd>Esc</kbd>. Focus stays on the trigger, and the card is not announced as a dialog. It keeps the originating theme, flips at the window edge and sits above dialogs; `open`, `defaultOpen` and `onOpenChange` control it.

### Documentation

- New pages for comboboxes, date & time fields, the panel dock, pagination and relative time; selects and text fields link to the new field pages.
- The avatar page has a section on `AvatarGroup`, and the buttons page one on `CopyButton`.
- The migration guide describes vendor widgets without naming them.

### Fixed

- A `Table` with `stickyHeader` no longer swallows the wheel: over a region without a height of its own, or scrolled to an end, the wheel scrolls the page again (it stopped in Chromium).

## 0.5.0 — 2026-10-14

Components for document-centred desktop applications and data-heavy dashboards: a file tree, editor tabs, quick open, context menus and a resizable sidebar; sortable, resizable tables, key figures, a heatmap, conversation messages and split views; with badges, notices and other everyday pieces.

### Breaking changes

- A document root themed through `ThemePreferenceProvider` or the bootstrap script keeps the browser's font size, so 1 rem is 16 px by default instead of 15 px and envUI renders at its designed size, no longer a sixteenth smaller. Migration: an application's own rem-based CSS on such a root grows by about 7%; multiply its rem values by 0.9375 to keep their earlier size. The document body takes envUI's body type at zero specificity, so an application's own `body` rule outside cascade layers styles the body element and the text that inherits from it outside envUI's themed boundaries; paragraphs and headings take envUI's type anywhere under a themed root, and envUI's type, with a unitless line height, applies inside the boundaries: the provider's boundary, a `Theme` and envUI's popups. A rule inside `@layer` loses to envUI's unlayered style sheet. Migration: an application that set its typeface, font size or line height with a `body` rule no longer reaches its content inside the provider that way; set envUI's font tokens, such as `--font-family`, `--font-size-body` and `--line-height-body`, for `.env-theme` in a style sheet that loads after envUI's, or style that content directly.

### Added

- `AppShell` `sidebarContent`: the application's own content below the navigation, which fills the remaining sidebar height and scrolls itself; hidden while the sidebar is compact.
- `AppShell` `resizable`: the expanded sidebar's edge becomes a resize handle for the pointer and the keyboard (<kbd>←</kbd> and <kbd>→</kbd> by 16 px, 48 px with <kbd>Shift</kbd>, <kbd>Home</kbd> and <kbd>End</kbd>), between `sidebarMinWidth` and `sidebarMaxWidth` (12 and 32 rem by default). `sidebarWidth` and `onSidebarWidthChange` control the width; otherwise it persists under `storageKey`. `AppShellSkeleton` accepts the same `resizable` and bounds.
- `ContextMenu`: actions for an area on right click, long press, the <kbd>Menu</kbd> key and <kbd>Shift</kbd>+<kbd>F10</kbd>, with the target element passed to its content; `open`, `onOpenChange` and `anchorPoint` open it programmatically.
- `MenuItem` `description`, `shortcut` (shown as `Kbd` keys, with arrows announced by their key names) and `trailing`; `MenuGroup`, `MenuRadioGroup`, `MenuRadioItem` and `MenuCheckboxItem`.
- `Tree`: a virtualized WAI-ARIA tree for thousands of rows, with keyboard navigation, type-ahead, preview and open callbacks, a context menu and two densities. Keys pressed with <kbd>Alt</kbd>, <kbd>Ctrl</kbd> or <kbd>⌘</kbd> are left to the application, such as <kbd>Alt</kbd>+<kbd>←</kbd> for going back.
- `DocumentTabs`: closable editor-style tabs with preview tabs, pinning, closing with <kbd>Delete</kbd> or a middle click, and a strip that scrolls sideways. However the focused tab closes, focus moves to the tab that becomes active. Keys pressed with <kbd>Alt</kbd>, <kbd>Ctrl</kbd> or <kbd>⌘</kbd> are left to the application.
- `CommandPalette`: a quick-open dialog near the top of the window, on the dialog surface, with grouped options rounded like `Select` options, keyboard highlight, modifier selection and key `hints` shown as `Kbd` keys.
- `SegmentedControl`: one choice among a few options on a pill rail, with counts and icons.
- `Badge` in six tones and three variants, `Counter`, and `NavigationItem` `trailing` content (a dot while icon-only). In a button, such as a selected tab, a counter or badge takes the button's text color as an outlined pill, so it keeps the button's contrast in both themes.
- Status tone tokens `--color-tone-neutral`, `--color-tone-accent`, `--color-tone-success`, `--color-tone-warning`, `--color-tone-danger`, `--color-tone-done` and `--color-on-tone`, with at least 4.5:1 contrast on the canvas, panes and rows in both themes.
- `Notice`: an inline banner in four tones with an action, a round dismiss button in its tone and `announce` for alerts.
- `Popover`: a floating panel with a title, two widths and a close function for its content.
- `Table` with `TableHead`, `TableBody`, `TableRow`, `TableHeaderCell` and `TableCell`: density, where compact tables give the controls in their cells the compact height, sticky headers, numeric cells and a focusable scroll region, which keeps content positioned in cells, such as visually hidden text, from widening the page.
- `Row` `interactive`: a grouped row that opens something through a link or button inside reacts to hover, keyboard focus inside it and presses, like a clickable card. The link or button marked `data-row-target` covers the row, so a press anywhere on the row follows it; the row shows a press on it, not on the row's other controls.
- `Breadcrumbs`, with `wrap={false}` for a trail that stays on one line in a bar or header, and `Kbd`.
- `Markdown` `components`, `remarkPlugins` and `rehypePlugins`; application overrides win and attributes such as heading ids reach the elements. Raw HTML is dropped before any rehype plugin runs, so it stays ignored, except keys written as `<kbd>Ctrl</kbd>`, which render as `Kbd`.
- `Dialog` `size="wide"` (about 44 rem), also for right panels, and `placement="top"`.
- `Menu` and `ContextMenu` `density="compact"`: the desktop dropdown for dense surfaces. It takes the raised popup of `Popover` and `Select`, with small corners, 1.75 rem rows that highlight on hover and keyboard focus, labels that line up whether a row has a check mark, an icon or neither, shortcuts as small muted `Kbd` keys, hairline separators and small group labels. A compact `Tree` opens a compact context menu.
- `MenuSubmenu`: a row that opens a nested menu beside it, on hover and with <kbd>→</kbd>, <kbd>Enter</kbd> or <kbd>Space</kbd>, closing with <kbd>←</kbd> and <kbd>Esc</kbd>. Submenus nest, flip at the window edge, line their first row up with the row that opened them and take the density and theme of their menu. `open`, `defaultOpen` and `onOpenChange` control them, for example to load their items as they open.
- `Menubar` and `MenubarMenu`: an application menubar of compact text triggers, each opening a compact menu; once one is open, hovering another trigger or <kbd>←</kbd> and <kbd>→</kbd> switch menus, and opening one neither locks scrolling nor shifts the page. After a command, focus returns to where it was before the menubar took it, which `onOpenChange` reports as `previousFocus` for commands such as Copy. `accessKeys` adds desktop access keys: holding <kbd>Alt</kbd> underlines them, <kbd>Alt</kbd> with a menu's letter opens it, and <kbd>Alt</kbd> alone moves focus to the menubar and back.
- `Select` `density="compact"`: a compact trigger, and the compact menu's popup with a check mark on the selected option.
- `AppShell` and `AppShellSkeleton` `topbar="full"`: one row across the window, independent of the sidebar: the toggle, the context at its natural width, the title and the actions at the end. The sidebar then fits its navigation and sidebar content, and narrow windows give the context the room it needs.
- `AppShell` and `AppShellSkeleton` `titleBar`: the topbar is the window's title bar in installed web apps and desktop shells that draw their own (the Window Controls Overlay). It takes the title bar area's height and its divider below, so the divider runs under the window controls too, at least `--title-bar-height` so a zoomed page keeps room for its controls, and leaves room for the window controls through `env(titlebar-area-*)`. It drags the window from empty space while its controls stay clickable, and makes its controls compact, with icon-only text buttons in the quiet icon color of the window controls; `--topbar-height` follows it. The shell fills the window and its content area scrolls below the title bar, with a stable scrollbar gutter, so the window controls never cover a scrollbar; the keyboard scrolls it as it would the document, where the browser does not already, with quick presses adding up and held keys repeating.
- `--app-sticky-top` on `AppShell`: the offset for content that sticks with `position: sticky`, the topbar height while the document scrolls and 0 in a title-bar shell's content area. `useAppShell().getScrollElement()` returns the element that scrolls the page content, for reading and restoring scroll positions; it changes once the shell is attached, so effects that depend on it run again with a title-bar shell's content area or a frame's scrolling element, and every copy of it returns the current element.
- `TitleBar`: the same window title bar without the shell, with start, centered and end content, and the `--title-bar-height` token (2.5 rem), the least height of a title bar and its height where the window reports no title bar area.
- `WindowFrame`: a window without the shell, such as a start page, filled by a title bar on top and content that scrolls below it, with a stable scrollbar gutter; `scrollRef` gives the scrolling element. Like a title-bar shell's content area, the keyboard scrolls it as it would the document.
- `Tabs` `fill`: the selected panel takes the height left below the list, for content that fills a region such as a diagram canvas.
- `Surface` `density="compact"`: the controls inside take the compact control height, for toolbars over dense content.
- `Code` `appearance="subtle"` and `Markdown` `inlineCode="subtle"`: inline code that follows the app theme as a quiet chip, for prose dense with identifiers.
- `TableHeaderCell` `sortDirection` and `onSort`: a sortable header is a button across its cell with an arrow for the order, `aria-sort` on the header, and a name that says what pressing it does, such as "Report sort ascending", from the header's text or its `aria-label` or `aria-labelledby` (`sortLabel` replaces it). The application sorts the rows.
- `Table` `resizableColumns`, with `columnWidths` or `defaultColumnWidths` in percent of the table width, `onColumnWidthsChange` and `minColumnWidths`: a handle at the end of each header cell moves the boundary to the next column without changing the table's width, by dragging or with <kbd>←</kbd> and <kbd>→</kbd> by 1 percent (5 with <kbd>Shift</kbd>), <kbd>Home</kbd> and <kbd>End</kbd>. Double-clicking a handle restores the starting widths. Widths alone fix the columns through a `colgroup`.
- `TableRow` `selected`: `aria-selected` and the navigation selection color, with a bar at the start of the row.
- `Table` `narrowLayout="stack"`: when the table's region is narrower than `stackBelow` (any CSS length or a number of pixels, 36 rem by default), each body row becomes a block on the table surface, titled by its first cell, with each `TableCell` `label` before its value in a column as wide as the longest label, up to 10 rem; long values wrap. The header row is visually hidden, and explicit roles keep the table's semantics. The region then has `data-stacked`, and `onStackedChange` reports each change, also when the table leaves while its rows stack, so an application can offer its own sort control while the header row is hidden. A hidden table keeps its layout until it shows again.
- `Input` `prefix` and `suffix`: short, non-interactive text inside the field before or after the value, such as the start of an address or a unit. They appear with the floating label once the field has focus or a value, are read after the label, work with `compact`, `startIcon` and `endAction`, and a long prefix is cut short with an ellipsis.
- `Slider`: a value in a range with a visible label, the current value as an output linked to it (`formatValue`, such as "40%", also for assistive technology), `min`, `max`, `step` and `largeStep`, `hint`, `disabled`, and `name` and `form` for native forms, which reset an uncontrolled slider. The arrow keys move by a step, <kbd>Page Up</kbd> and <kbd>Page Down</kbd> by a large step, <kbd>Home</kbd> and <kbd>End</kbd> to the ends; `onValueCommit` reports the value once a change is complete. The thumb grows on touch screens.
- `Composer`: the message field of a conversation, on the raised popup surface. It grows with its text from `minRows` to `maxRows`, then scrolls. <kbd>Enter</kbd> submits through `onSubmit`, or without it submits the field's form, once per press and not while `pending` or the action of an enclosing form is pending, <kbd>Shift</kbd>+<kbd>Enter</kbd> starts a new line and an input method's composition never submits; with neither, there is nothing to send. The round send button stays unavailable while the text is blank and becomes a stop button that calls `onStop` while `running`; `start` holds content such as an attach button, lined up with the field's text, and `footer` describes the field.
- `Message` and `MessageList`: conversation entries in a polite `log`, which reports `aria-busy` through `busy` while a reply streams in or earlier messages load. Messages `from="self"` are compact bubbles at the inline end in the row tone; messages from others are full-width content without a bubble, so long formatted answers read well. `author`, `meta`, small `actions` below the message, and a `sending` or `failed` `status` shown with an icon and text (`statusLabel`).
- `SplitView`: two panes side by side with a divider that resizes them, a focusable `separator` in a gutter. Drag it, or press <kbd>←</kbd> and <kbd>→</kbd> (2 percent, 10 with <kbd>Shift</kbd>), <kbd>Home</kbd> and <kbd>End</kbd>; a double click returns to `defaultSize`. `size` and `onSizeChange` give the start pane's share in percent between `minSize` and `maxSize`, `storageKey` keeps the chosen share, and another key brings the share stored under it, or the default; below the `stackBelow` width of the split view itself, any CSS length or a number of pixels, the panes stack without the divider; the split view then has `data-stacked`, and `onStackedChange` reports each change, also when it leaves while its panes stack. A hidden split view keeps its layout until it shows again.
- `Stat` and `StatGroup`: labelled key figures for dashboards. A stat shows its `label`, a large `value` in tabular digits (an `AnimatedNumber` works too), an optional muted `detail` and a `trend` with a direction icon and text in its tone: up is success, down danger and flat neutral unless `tone` says otherwise. `StatGroup` puts stats on one pane in as many even columns as fit, wrapping as space runs out; a phone keeps two columns, with figures that shrink to stay on one line. A group named with `aria-label` or `aria-labelledby` is exposed as a group.
- `FileDropzone`: a dashed drop target for files with an icon, a label and a description, which opens the file picker when pressed or with <kbd>Enter</kbd> and <kbd>Space</kbd>. Files dragged over it show a solid blue outline; `accept` filters dropped and chosen files, with `onFiles` for the files it takes and `onReject` for the others and, without `multiple`, those after the first. `pending` shows a spinner and takes no new files, `error` colors the outline and is linked to the zone, `compact` makes it one row, `name` submits the files with native forms, or `files` when the application keeps them, such as after a Remove action, and `inputRef` opens the picker from elsewhere, such as a Replace button beside the application's own preview. The same file can be chosen again.
- `Heatmap`: a calendar of daily values with weeks as columns and weekdays as rows, in `levels` color steps mixed from a `tone` into the canvas, or steps that start at `thresholds`, such as quantiles to color by rank, with month and weekday names and a Less–More legend. Every day is a named grid cell; the grid is one tab stop where <kbd>↑</kbd> and <kbd>↓</kbd> move by day, <kbd>←</kbd> and <kbd>→</kbd> by week, <kbd>Home</kbd> and <kbd>End</kbd> along the weekday, <kbd>Page Up</kbd> and <kbd>Page Down</kbd> to the ends of the week and <kbd>Ctrl</kbd>+<kbd>Home</kbd> and <kbd>Ctrl</kbd>+<kbd>End</kbd> to the range's ends. On touch screens the days are 24 px apart. A single `Tooltip`-styled popup follows the hovered, focused or tapped day, so a year renders without a portal per day; it closes when the pointer leaves the days, and a focused day's when the pointer moves elsewhere. People can move the pointer onto the tooltip of a day hovered or clicked with the mouse, which stays on its day while the pointer rests on it; the tooltip of a day focused from the keyboard or tapped takes no pointer, so it never blocks a press on what lies under it. <kbd>Esc</kbd> hides it wherever focus is, without closing an enclosing dialog; with <kbd>Ctrl</kbd>, <kbd>Alt</kbd> or <kbd>Meta</kbd> it leaves the tooltip and goes on, so an enclosing dialog closes. Narrow containers scroll the weeks, starting at the most recent. `startDate`, `endDate`, `maxValue`, `weekStart`, `formatValue`, `formatDate`, `formatTooltip`, `monthLabels`, `weekdayLabels`, `lessLabel` and `moreLabel` adjust and localize it.
- `ConfirmButton` `icon` with a required `aria-label`: a round icon-only button at rest, like `IconButton`, that grows when armed to show the confirm label beside its icon, so the consequence is still named; focus stays on it.
- `Tooltip` `side` takes `inline-start` and `inline-end`, which follow the text direction.

### Changed

- `ThemePreferenceProvider` follows theme changes made in other windows and tabs of the same origin.
- `Select`'s outlined trigger is the outlined `Button` style. The open list takes the `Popover` surface corners, with rounded options inset by its padding.
- `Dialog` shares the `Popover` look: the raised popup color and a hairline border. In the dark theme dialogs keep the pane color, through the new `--color-dialog` token. The title and description sit together above the content.
- The toast stack's count of hidden notices is a `Counter`. A dismissed notice steps out of the stack at once and fades where it was, so dismissing several in a row moves the stack once each, without jerking or flashing a scrollbar; a notice revealed from the hidden ones fades in.
- A collapsed `AppShell` sidebar no longer treats expanded tree rows as open popups, and stays expanded while a context menu opened from it is open.
- On narrow viewports the `AppShell` sidebar opens as a drawer at least 20 rem wide, or the window less 3 rem, instead of the measured navigation width, so `sidebarContent` such as a list of recent documents has room.
- An icon-only `NavigationItem` shows its label in a `Tooltip` at its inline end on hover and keyboard focus instead of a native title, which doubled an application's own tooltip; a disabled one shows it on hover. An application `Tooltip` around the item replaces it.
- A `Dialog` panel with `placement="right"` takes the whole width of a narrow window, such as a phone's, instead of leaving a sliver of the page beside it, with its content clear of the safe areas on both sides.

### Fixed

- While the document scrolls under the `AppShell` topbar, an element that takes keyboard focus, or an anchor target, lands below the topbar instead of under it, from the first paint: a zero-specificity rule in a cascade layer of envUI's gives the document scroll padding as tall as the topbar, which AppShell measures into `--env-app-topbar-block-size`, so scroll padding the application sets wins, unlayered or in layers declared after `envui-document`, such as with `@layer envui-document, base, utilities;`.
- `ThemePreferenceProvider` gives every `<meta name="theme-color">` the canvas color of the theme in use, including tags written for a system color scheme with `media`, instead of only the first tag.
- Text entered in `Input`, `Textarea`, `SearchField`, the `CommandPalette` search and the rich text and Markdown editors takes `--control-font-size`, 1 rem on touch screens, so mobile browsers no longer zoom the page when such a field gets focus. Resting labels, prefixes and suffixes match it.
- `Card` and `ActionCard` `meta` sits at the end of the heading row, also in right-to-left text, instead of right after the heading, where the text margin reset kept it.
- A `Textarea` with `sizing="content"` and `rows` starts at that many lines, such as one for a short reply, instead of at least 7.5 rem; without `rows` it still starts at 7.5 rem.
- Icon-only buttons keep their square size where their container is squeezed narrower, such as a slot beside long text in a flex row, instead of shrinking to nothing.
- Labels keep 4.5:1 contrast on hover, also in a selected tab on the tab rail: secondary buttons in the dark theme have a label as bright as primary text, outlined buttons in the light theme a deeper blue one, and selected navigation items a deeper blue label in light and a lighter one in dark.
- A `Tooltip` stopped opening on hover once its control became enabled or disabled, such as a back button once there is somewhere to go: it kept listening to the element the control had replaced.
- The toast region no longer throws where the Web Animations API is missing, such as in jsdom tests of an application: notices there move without motion instead of unmounting the page.

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
