# @envsemble/envui-codemods

Codemods that upgrade an application from envUI 0.x to envUI 1.0. They rename imports, components, prop types, class names and custom properties as the 1.0 rename map lists them. What they cannot change safely, they leave in place and report with its file and line.

## Install

The package is published to the same private GitHub Packages registry as `@envsemble/envui`, so the `@envsemble` scope setup that installs the library installs this too. Requires Node 24 or later.

```sh
npm install --save-dev --save-exact @envsemble/envui-codemods
npx envui-codemods --list
```

Or run it once without adding it to the project:

```sh
npx @envsemble/envui-codemods v1-names src
```

## Usage

```sh
envui-codemods <transform> [paths...] [options]
```

```sh
npx envui-codemods v1-names src
npx envui-codemods v1-classes src --dry --print
npx envui-codemods v1-names src test --ignore-pattern='**/*.stories.tsx'
```

| Option                    | Effect                                                                                                                                                     |
| ------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `--dry`                   | Lists the files that would change, with the reports, and writes nothing.                                                                                   |
| `--print`                 | Prints every changed file under its name, as `==> src/menu.tsx <==`.                                                                                       |
| `--extensions=<list>`     | Reads only these comma-separated extensions. By default `js,jsx,ts,tsx,mjs,cjs,mts,cts`, and for v1-classes also `css,scss,sass,less,pcss`.                |
| `--ignore-pattern=<glob>` | Skips matching files and folders; repeatable. A pattern without a slash matches a name at any depth. `node_modules`, `dist` and `.git` are always skipped. |
| `--map=<path>`            | Uses another rename map: a folder shaped like `src/maps/v1`, or one JSON file with its sections merged, for example one component family at a time.        |
| `--list`, `--help`        | Lists the transforms, or shows the usage.                                                                                                                  |

Paths default to the current folder. The CLI runs jscodeshift's runner with the `tsx` parser, or `ts` for `.ts`, `.mts` and `.cts` files, where `<T>value` is a type assertion. It names every file it changes (`Changed src/menu.tsx`, or `Would change` with `--dry`), prints a summary and every report as `REP <file> line <n>: …`, and exits with 1 when a file fails to parse or transform.

## Recommended order

1. Commit first: the codemods write files in place.
2. Run `npx envui-codemods v1-names src`.
3. Run `npx envui-codemods v1-structure src`, then `npx envui-codemods v1-render src`. The codemods are meant for 0.x code, run once. Some 1.0 code reads as 0.x to them, such as a `useTheme()` call whose result nothing reads as `{ theme, contrast }`, so a run over code already written for 1.0 can change it.
4. Run `npx envui-codemods v1-props src`.
5. Run `npx envui-codemods v1-classes src` over the scripts and style sheets.
6. Install `@envsemble/envui` 1.0, run your formatter, then type-check. Fix each reported line; removed exports stay in the code on purpose, so the type checker points at them too.

## v1-names

Rewrites imports from `@envsemble/envui` and `@envsemble/envui/theme-bootstrap`, and every reference bound to them. Imports from other packages and from `@envsemble/envui/icons`, `/content`, `/diff` and `/rich-text` are left alone.

- **Renamed exports.** `Input` becomes `TextField`, `NoticeProps` becomes `AlertProps`, and so on, in JSX, values, types and `typeof`. A shorthand property keeps its key: `{ Input }` becomes `{ Input: TextField }`. An aliased import keeps its alias: `Input as Field` becomes `TextField as Field`. When the new name is already used in the file, the import keeps the old name as an alias: `TextField as Input`.
- **Namespace parts.** `import { Menu, MenuItem, MenuSeparator }` becomes `import { Menu }`; `<Menu>` becomes `<Menu.Root>`, `<MenuItem>` becomes `<Menu.Item>`, `MenuItemProps` becomes `Menu.ItemProps` and `typeof Table` becomes `typeof Table.Root`. The same applies to Menubar, Table, Stat, List, NavList, Pager and `ToastProvider`, which becomes `Toast.Provider`. Type-only imports stay type-only: `import type { MenuItemProps }` becomes `import type { Menu }`, or is dropped when `Menu` is already imported. When the file already uses the namespace name, for instance for the `Menu` icon, the namespace is imported under a free alias such as `Menu as EnvMenu`. Existing `Menu.Root` and `Menu.Item` accesses are left as they are, so running the codemod again changes nothing.
- **Shadowing locals.** Each rewritten reference must reach the import. Where a local in an inner scope has the name the rewrite would write, such as a `const Menu` in the function that renders `<MenuItem>`, or a local `TextField` where `<Input>` becomes `TextField`, the reference there uses a second import under a free alias, `<EnvMenu.Item>` with `Menu as EnvMenu`, and the run reports each one. Scopes follow the language: a `const`, `let` or `class` in a block, a `for` head, a `case` or a `catch` clause hides an import only inside it, a function body's `var` hides it in the body but not in the parameter defaults, an enum member inside its enum, and type parameters, local types and namespaces only from the types they declare, as TypeScript keeps values, types and namespaces apart: a local `interface Input` hides the import from `let field: Input` but not from `<Input />`, and the first name of `typeof Input.displayName` is a value, which a local `const Input` hides. Where a renamed reference would be read by a local of the new name, such as a type parameter `TextFieldProps` in the function that uses `InputProps`, the import keeps its old name as an alias: `TextFieldProps as InputProps`.
- **Namespace imports.** With `import * as ui from '@envsemble/envui'`, or `import ui = require('@envsemble/envui')` in TypeScript, `ui.Input` becomes `ui.TextField`, `<ui.MenuItem>` becomes `<ui.Menu.Item>` and `typeof ui.Input` becomes `typeof ui.TextField`. A literal key is followed too: `ui['Input']` becomes `ui['TextField']`, and `ui['MenuItem']` becomes `ui.Menu.Item`.
- **DirectionLink.** `<DirectionLink direction="previous">` becomes `<Pager.Previous>` and `direction="next"` becomes `<Pager.Next>`, without the prop.
- **Re-exports.** `export { Input } from '@envsemble/envui'` becomes `export { TextField } from '@envsemble/envui'`.
- **defaultThemeStorageKey.** References become the string `'env-theme'` and the import goes.
- **useTheme.** `useTheme()` returns `{ theme, contrast }` in 1.0. The rewrite covers calls of `useTheme` imported by name, also under an alias, and `ui.useTheme()` through a namespace import or `import ui = require(…)`. `<Theme theme={useTheme()}>`, which re-themes a portal, becomes `<Theme {...useTheme()}>`, so the portal keeps the contrast too; a `contrast` written on the element still wins. Other calls become `useTheme().theme`, the color scheme 0.x's call returned: `const theme = useTheme()`, `useTheme() === 'dark'`, `` `t-${useTheme()}` ``, `theme={dark ? 'dark' : useTheme()}` and `useTheme() as string`. A call already read as 1.0's object stays as it is: `useTheme().theme`, a spread or destructured call, also through a conditional as in `const { theme } = own ? useTheme() : fallback`, a variable it initializes that is read as `.theme` or `.contrast`, spread or destructured, and a comparison with `null` or `undefined`. Parentheses, `as`, `satisfies` and `!` around the call or the variable count as the call itself, and the variable is the one declared in the scope that holds the declaration, as for the renames. A call whose value leaves the file's sight, returned or passed as a value, stays and is reported, as listed below.

It reports instead of changing:

- removed exports, with what to use instead: `LoadingBar`, `LoadingBarProps`, the manual `Toast` (only its bare uses; `Toast.Provider` is the 1.0 API), `ToastProps`, `getInitials`, `useLinkComponent`, `useSidebarCompact`, `BrandLogo` and `EnvUILogo` with their props types (envUI ships no logos), `ActionCard` and `FeatureCard`, which v1-structure then rewrites, and the `MenuDensity` and `SurfaceDensity` types;
- `DirectionLink` with a dynamic, spread or missing `direction`, or used outside JSX; its import stays;
- re-exports and `export { … }` of namespace parts, `DirectionLink` and removed exports, which cannot keep their old name;
- a namespace import read with a key computed at run time, such as `ui[name]`;
- names destructured from a namespace import, such as `const { MenuItem } = ui`, `({ MenuItem } = ui)`, `const { ['MenuItem']: Item } = ui` or `const { useTheme } = ui`, whose calls stay as they are. `const { Menu, Toast } = ui` names 1.0 namespaces too, and is reported only where `Menu` or `Toast` is then used as the 0.x component rather than through its members, as in `<Menu.Root>`;
- a `useTheme()` call that is returned, as by a hook that wraps it, also as an arrow function's body, or passed as the `value` of what may be a context provider, such as `<ThemeContext value={useTheme()}>`, `<ThemeContext.Provider>`, an element named `…Provider` or one `createContext` makes in the file, directly or through a variable it initializes (another component's `value`, such as a Select's, takes `useTheme().theme`): whether the code that reads it expects 0.x's scheme or 1.0's object is out of the file's sight, so it stays as it is;
- a `<ClickableCard>` without `href` or `onClick`, such as a submit button, which becomes a content card in 1.0 rather than a button, as the map's `structure` section lists under its 0.x name;
- each `require()` and dynamic `import()` of an entry point, which the codemod does not follow, also in a file without an `import`;
- parts destructured from a namespace that was a 0.x component, such as `const { Root, Item } = Menu` or `const { Cell } = ui.Table`, which are 1.0 code and stay as they are rather than becoming `Menu.Root`.

## v1-props

Moves the props that 1.0 removed or changed, as the `props` section of the rename map lists them, on elements imported from `@envsemble/envui` under their 0.x or 1.0 names, also as namespace parts (`<Menu.Root>`) and through a namespace import (`<ui.Table.Root>`). Each literal value of a prop becomes the props it maps to, in the prop's place, so spreads keep their order around it; a replacement the element already sets is kept as the element sets it.

- `density`, `compact` and size-as-density become sizes: `<Select density="compact">` becomes `size="sm"`, as do `size="compact"` on Tabs, SegmentedControl, Pagination and CopyButton, and `compact` on DropZone.
- Row densities: `<Table.Root density="compact">` becomes `density="sm"`, and `<Tree density="standard">` `density="md"`; their other values are the defaults and are dropped.
- Fields take the control height: `<TextField compact>` becomes `showLabel={false}`, which keeps its label hidden; `compact={false}`, and the `standard` density of Combobox and DatePicker, become `variant="floating"`, the tall field.

It reports, with the prop's replacement:

- props that 1.0 removed without a replacement, which it drops: `density` on Surface, Menu.Root, ContextMenu and Menubar.Menu, and `size` on NavList.Item; for a compact app or region, set `scale="compact"` on its Theme;
- a value it can't read, such as `density={density}`, which stays as it is, so the type checker points at it too;
- props whose name and value stay but whose meaning changed, which it leaves alone and reports at every use, on every run: `className` and `style` on TextField, SearchField, Textarea, MarkdownEditor, Select, Combobox, DatePicker, Checkbox, Switch and Radio style the root element in 1.0 rather than the input, textarea or trigger; and Disclosure's native `onToggle`, since 1.0's Disclosure keeps its open state and tells `onOpenChange(open)`.

- Button emphasis: `variant="important"` becomes `variant="primary" tone="accent"`, `destructive` `variant="primary" tone="danger"`, `outlined` `outline` and `quiet` `ghost`, on Button, IconButton, ConfirmButton, CopyButton, DialogClose, ThemeToggle and Pagination.
- Renamed props, which take their new name whatever their value and map the values that changed: Text's `tone` becomes `emphasis` (`primary` is `default`, `quiet` is `subtle`) and its variants `page-heading`, `section-heading` and `supporting` become `headline`, `title` and `body-sm`; Skeleton's `tone` becomes `emphasis` (`base` is `muted`, `highlight` is `default`); Surface's `tone` becomes `background` (`pane`, `row`, `canvas` and `alternate` are `default`, `muted`, `page` and `raised`) and `corners` becomes `radius` (`surface`, `standard` and `pill` are `xl`, `sm` and `full`).
- Navigation and collections: Menu.Item's and NavList.Item's `trailing` becomes `end`; OrganizationSwitcher's `organizations`, `currentOrganizationId` and `onSelect` become `items`, `value` and `onValueChange`; Tree's `selectedId` and `onOpen` become `value` and `onAction`; Table.HeaderCell's `onSort` becomes `onSortChange`; and List.Item's `title` and `detail` become `label` and `description`. The fields of the data these components take, such as a TreeItem's `detail`, are not props, so TypeScript points at them.
- Content components: Card's `tone` becomes `background` (`row` is the default `muted`, `pane` is `default`, `canvas` is `page`) and its `layout` of `content` or `action` goes, reported where `layout="action"` has no `actions`, since actions alone give a 1.0 card its action strip; Stat.Group's `tone` becomes `background` as Surface's does; Stat.Root's and AvatarButton's `detail` becomes `description`; SegmentedControl's `options` becomes `items`; Badge's `variant="subtle"` goes, as `soft` is the default; and the sizes of Avatar and AvatarGroup (`small`, `standard`, `large`, `display`) and of AvatarButton become `sm`, `md` (the default, dropped), `lg` and `xl`.
- The properties of the object some calls take, as the map's `calls` section lists them: a call of a function imported by name, or of a method of what a hook returns, such as `useToast().show({ … })`, `const toast = useToast(); toast.show({ … })` or `const { show } = useToast(); show({ … })`. An argument that is not an object literal is reported.

A 1.0 value, such as `density="sm"` on a Table or `size="lg"` on Tabs, is left alone without a report, so the codemod can run again over code it already moved. A renamed prop with an expression, such as `<Text tone={tone}>`, takes its new name and is reported, since its values may need mapping.

## v1-render

Replaces `as` with `render` on the components the map's `render` section lists (Text, Stack and Surface): `<Text as="h2">` becomes `<Text render={<h2 />}>`. It reports an expression, such as `as={level}`, which `render` takes as an element instead, and an element that already sets `render`. Beside a spread, as in `<Text {...heading} as="h2">`, `as` still becomes `render` and is reported, since the spread may set `as` or `render` too. Only the attribute's text changes, so the file keeps its layout.

## v1-structure

Rewrites elements whose 1.0 form is another element, as the map's `structure` section lists them:

- `<ActionGroup>` becomes `<Stack direction="row" wrap align="center" gap={4}>`, its `align` Stack's `justify` and its `as` a `render`; a stacked one becomes `<Stack gap={2}>` with `fullWidth` on each labelled `<Button>` inside. Stack is imported under a free name where the file already uses the name, and ActionGroup's import goes once nothing uses it.
- `<List.Root contrast>` becomes `<Surface background="muted" padding={3}><List.Root>`, and `contrast={false}` is dropped; a computed `contrast` is reported.
- It reports an ActionGroup whose `stacked` is an expression, and a child of a stacked one that is not a Button, whose width it can't set.
- `<ActionCard title>` becomes `<Card render={<article />} heading>`, reported where it has no `actions`, which alone give a 1.0 card its action strip, and `<FeatureCard title action>` becomes `<Card layout="feature" headingLevel={2} heading actions>`. Card's `as="button"`, `as="a"` and `as="div"` go, since `onClick` and `href` make the button and the link, and `as="article"` becomes `render={<article />}`; an `as` that is an expression is reported.
- `<SplitView start end resizeLabel storageKey>`, removed in 0.7, becomes `<SplitPane.Root persist>` around `<SplitPane.Pane>{start}</SplitPane.Pane>`, `<SplitPane.ResizeHandle label>` and `<SplitPane.Pane>{end}</SplitPane.Pane>`, before or after `v1-names`; its other props stay. One that spreads props or has children is reported.
- It leaves an ActionGroup that spreads props, as in `<ActionGroup {...group}>`, and reports it: the spread may set `stacked` or `align`. A Button in a stacked one that spreads props is reported instead of getting `fullWidth`, since the spread may set `iconOnly` or `fullWidth`.

Each entry is a list of cases matched on the element's literal props; a case renames the element, drops, renames or maps props, adds props to it or to its children, such as `render={<article />}`, makes its children from its props, such as SplitView's panes, or wraps it in another element. `has` limits a case to elements that set some props, whatever their values. Later 1.0 changes add entries, not code.

## v1-classes

Renames 0.x `env-*` class names and custom properties, and turns modifier classes into the attributes 1.0 sets. An entry also renames every name that continues it with a hyphen, the longest entry wins, and names that already have the new name are left alone: `env-notice-title` becomes `env-alert-title`, `--env-notice-tone` becomes `--env-alert-tone`, and `env-counter-badge` stays.

A few classes depend on where they are. 0.7 gave DiffCount's label the counter's class, `env-counter-label`, which becomes `env-counter-badge-label`; 1.0's DiffStat names its label `env-diff-stat-label`. In a selector that puts the class inside DiffCount, such as `.env-diff-count .env-counter-label` or `.env-diff-count > .env-counter-label`, the label takes the DiffStat name. A selector nested inside a DiffCount rule in Sass or Less, and class names in markup, are not changed by context: rename those by hand.

What 1.0 has no class for, as the map's `classReports` section lists it, stays and is reported with what to use instead: OrganizationSwitcher's `env-organization-menu-radio` and `-radio-dot`, which the shorter `env-organization-menu` entry leaves alone, Card's `env-card-content`, which 0.7 put on a card without actions and on an action card's body, and a selector that puts `.env-document-tabs-close` inside `.env-document-tabs-tab`, such as `.env-document-tabs-tab:hover .env-document-tabs-close`, which can't match now that the close button is the tab's sibling.

Modifier classes, as the map's `classAttributes` section lists them, become attribute selectors on their root class, with the specificity they had: `.env-button-important` becomes `.env-button:where([data-variant='primary'][data-tone='accent'])`, `.env-button.env-button-quiet` becomes `.env-button[data-variant='ghost']` and `.env-text-tone-muted` becomes `.env-text:where([data-emphasis='muted'])`. In markup, such a class is reported: 1.0 components set the attributes from their props. `env-symbol`, the icon wrapper, becomes `env-icon`. The Card family's classes become Card's: `.env-clickable-card` is `.env-card:where([data-interactive])`, `.env-action-card` `.env-card:where([data-actions])` and `.env-feature-card` `.env-card:where([data-layout='feature'])`, with their parts as `env-card-header`, `-meta`, `-body`, `-footer`, `-layout`, `-icon` and `-description`; `env-info-chip` becomes `env-badge`, `env-segment` `env-segmented-control-item`, `env-stat-detail` `env-stat-description` and `.env-avatar-small` `.env-avatar:where([data-size='sm'])`.

It also renames the tokens' custom properties, as the map's `tokens` section lists them. Every token takes the `--env-` prefix in 1.0, a few change their names beyond it, and the 0.7 aliases go straight to the token that replaces them: `--space-4` becomes `--env-space-4`, `--color-text-muted` becomes `--env-color-fg-muted`, `--color-row` becomes `--env-color-list-item-bg` and `--md-sys-shape-corner-large` becomes `--env-radius-lg`. A declaration is renamed too, so a style sheet that themes envUI by setting `--color-link` sets `--env-color-fg-link`; an application property of the same name as an old token is renamed with it, consistently, so check a renamed declaration that was the application's own. A name 1.0 removes, such as `--scale`, and a 0.7 fixed color that no token replaces, such as `--color-white`, stay as they are and are reported with what to use instead. A 1.0 name is left alone: `--env-row-height` is a token, not a property of the 0.x `env-row` class.

- **Style sheets** (`.css`, `.scss`, `.sass`, `.less`, `.pcss`): `.env-*` class selectors, including those inside `:is()` and `:not()`; `--env-*` custom property declarations and `var()` uses; the tokens' custom properties before 1.0, declared or read; and `[class~='env-*']`, `[class*='env-*']` and similar attribute selectors.
- **Scripts:** whole class tokens in strings and template literals inside JSX `className` and `class` attributes, including `classNames()`, `clsx()` and conditional expressions; `className` properties and assignments; selectors passed to `querySelector`, `querySelectorAll`, `closest` and `matches`; `classList` methods and `getElementsByClassName`; `--env-*` custom properties and the tokens' names before 1.0 in `style` attributes, string property keys, `style.setProperty()`, `getPropertyValue()` and `removeProperty()`; and `var()` references to either in any string. Text that only mentions a name, outside these, stays. Only the literals change, so the rest of the file keeps its formatting.

Both transforms keep a file's line endings, CRLF or LF, and its byte order mark; class names in template literals that span lines are renamed in CRLF files too. What `v1-names` prints anew, such as an import whose names it lays out one per line, is indented with tabs in a file that indents with tabs.

## The rename map

The folder `src/maps/v1` is the single source of the renames. `map.json` holds the version, the package and what each section means; every other file is a fragment of one section for one component family, such as `props/Button.json` or `classes/Menu.json`, which the transforms merge, failing where two fragments set the same name. The sections: `exports` (old export name to new name per entry point; a dot names a namespace part), `split` (components that became several parts, chosen by a prop value), `removed` (exports that became internal, with what to use instead), `props` (changed props, their values and new names), `calls` (properties of the objects some calls take), `render` (components whose `as` became `render`), `structure` (element rewrites), `classes`, `classAttributes` (modifier classes that became attributes), `classesWithin` (class renames inside an ancestor's selector), `classReports` (classes 1.0 neither keeps nor renames, and selectors that put a class inside one that no longer holds it, which `v1-classes` leaves and reports), `docs` (documentation page slugs) and `tokens` (custom properties before 1.0, each with the 1.0 name in `to`, or a fixed color's `value` or `removed`, which are reported; the token build writes `tokens/Tokens.json`). The transforms hardcode no names. Pass `--map` to run them with another folder or a single JSON file of the merged shape; the map is checked before anything runs.

## Limitations

- Changed import declarations are printed again and can lose their line breaks; run your formatter afterwards.
- Comments stay with what they describe. A comment on a renamed specifier stays on it, and the comments on a specifier that is removed move to the namespace specifier that takes its place, as `Menu` takes the place of `MenuItem`, or a value import of `Menu` takes that of `import type { Menu }`; an import whose namespace specifier gets a line comment is printed with a name on each line, so the comment stays above the name it describes; where none does, as when `Menu` was already imported, they are dropped and reported with their text. When an import is removed because its names moved into another import, a directive about its line (`@ts-ignore`, `eslint-disable-next-line`, `prettier-ignore` and the like) moves with the names to that import; when nothing replaces the import, as for `defaultThemeStorageKey`, the directive is dropped and reported. Other comments above a removed import, such as a file header, stay in place on the next statement.
- A `@ts-expect-error` above an import, re-export or specifier whose names change is dropped and reported rather than kept or moved: it expected an error from the 0.x names, and TypeScript fails on a `@ts-expect-error` that has no error below it (TS2578). Where the import also lists names that stay as they are, the error may have been theirs, and the report names them, so the comment can be put back if they still have it.
- Class names built at run time, class strings kept in variables outside the contexts above, CSS-in-JS templates and HTML files are not changed.
- `require()` outside `import ui = require(…)`, dynamic `import()`, module mocks and `declare module '@envsemble/envui'` augmentations are not changed; the run reports each `require()` and `import()` of an entry point.
- In code that already uses 1.0, a bare use of a namespace that was a 0.x component, such as `Object.keys(Menu)`, would be read as the old component.
- To run a transform with jscodeshift directly, pass `--no-babel`: the transforms are ES modules, which jscodeshift's Babel register would break.
