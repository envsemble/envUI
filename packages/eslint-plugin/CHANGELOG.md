# @envsemble/eslint-plugin-envui

## 3.0.1 — 2026-11-21

No changes in this release.

## 3.0.0 — 2026-11-21

### Major Changes

- `configs.recommended` reports only envUI used wrongly. The rules that set the application's own policy, `no-html-elements` (envUI's components in place of plain HTML) and `label-vocabulary` (the words of envUI's writing guide), move to the new opt-in `configs.strict`, which extends `configs.recommended` and turns both on as errors. See [the ESLint plugin](https://github.com/envsemble/envUI/tree/main/packages/eslint-plugin#use).

  Breaking changes:

  - `configs.recommended` no longer turns on `no-html-elements` and `label-vocabulary`. To keep them, use `envui.configs.strict` in place of `envui.configs.recommended`, or turn either on yourself, such as `rules: { 'envui/no-html-elements': 'error' }`.

- `no-raw-graphics` no longer counts `start` and `end` as icon slots: they size only envUI's icons and a Graphic, so a raw `<svg>` or another package's icon in one, such as `<Button start={<Github />}>`, is reported, with the fix to wrap it in `<Graphic alt="">`. Its messages name IconButton's `icon` as the icon slot that sizes a raw `<svg>` or another package's icon, in place of Button's `startIcon`. See [no-raw-graphics](https://github.com/envsemble/envUI/tree/main/packages/eslint-plugin#no-raw-graphics).

  Breaking changes:

  - A raw `<svg>` with a fixed size or fill, or another icon package's icon, in a `start` or `end`, such as a List.Item's, is reported: write `start={<Graphic alt=""><Github /></Graphic>}`, or an envUI icon, such as `start={<IconFolder />}`.

## 2.1.0 — 2026-11-19

The rules report the real mistake and pass what works: a field with its own label in a list row, links beside a row's target, another icon package's icon in an icon slot, and an app's own words.

### Minor Changes

- `no-field-in-list-row` reports only a field with no `label`, `aria-label` or `aria-labelledby` in a `List.Item`'s `end`. Any field, a Radio or a RadioGroup can be a row's `control`, which the row names and describes, as it does a Switch or a Checkbox, so a settings row writes its label once: `<List.Item label="Theme" control={<Select items={themes} />} />`. A labelled field in `end`, such as `<SegmentedControl aria-label="View" />`, passes too. See [no-field-in-list-row](https://github.com/envsemble/envUI/tree/main/packages/eslint-plugin#no-field-in-list-row).
- `no-html-elements` no longer reports `role="tablist"` or `role="alert"`. envUI has no tabs component, so a tab list an app builds with the tablist, tab and tabpanel roles passes, and so does an app's own live message, such as a failed-load line inside a custom widget. See [no-html-elements](https://github.com/envsemble/envUI/tree/main/packages/eslint-plugin#no-html-elements).
- `label-vocabulary` takes an `allow` option: the words an application keeps as labels, such as `['Clone', 'Retry']` in a developer tool, where they are the domain's terms. See [label-vocabulary](https://github.com/envsemble/envUI/tree/main/packages/eslint-plugin#label-vocabulary).
- `no-link-in-clickable-row` reports a link in a List.Item only when the row itself takes the click, with `href` or `onClick`, and passes a link in a clickable `List.Item`'s `start` or `control`, as it did in `end`: those slots sit above the row's target, so an Avatar in `start` that links to the person's profile works beside a row that opens the item. Links beside an interactive row's or Card's `data-row-target` pass too, since they now stay clickable above it. See [no-link-in-clickable-row](https://github.com/envsemble/envUI/tree/main/packages/eslint-plugin#no-link-in-clickable-row).
- `no-raw-graphics` reports another icon package's icon, such as lucide-react's or react-icons', where it renders outside an icon slot or a Graphic, not its import, so a brand mark Material Symbols lacks can go in `<Graphic alt="">` or IconButton's `icon`. Only a negative margin on a Graphic is reported now, as making up for the file's empty edges; a margin that spaces it passes. See [no-raw-graphics](https://github.com/envsemble/envUI/tree/main/packages/eslint-plugin#no-raw-graphics).

## 2.0.0 — 2026-11-19

The ESLint plugin for envUI 2.0: new rules for links in clickable rows, fields in list rows and the writing guide's vocabulary, and `no-inline-layout` is removed. Each breaking change below says what to write instead.

### Major Changes

- **envUI 2.0.** This release removes and renames parts of the 1.x API, among them Tabs, LineArt, PanelDock and Panes' supporting pane. Each change in it lists what it breaks under its own "Breaking changes:" line, with what to write instead.

### Minor Changes

- Buttons and fields share one shape, and their default look is quieter:

  - **One corner for every control.** The new token `--env-radius-control` is the corner of every button, in each variant, of every text field, of the triggers of Select, Combobox and the pickers, of a Slider, and of a SegmentedControl's track. It follows the theme's `corners` setting, so `corners="sharp"` squares buttons and fields alike. Buttons are no longer pills, and icon buttons are rounded squares.
  - **Secondary buttons are a quiet fill.** A secondary button, and an IconButton without a variant, takes the translucent neutral fill, `--env-color-bg-neutral-muted`, with no edge, and its hover and pressed grades under the pointer and while pressed; an outline button keeps the thin edge. Its focus ring lies on its edge, as an outline button's does. It still joins a primary button in a ButtonGroup.
  - **A pressed toggle is gray.** Any Button or IconButton with `aria-pressed="true"` takes the selection fill, `--env-color-bg-selected`, which is neutral unless the theme's `selection` is `'accent'`, with `--env-button-selected` and `--env-button-selected-content` as its color properties. Toolbar.Button's toggles take it from Button now.
  - **Fields show their label above the box.** TextField, Textarea, SearchField, Select, Combobox, DatePicker, TimePicker and MonthPicker put their label above the field, as Field does, in the label size and the muted color. The field is a plain box with one edge and the control corners; focus draws the edge in the accent, twice as thick, inward, with no ring around it. A small field keeps the small height while its label shows, and a prefix or suffix always shows.
  - **Primary buttons are solid in dark.** A primary button takes `--env-color-bg-primary-strong` and its hover and pressed tokens, under `--env-color-fg-on-strong`, a white label, in every theme. In light the strong fill is the emphasis fill, so an area that recolors `--env-color-bg-primary-emphasis` recolors its buttons too; in dark it is a saturated blue, and the accent tone takes `--env-color-bg-accent-strong`. The dark emphasis fill, which checked checkboxes, switches that are on, radios, meters and spinners take with dark marks, is a stronger blue than before.
  - Every slot of these components renders through the Slot part, which places what it holds and never styles it: the label and description of a field, a Checkbox, a Switch, a radio and a RadioGroup, a DropZone and a ColorPicker; a field's start icon and end action; an IconButton's icon, a SegmentedControl item's icon and a ColorSwatch's label. Their slot parts are listed among each component's parts.

  Breaking changes:

  - `env-text-field-border`, the notched border of a field, is removed, with its legend: the edge is the field's box, `env-text-field-control`, itself.
  - `data-label-floating`, on the boxes of Select (`env-select-control`) and of the pickers (`env-date-picker-control`), is removed: the label no longer floats.
  - A field's label is no longer inside `env-text-field-control`: it is the field root's first child, above the box. Styles that placed the label in the box, or read it there, read `.env-text-field > label` instead.
  - A field's end action sits in a slot of its own, `env-text-field-end-action`, inside `env-text-field-end`; its start icon is the slot `env-text-field-start`, which no longer takes the accent while the field has focus.
  - TextField's and SearchField's `prefix` and `suffix` take a string, which the field cuts short with an ellipsis, rather than any content.
  - A SegmentedControl item's `label` and a Slider's `label` take a string, which they cut short with an ellipsis, rather than any content.
  - A field's description renders as a `div` rather than a `small`, so it can hold any content.
  - `--env-text-field-indicator` no longer colors the label, which stays in the label color while the field has focus.
  - Primary buttons read `--env-color-bg-primary-strong` and `--env-color-fg-on-strong` rather than `--env-color-bg-primary-emphasis` and `--env-color-fg-on-emphasis`; an area that recolors the primary fill in dark sets `--env-color-bg-primary-strong` and its hover and pressed tokens too. See [Customize](https://github.com/envsemble/envUI/blob/main/docs/customizing.md#recolor-an-area).
  - An IconButton that shows a ColorSwatch alone no longer drops its edge: it looks as every secondary icon button does.
  - Button's `[data-tone='neutral']` and DatePicker's `[data-label-hidden]` leave their components' listed states, as no style of theirs reads them now: a button still writes its tone, and a picker field with its label hidden still carries `data-label-hidden` on its root, as TextField lists it.

- The component pages are cut to reference, examples and a few lines of when to use. Each page in `docs/components/` keeps its frontmatter, with at most three short lines each of `useWhen` and `avoidWhen`, its running examples under their headings, the legends of its anatomy and variants figures, and the generated import, props, part names, color properties and strings; a page whose keys people can't guess keeps a short keyboard table. The rules, the essays on words and variants, the long do and don't galleries, the Compose sections and the changelogs are gone, and with them the examples that only illustrated them. Read what a component does from its props and its examples, in the package's `docs/examples/`.
- The patterns and the migration guide are removed from the docs the package ships and from the website.

  Breaking changes:

  - `docs/patterns/` and `docs/migration.md` are no longer in the package, and `docs/index.md` no longer lists them. Read a component's page, under `docs/components/`, and copy from its examples in `docs/examples/<page>/`; a page's `avoidWhen` names the component to use instead.
  - On the website, the Patterns section and every pattern's page are gone, with the pattern examples. The old addresses of the patterns and of the migration guide open the Docs' home.
  - The setup skill no longer says envUI is private, no longer points at patterns or a migration guide, and its AGENTS.md block no longer asks agents to propose an addition to envUI instead of writing a component of their own.

- **DocumentTabs looks like an editor's tabs.** The tabs sit on a strip a step from the panel's fill, on whatever surface DocumentTabs lies on, 35 px tall, each the size of its icon, label and close button, between 5 and 14 rem; an inactive tab has no box, only its icon and muted label; under the pointer it takes the default text color and a fill halfway from the strip to the active tab's, with its rounded top corners, and a neutral layer while pressed. The active tab takes the panel's fill with rounded top corners and curves into the panel below, with no line between them. DocumentTabs takes `children`, the active document, which it places as given in a panel under the strip, `env-document-tabs-panel`, around the slot `env-document-tabs-panel-content`, controlled and named by the active tab with square corners: the root, the strip and the panel fill their region, and only the active tab rounds. The root marks a first active tab with `data-first-active`, whose start side then has no fillet. The strip itself is the new part `env-document-tabs-strip`, inside the root. The behavior is unchanged.
- EmptyState is a component again, MessageList can follow a conversation, and the content and feedback components place what you give their slots without restyling it.

  - New: `EmptyState`, what a region shows when it has nothing to show: an optional `icon`, a `title`, an optional `description` and optional `actions`. It fills its region and centres in it, and is compact where the region is narrow. CommandPalette's empty state is now an EmptyState, its icon above its title.
  - New: `follow` on MessageList makes the list scroll by itself: it opens at the latest message, keeps it in view while the reader is at the end, and shows a Jump to latest button once they scroll away and more arrives (`jumpToLatestLabel`, or `messages.message.jumpToLatest`). Give it a height, such as the rest of a column above a Composer.
  - Composer's focus is its 1 px edge in the focus color, instead of a doubled accent border.
  - Message's `meta`, `actions` and content, Alert's message and actions, Composer's `start` and `description`, Disclosure's and Accordion's titles, and CommandPalette's footer and hint labels render through a slot that places their content and leaves its text, color and spacing to it. A text action at a message's edge no longer lines its icon up with the message.

  Breaking changes:

  - Message's `author`, MessageList's `busyAuthor` and Alert's `title` take a `string`; put richer content in `meta` or the message.
  - The state attribute `data-text` on `env-message-content` is removed; plain text is in the new part `env-message-text`.
  - The parts `env-command-palette-empty-icon`, `env-command-palette-empty-title` and `env-command-palette-empty-description` are removed; style the EmptyState's parts, `env-empty-state-icon`, `env-empty-state-title` and `env-empty-state-description`, inside `env-command-palette-status`.
  - Content in a message no longer loses the top margin of its first child and the bottom margin of its last; give formatted content its own spacing, as Markdown does.

- What an application had to add on its own is now envUI's:

  - **Focus after navigation.** In a Scaffold, when the page changes, focus moves to the title of the new page's PageHeader: as a level 1 PageHeader mounts after the Scaffold first showed, or as its title changes. People using a screen reader hear the new page, and the next Tab starts from it. The first load leaves focus alone, focus in a field or an open overlay stays where it is, and the title shows no focus ring. `focusOnNavigation={false}` on PageHeader leaves focus to the application.
  - **The body's margin.** In a document whose root envUI themes, as ThemePreferenceProvider and the theme bootstrap script do, envUI's style sheet sets `margin: 0` on `body`, in its lowest layer, so a Scaffold no longer sits inside the browser's 8 px margin and scrolls by 16 px. Any body margin of the application's own still wins, and an application can drop its `body { margin: 0 }`; a host page that only holds envUI elements keeps its own.
  - **VisuallyHidden**: content assistive technology reads and the screen doesn't show, such as words that complete a short label or a heading over a region whose purpose shows. `render` gives its element, a span by default.
  - **Tabular figures on Text**: `tabularNumbers` gives every digit the same width, for a countdown, a code or numbers in a column.
  - **RelativeTime says yesterday and tomorrow.** A moment a day or so away on the previous or the next calendar day reads "yesterday" or "tomorrow", in the locale's words, instead of "1 day ago" or "in 1 day". `formatRelativeTime` does the same.
  - **A code block without the highlighter.** `CodeBlock` and `Code` are in the main entry point, `@envsemble/envui`. CodeBlock shows its source as plain text and loads no highlighter, so a command to copy costs no syntax highlighting and needs no shiki.
  - **Toasts are statuses.** A notice is a status, and a danger notice an alert, inside the notifications region; neither is a dialog with a heading any more, so notices no longer add headings to the page's outline or dialogs to the accessibility tree.
  - The README says envUI is open source under the MIT license.

  Breaking changes:

  - `Code`, `CodeBlock`, `CodeProps` and `CodeBlockProps` move from `@envsemble/envui/code` to `@envsemble/envui`: write `import { Code, CodeBlock } from '@envsemble/envui'`.
  - `CodeBlock` takes no `language`: for highlighted source write `import { HighlightedCodeBlock } from '@envsemble/envui/code'` and `<HighlightedCodeBlock language="tsx">`, which takes CodeBlock's props and `language` (`HighlightedCodeBlockProps`). `@envsemble/envui/code` exports only HighlightedCodeBlock now, and only it needs shiki.

- Layout, navigation and overlays place what applications give them without styling it, close and stack the same way in every presentation, and fit their containers.

  - **TopBar** takes `start`, `title`, `center` and `end` content, each in a part that only places it. `center` is centered in the bar. A `title` given as text is semibold and cut short first; any other content keeps its own look, so a button there keeps its focus ring.
  - **PageHeader**'s `description` is no longer a paragraph, so a status line or any block content is valid there. Text in it still takes the smaller muted text. Its `breadcrumbs`, `start`, `meta`, `actions` and `toolbar` only place what they hold.
  - **NavigationDrawer** is `--env-navigation-drawer-width` wide and never wider than its container, with no fixed minimum, so it also lists a page's sections in a narrow column. A destination's new `end` holds a control of its own at the end of its row, outside its link, such as a delete IconButton; the row's fill reaches under it. Its `badge`, `header` and `footer` only place what they hold, as do NavigationRail's `header` and `footer`.
  - **The app frame keeps its own fill**: TopBar, NavigationDrawer, NavigationRail and NavigationBar take the default surface color, set apart from the page, as before; with `background="page"` they sit on the page's background and a Scaffold parts each from the body with a hairline. They now write `data-background` with either value. The current destination takes the selection tokens, neutral by default.
  - **Modals stack in the order they open.** A Dialog opened from a Sheet, or any modal from another, covers it with a backdrop of its own. Backdrops and modal surfaces share `--env-z-modal`.
  - A Dialog's, a Sheet's and a ConfirmDialog's `description` is no longer a paragraph.
  - DocumentTabs' `end` only places what it holds.

  Breaking changes:

  - TopBar's `actions` is renamed `end`: write `<TopBar end={…} />`. The parts `env-top-bar-actions` is gone; the end is `env-top-bar-end`, and the bar adds `env-top-bar-lead`, `env-top-bar-middle`, `env-top-bar-center` and `env-top-bar-title-text`, with `data-centered` on the bar. An `img` or `svg` in TopBar's or PageHeader's `start` is no longer sized for it: use a Graphic.
  - NavigationDrawer's part `env-navigation-drawer-branch-row` is renamed `env-navigation-drawer-row`, which also holds a destination with an `end`. A drawer is no longer as wide as its longest destination between 15 and 20 rem: it is the drawer width, 17.5 rem, within its container.
  - Breadcrumbs' item `label` is a string.
  - A Dialog's, a Sheet's and a ConfirmDialog's `description` renders a `div` rather than a `p`, so it can hold any content.
  - `--env-z-backdrop` is now only a backdrop in the page; modal backdrops are at `--env-z-modal`.

- The lint packages report only what is always wrong, every rule as an error, and each message says what to write instead and how to import it.

  Breaking changes:

  - ESLint: `envui/no-inline-layout` is removed; delete it from your configuration and from any disable comment.
  - ESLint: `no-html-elements` messages no longer end with "propose an addition to envUI"; Base UI's components (`@base-ui/react`) are never reported, and `--fix` turns a raw `<button>` with a written `type`, a text label and only attributes Button passes on into `Button`, adding its import.
  - ESLint: `no-raw-graphics` passes an `<img>` of the application's own image, a relative or root-relative `src` or an imported image file, such as a brand logo; remote and computed images are still reported.
  - ESLint, new: `envui/no-link-in-clickable-row` reports a raw `<a>`, a `Link` or a `variant="text"` Button inside a `List.Item`, `Table.Row` or `Card` that takes the click itself; move the action into the row's `end` slot as a Button, or into a Menu.
  - ESLint, new: `envui/no-field-in-list-row` reports a field, such as a `Select`, `TextField`, `SegmentedControl`, `Slider` or `RadioGroup`, in a `List.Item`'s `control` or `end`: a list row holds a Switch or Checkbox its label names, and a field goes in a form with its label above it.
  - ESLint, new: `envui/label-vocabulary` reports the label of an action, such as a Button's text or a Menu.Item's `label`, that is a word the writing guide's vocabulary replaces, such as "Log in" (write "Sign in") or "Modify" (write "Edit"); the table qualifies the words that a label may rightly use, such as "Send" and "Next", and those pass.
  - Stylelint: px is reported by `envui/no-px` instead of `unit-disallowed-list`; rename it in your overrides and disable comments. `--fix` writes rem at a 16px root, apart from hairlines of 1px or less.
  - Stylelint, new: `envui/no-off-scale-values` reports a rem or px length in `gap`, `padding`, `margin`, `inset` or a border radius and names the step to write, such as `var(--env-space-2)` for `0.5rem`, or `var(--env-radius-full)` for a pill; other units pass.
  - Stylelint, new: `envui/no-unknown-custom-properties` reports an `--env-*` name envUI doesn't define and names the nearest one; name the application's own properties outside `--env-`, such as `--app-…`.
  - Stylelint, new: `envui/no-contrast-breaking-pairs` reports `color: var(--env-color-fg-on-X)` on a background that isn't an X fill, a text color token as a background, and a fill token as a text color.
  - Stylelint, new: `envui/no-focus-outline-removal` reports `outline: none` or `outline: 0` on `:focus-visible` when nothing in the style sheet draws another ring.

  The way to let code that draws its own controls through, such as a canvas editor or an adapter, is to turn a rule off for those files in the configuration.

- Lists, trees, tables and cards place what their slots hold without styling it.

  - **List rows keep their joined tiles**, with the small gaps and the shared outer corners, and in a muted Surface that holds only lists they take the raised fill. A row's `end` and `control` lie above its `data-row-target`, so a trailing IconButton or Menu in an interactive row takes its own press.
  - **The current List row** takes the selection's fill and medium text, so it stays apart from a hovered row now that the selection is neutral; a Tree's selected row has a medium label for the same reason.
  - **A clickable row or card takes the click and shows hover and press by its fill alone.** A Link or text Button marked `data-row-target` reads in the row's text color, never in the link color, and doesn't underline or take a press fill. An interactive Card no longer shrinks while pressed.
  - **Table is a shell for rows of anything**: the frame, the rows, their states and their layout are the table's, and its cells place what they hold as given. It lies framed on the raised surface with its header on the shaded band and hairlines between the rows. The new `plain` prop on `Table.Root` drops the frame, the surface and the band for a hairline under the header and between the rows. In an `interactive` `Table.Row`, a link or button marked `data-row-target` stretches over the row, so a click anywhere in it follows the link, and the row shows its focus ring; the row's other links, buttons and fields stay clickable above it. A selected row lays the selection over the surface the table lies on. A cell no longer sets a `Text variant="caption"` on one line under the main text or a Link in the text color: mark the row's own link `data-row-target`, and style the cell's content as you need. A table nests in a full-width `Table.Cell colSpan`, such as a row's parts under it: the outer table's styles stop at the nested one, which follows its own props and its own narrow layout, and the rows of several `Table.Body` sections are parted like any rows.
  - **List.Item, Tree, Card, Table and the rows of Select, Combobox, Menu and the command palette render their slots through one Slot part**, which places the content and never clips, cuts short or recolors it: List.Item's `start`, `label`, `children` and `end` (`env-list-item-start`, `env-list-item-label`, `env-list-item-extra`, `env-list-item-end`), Tree's `end` (`env-tree-end`), Card's `actions` (`env-card-actions`, inside `env-card-footer`) and a stacked Table cell's content (`env-table-cell-content`). A List.Item's description is its own part, `env-list-item-description`.
  - **A Tree row keeps its label before its end**: the description gives way first, and an `end`, such as a Badge, that doesn't fit beside the label leaves the row whole instead of squeezing the name. The label ends with an ellipsis only where the row is too narrow for it alone.
  - A Badge on a selected row keeps its own colors: rows no longer lay its tint over another surface.

  Breaking changes:

  - `TreeItem.label` and `TreeItem.description` are `string`: the tree cuts them short itself. `TreeItem.textValue` is gone; type-ahead matches the label.
  - Badge's `children` is a `string`: write ``{`${count} seats`}`` instead of `{count} seats`.
  - The List.Item description is a `div` with the class `env-list-item-description`, no longer a `small` inside `env-list-item-content`; the drag handle, `env-list-item-handle`, is a child of the row, no longer inside `env-list-item-start`. List.Item no longer sizes an `svg` or `img` given straight to `start`: give it an Icon or a Graphic.
  - The rows of popup lists lose the `env-list-row-shortcut` part; keys go in the row's end.

- envUI's foundations, layout, navigation and overlays modules, its shared internals, its entry points and its style sheets ship without comments, apart from the doc comments of the public API and tool directives. What a comment explained is now in the names of constants, functions and private custom properties (`--_…`). Components, props, part classes, color properties and the default look are unchanged; a few prop descriptions in the reference are shorter.
- The ESLint plugin and the Stylelint config ship their code without comments, apart from the JSDoc types their JavaScript is checked with. Their rules, options and messages are unchanged.
- `--env-font-weight-medium` is 500 in both color schemes. Dark mode no longer lowers it to 460, so headings, titles and labels that lead keep the same step above body text as in light mode; on Windows, the lighter weight left them barely heavier than body text.
- Every `--env-*` custom property is now public: a token, a component's color property or a property listed under `properties` in `docs/generated/parts.json`. The layout values applications line up with are tokens, defined at the root of every theme in every scale:

  - `--env-page-gutter`: a Page's gutter, spacing step 4. A Page 37.5 rem or wider in its container keeps step 5, and a Page without a gutter none; inside a Page the token is the gutter it keeps.
  - `--env-page-width-sm`, `--env-page-width-md` and `--env-page-width-lg`: a Page's column widths, 40, 60 and 76 rem.
  - `--env-navigation-rail-width`: a NavigationRail's width, 5 rem.
  - `--env-navigation-drawer-width`: the width a resizable NavigationDrawer starts at, 17.5 rem; on a resizable drawer, the width it has.
  - `--env-panes-size` and `--env-panes-other-min`: the sized pane of Panes, 22.5 rem until people resize it, and the least width of the other pane, 16 rem.
  - `--env-sheet-width-md` and `--env-sheet-width-lg`: a side Sheet's widths, 24 and 44 rem.
  - `--env-dialog-width-md` and `--env-dialog-width-lg`: a Dialog's widths, 28 and 44 rem.

  `--env-avatar-dense` (Avatar) and `--env-spinner-color` (Spinner) are listed as public properties, as their docs already described them.

  Breaking change: the components' private custom properties, such as `--env-card-padding`, `--env-button-height`, `--env-surface-color`, `--env-icon-size` or `--env-popup-fill`, were never public and are gone; the components now use the tokens directly, and what they still keep for themselves takes the private `--_` prefix, which may change in any release. An application that set or read one sets a token instead, such as `--env-space-4`, or a component's color property, such as `--env-card-container`; `npm run lint:css` with `@envsemble/stylelint-config-envui` reports an `--env-*` name envUI doesn't define.

- **ResizeHandle, Panes and Sheet are three separate things.**

  - **ResizeHandle** is a component of its own, for any edge people drag or move with the keys to resize what is beside it, such as a sidebar: a separator with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and `aria-valuetext`, that the pointer drags and the arrow keys, Page Up, Page Down, Home and End move. It takes `axis`, `value`, `min`, `max`, `onChange`, `unit`, `step`, `largeStep`, `reverse`, `room`, `percentOf`, `valueText`, `disabled` and `label`, and is styled with a class like any element. Its track is invisible, with a grip of three dots at its middle; a 1 px line in `--env-color-border-default` shows along it under the pointer and while it is dragged, a 2 px line in the focus color with keyboard focus, CanvasText under forced colors. `grip={false}` turns the dots off. Sheet's, NavigationDrawer's and Panes' handles are this one.
  - **Panes only splits a region into two panes**: `Panes.Pane`, an optional `Panes.ResizeHandle` and `Panes.Pane`. One pane has a width of its own, the first by default or the last with `sized="end"`, and the other takes the rest. With `stackBelow`, a window class of Panes' own width, the panes stack below it, each half the height, and the handle hides; without it they always sit side by side. Each pane takes `label` and `header`, and Panes keeps `width`, `defaultWidth`, `onWidthChange`, `minWidth`, `maxWidth`, `persist` and `persistedWidth`. The handle sits on the seam with its grip and reaches only into the pane after it.
  - **Sheet** stays the panel that opens over the page; a pane that becomes a sheet in a narrow window is an application's own composition of Panes and Sheet.

  Breaking changes:

  - Panes' `behavior` and `splitAt` are gone, with the types `Behavior` and `SplitAt`: write `sized="end"` for a pane at the end that has the width, as the supporting pane had, and `stackBelow` for stacking in a narrow region. Panes no longer turns a pane into a sheet or shows one pane at a time: compose Panes with a [Sheet](https://github.com/envsemble/envUI/blob/main/docs/components/sheet.md) for that.
  - Panes' `open`, `defaultOpen`, `onOpenChange`, `closeLabel` and `backLabel` are gone, with the types `OpenChangeReason` and `OpenChangeDetails` and the messages `panes.back` and `panes.close`; an application keeps whether a pane shows and renders it or not.
  - `Panes.Main`, `Panes.Supporting`, `Panes.List` and `Panes.Detail` are one part, `Panes.Pane`, with `label` and `header`; Panes.Supporting's `closeButton` and `skeleton` are gone. `Panes.Trigger` is gone. `Panes.Divider` is `Panes.ResizeHandle`, with the same `label`.
  - The parts `env-panes-main`, `env-panes-supporting`, `env-panes-list`, `env-panes-detail`, `env-panes-divider`, `env-panes-back`, `env-panes-close`, `env-panes-backdrop` and `env-panes-trigger` are gone: a pane is `env-panes-pane` and the handle `env-panes-resize-handle`. The states `data-behavior` (`data-behavior='supporting'`, `data-behavior='list-detail'`), `data-split-at` (`data-split-at='medium'`, `data-split-at='expanded'`, `data-split-at='large'`), `data-open`, `data-closed` and `data-sheet-only` are gone; the root takes `data-sized` and `data-stack-below`.
  - The resize handle is invisible but for its grip, with no line at rest, and its grip keeps its color with keyboard focus, where a line in the focus color shows instead of an outline around the handle.
  - The token `--env-z-supporting-pane` is gone with the supporting pane's sheet: a layer of the application's own over the page takes `--env-z-sticky` plus one, or `--env-z-modal` for a modal one.

- Components that fill a region of the screen fill it edge to edge with square corners by default, and an application still rounds or spaces one with its own class, as any element: `.inbox { border-radius: var(--env-radius-lg); }` rounds Panes, and the panes inside follow its corners, since the root clips them. DocumentTabs' root clips to the radius it is given in the same way.

  Breaking changes:

  - **Panes sit side by side with no gap**: the panes touch, rather than 1 rem of the page apart; an application that wants them apart sets a margin or a gap on them.

- LineArt is gone: envUI no longer ships decorative drawings or their motion.

  Breaking changes:

  - `LineArt`, `lineArtDrawings` and the types `LineArtProps`, `LineArtDrawing` and `LineArtMotion` are removed, with the part `env-line-art`, its property `--env-line-art-duration` and its states `data-align` (`data-align='center'`, `data-align='end'`, `data-align='start'`); `data-drawing` (`data-drawing='ford-circles'`, `data-drawing='golden-section'`, `data-drawing='gothic-tracery'`, `data-drawing='graded-quadtree'`, `data-drawing='harmonic-division'`, `data-drawing='logarithmic-grid'`, `data-drawing='monochord'`, `data-drawing='pappus-chain'`, `data-drawing='pointed-arcade'`, `data-drawing='quartered-square'`, `data-drawing='root-rectangles'`, `data-drawing='root-two-halving'`, `data-drawing='sacred-cut'`, `data-drawing='square-circle-triangle'`, `data-drawing='triangle-and-circles'`, `data-drawing='whirling-squares'`); `data-motion` (`data-motion='appear'`, `data-motion='disappear'`, `data-motion='loop'`, `data-motion='play'`); `data-turn` (`data-turn='in'`, `data-turn='out'`). Draw an illustration of the application's own as an SVG in a Graphic instead.

- PanelDock is gone: docking, minimizing and maximizing panels is an application's own logic. A panel people keep open beside the page is a Sheet, or a pane of Panes.

  Breaking changes:

  - **PanelDock is removed**: `PanelDock.Root`, `PanelDock.Header` and their props, the types `PanelDockMode` and `PanelDockPanel`, the messages `panelDock` (`minimize`, `maximize`, `restore`, `closeWindow`, `minimized`, `open`, `close` and `resize`), its parts `env-panel-dock`, `env-panel-dock-row`, `env-panel-dock-panel`, `env-panel-dock-header`, `env-panel-dock-heading`, `env-panel-dock-title`, `env-panel-dock-meta`, `env-panel-dock-header-content`, `env-panel-dock-actions`, `env-panel-dock-controls`, `env-panel-dock-content`, `env-panel-dock-resize-handle`, `env-panel-dock-strip`, `env-panel-dock-tab`, `env-panel-dock-tab-label`, `env-panel-dock-tab-attention`, `env-panel-dock-tab-restore`, `env-panel-dock-tab-close` and `env-panel-dock-probe`, and its states `data-active` (`data-active=''`), `data-mode` (`data-mode='open'`, `data-mode='minimized'`, `data-mode='maximized'`), `data-placement` (`data-placement='row'`, `data-placement='fill'`, `data-placement='hidden'`), `data-panel-id`, `data-entering`, `data-attention` (`data-attention=''`), `data-filled` (`data-filled=''`), `data-overflowing` (`data-overflowing=''`), `data-resizing` (`data-resizing=''`), `data-scrolled` (`data-scrolled=''`), `data-stacked` (`data-stacked=''`) and `data-tabs` (`data-tabs=''`). Write the panels as the application's own, with a [Sheet](https://github.com/envsemble/envUI/blob/main/docs/components/sheet.md) for one beside the page or [Panes](https://github.com/envsemble/envUI/blob/main/docs/components/panes.md) for one in the layout.
  - A Scaffold's body no longer places a PanelDock across its scrollport.

- Tabs is gone: views of the same content switch with a [SegmentedControl](https://github.com/envsemble/envUI/blob/main/docs/components/segmented-control.md), and places to go are a NavigationDrawer or a NavigationRail. MarkdownEditor's Write and Preview are a small SegmentedControl above the source, in the new parts `env-markdown-editor-views` and `env-markdown-editor-view`. ESLint's `envui/no-html-elements` suggests SegmentedControl for an element with the role `tablist`, or DocumentTabs for documents people open and close.

  Breaking changes:

  - **Tabs is removed**, with `TabsProps` and `TabsItem`, its parts `env-tabs`, `env-tabs-list`, `env-tabs-tab`, `env-tabs-indicator`, `env-tabs-panels` and `env-tabs-panel`, its states `data-orientation` (`data-orientation='vertical'`), `data-active`, `data-placed`, `data-starting-style` and `data-ending-style`, `data-variant` (`data-variant='text'`), `data-size` (`data-size='sm'`, `data-size='md'`, `data-size='lg'`) and `data-fill` (`data-fill=''`, with `data-placed=''`), and its color properties `--env-tabs-container`, `--env-tabs-content`, `--env-tabs-selected-content` and `--env-tabs-indicator`. Write a SegmentedControl for the views and show the chosen one's content under it: `<SegmentedControl aria-label="Project views" value={view} onValueChange={setView} items={[{ value: 'summary', label: 'Summary' }, { value: 'activity', label: 'Activity' }]} />`, then `{view === 'summary' ? <Summary /> : <Activity />}`. A side list of sections is a NavigationDrawer.
  - MarkdownEditor's Write and Preview are radios in a SegmentedControl rather than tabs, so a test that finds them by the role `tab` finds them by `radio`, and the source and the preview are no longer `tabpanel`s.

- Rows of switches and checks name their control, and the rows around them look alike:

  - **A row names its control.** `List.Item` takes `control`: the row's Switch or Checkbox, at its end. Given no label of its own, the control takes its accessible name from the row's `label` and its description from the row's `description`, so a row needs no hand-wired ids and isn't read twice. A control with its own label keeps it. A field, such as a Select, a TextField or a RadioGroup, belongs in a form with its label above it; the new ESLint rule `envui/no-field-in-list-row` reports one in a List.Item's `control` or `end`.
  - **A titled group of rows.** `List.Root` takes `title`, a heading above the rows that names the list, `headingLevel` (2 by default) and `description`, a muted sentence under the title that describes it. New parts: `env-list-section`, `env-list-header`, `env-list-title`, `env-list-description` and the slot `env-list-item-control`.
  - **envUI's icons read `--env-icon-size`.** Every symbol icon is `--env-icon-size` square (the new part `env-icon-symbol`), so an icon in a `List.Item`'s `start` is the large icon size and centred on the row again, an icon in TopBar's and PageHeader's `start` the picture size, and elsewhere the control icon size rather than 1 em.
  - **Fields that apply at once commit.** TextField and SearchField take `onValueCommitted`, called with the value on Enter and when the field loses focus with a value that changed; with it, Esc puts back the value last committed. Return `false` from it to reject the value, such as a port out of range: the value stays in the field to correct, and Esc still puts back the last value accepted.
  - **Secondary and outline are told apart.** A secondary button is a quiet neutral fill, `--env-color-bg-neutral-muted`, with the control corners and no edge; an outline button keeps the thin edge.
  - **A white page in light.** `--env-color-bg-page` is white in the light theme rather than a mid gray, so the frame and the content on it read crisp, with a hairline between them. The surfaces on it are tinted a step deeper: `--env-color-bg-default` (panes, sheets, Surface) gray 2, `--env-color-bg-muted` (cards and filled rows) gray 4, `--env-color-bg-recessed` gray 6, and `--env-color-bg-field` the recessed gray 6, each with its hover and pressed grades a step deeper; `--env-color-bg-raised` and `--env-color-bg-popup` stay white and part from the page by their edge. Dark and high contrast are unchanged. An application that set `--env-color-bg-page` to white or a light gray can drop that.
  - **A lighter neutral selection.** `--env-color-bg-selected` and its hover and pressed grades are a step lighter in light (gray 11, 8 and 7) and in dark (gray 75, 80 and 84); a selected item keeps its second cue, its weight, bar or check.
  - The guidance of Select, RadioGroup, SegmentedControl and NavigationDrawer no longer sends a setting in circles: a setting with a few options is a Select in a form, RadioGroup is for options that need a sentence or must all stay in view, and SegmentedControl for views and filters.

  Breaking changes:

  - **RadioGroup lists its options one under the other by default**: `orientation` defaults to `vertical`, which no longer draws selectable rows; write `orientation="horizontal"` for options side by side. Each option is a radio before its label, with its description under the label: a 1.25 rem ring of `--env-color-border-default`, the primary color with a dot when chosen, in a 2.5 rem circle, the new part `env-radio-control`, that shows hover, focus and press as a state layer; the label keeps the text color and pressing it chooses the option. The rows' fill, tiles and corners are gone, with the color property `--env-radio-container`, and RadioGroup and Radio no longer take the `env-connected-rows` and `env-connected-row` classes, so those parts no longer have `data-orientation` (`data-orientation='horizontal'`, `data-orientation='vertical'`). `--env-radio-content` colors the label, and `--env-radio-selected` the chosen ring, dot and state layer. Radios don't go in list rows: for rows people switch on and off, put a Switch or Checkbox in each List.Item's `control`.
  - An envUI icon placed on its own is sized by `--env-icon-size` rather than 1 em of the text around it. To size one icon, set `--env-icon-size` on it or on its container.

- The guides are short, and the customizing and foundations pages are generated:

  - **Customize** (`docs/customizing.md`) is the styling contract of every component, generated from `docs/generated/parts.json`: its part classes, with the slots marked, its state attributes, its color properties and its public properties, beside the theme settings (`surface`, `selection`, `corners` in `defineTheme`), recoloring an area through the tokens, and the tokens layouts line up with.
  - **The foundations** (`docs/foundations/`) are their figures and a few sentences, with every token in a generated table: colors by role in light and dark, spacing, corners, controls and rows, type, icon sizes, window classes, layout widths, the stacking order and motion, each with its value in both scales and what it is for.
  - **Setup, Writing and Dev mode** keep what installs and runs with a few sentences around it. Writing keeps its vocabulary table, which `envui/label-vocabulary` reads, and a few lines on sentence case and the ellipsis on an action that asks for more.

- Themes take two settings for their look besides color and scale, on `Theme`, in the theme `ThemePreferenceProvider` takes, and from `useTheme()`. Each boundary writes them as `data-env-selection` and `data-env-corners`, nested Themes and popups keep them, and they work through the tokens, so every component follows:

  - `selection`: `'neutral'`, the default, or `'accent'`. **The selection is neutral by default now**: `--env-color-bg-selected`, `-hover` and `-pressed` are a gray deeper than the surfaces in every theme and contrast, and `--env-color-fg-on-selected` is the default text color. The blue selection is `selection="accent"`, and its values are the new tokens `--env-color-bg-selected-accent`, `-accent-hover`, `-accent-pressed` and `--env-color-fg-on-selected-accent`. An application that overrode the four selection tokens to make them neutral can drop that.
  - `corners`: `'sharp'`, `'rounded'`, the default, or `'round'`. Sharp corners are near square, `--env-radius-full` included; round ones are larger. Parts that are always circles stay circles.

  `--env-icon-size` is a public token again, the size of the icons in a place: 1 rem at the root, and a component that sizes its icons, such as a button or a navigation item, sets it on its own element, so content can line up with it.

  A Badge, a count or a DiffStat inside a Button keeps its own colors: the button no longer recolors its content.

  Breaking changes:

  - **One theme definition.** `defineTheme({ storageKey, defaultPreference, contrast, scale, selection, corners })` defines an application's theme once, and both `<ThemePreferenceProvider theme={theme}>` and `createThemeBootstrapScript(theme)` take it, so the first paint and the application can't drift apart. ThemePreferenceProvider's `storageKey`, `defaultPreference`, `contrast` and `scale` props are gone: write `<ThemePreferenceProvider theme={defineTheme({ storageKey: 'app-theme', scale: 'compact' })}>` instead of `<ThemePreferenceProvider storageKey="app-theme" scale="compact">`. The bootstrap script now also writes the selection and corners to the root before the first paint.
  - `ThemeBootstrapOptions` is renamed `ThemeDefinition`.
  - The selection tokens are neutral by default, as above; write `selection: 'accent'` for the blue selection.
  - The button's label, icons and end are each wrapped in a part of their own, `env-button-label`, `env-button-start-icon`, `env-button-end-icon` and `env-button-end`, which only place what they hold. A label is one line of text in its own part, so a badge in it sits in the line, a word space after the text, rather than the button's gap away.

  See [Setup](https://github.com/envsemble/envUI/blob/main/docs/setup.md#theme-preference).

### Patch Changes

- **The light and dark themes keep things apart, and alike.** Colors take other grades of the same roles, so apps that use the tokens follow without changes.

  - Light surfaces sit a step apart: the default and muted surfaces are a grade or two deeper, fields a grade deeper, and the recessed surface four grades deeper (`#dadadc`), a well that cards and list rows stand out in as they do in dark's. `Surface background="raised"` takes the default surface's tint in light, so a raised panel reads as its own background on the white page, as it does in dark.
  - The dark page is a grade darker, with the recessed surface and fields below it, and the muted surface a grade lighter, so panes, cards and navigation stand off the page.
  - Raised and recessed Surfaces take a faint 1 px frosted edge in both themes, which makes one sized by its content 2 px larger; in light, popups, dialogs, the command palette, rich text suggestions and tooltips take the same edge that dark popups had.
  - Selection stays apart from hover, press and the list cursor: light selection is two grades deeper, and a selected item under the pointer or pressed a grade deeper still, so it never lands on a surface's gray; popup rows give the cursor a quieter fill than the selection; light navigation hover and press are translucent layers; dark table rows hover below a full-strength selection.
  - The light primary color is two grades deeper at rest, hover and press, the light focus ring a grade deeper, and light primary, danger, success, accent and done text, the default border and the popup and dialog edges a grade deeper, so they keep their contrast on the deeper recessed surface; dark primary and danger fills press two grades from rest.
  - State steps show in both themes: field hover borders, ghost fields from read-only to hover, segments, menubar triggers, toolbar toggles, cards, radios, drop zones, tree rows, sortable table headers, resize grips and the color picker button.
  - Disabled states stay readable: checkbox and radio labels take the disabled text color (GrayText under forced colors), a disabled chosen radio its gray, a disabled pressed toggle a faded fill, a disabled chosen segment its fill with the label in the disabled text color, and a disabled card's description a little more contrast. An invalid Slider takes the danger edge invalid fields have.
  - Tracks, slider fills and ticks, the AvatarGroup overflow chip, soft neutral and done badges, the contents wave, dark tooltips, dark alerts, the heatmap's lowest levels and a failed message's edge are firmer, and soft badges in a selected table row keep the table's ground; out-of-range calendar dates are dimmed once instead of twice; a field's prefix and suffix take the full muted text color.
  - A solid count badge takes its tone's text color, so a dark danger count is white like the danger badge.

## 1.0.2

No changes in this release.

## 1.0.1

No changes in this release.

## 1.0.0

The first stable release, with envUI 1.0.0, whose version it shares.
