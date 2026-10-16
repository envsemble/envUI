# @envsemble/eslint-plugin-envui

ESLint rules for applications built with envUI. They report what envUI already provides but the code builds by hand: raw buttons, fields, dialogs, tables and menus, envUI's private `env-` classes, literal colors in inline styles, and names that envUI 1.0 renamed. Every message names the envUI component or token to use and how to import it.

Lint output reaches people and coding agents in their usual edit-and-check loop, so it works even when nobody has read the documentation first. The [Stylelint config](../stylelint-config/README.md) does the same for style sheets.

## Install

The plugin is published to GitHub Packages with envUI, in the same `@envsemble` scope; an application that installs envUI already has the registry set up. It needs ESLint 10 and its flat config.

```sh
npm install --save-dev --save-exact @envsemble/eslint-plugin-envui@<the version of @envsemble/envui>
```

The plugin is released together with `@envsemble/envui` and has the same version number. Install the same version as envUI: the rules know the components and names of that release.

## Use

```js
// eslint.config.js
import { defineConfig } from 'eslint/config';
import envui from '@envsemble/eslint-plugin-envui';

export default defineConfig(envui.configs.recommended);
```

`configs.recommended` turns on every rule as an error for JavaScript and TypeScript files (`**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}`) and enables JSX. TypeScript files need a parser such as typescript-eslint's, set up as usual; the rules need no type information. To pick rules yourself, register the plugin and configure them:

```js
export default defineConfig({
  plugins: { envui },
  rules: { 'envui/no-html-elements': ['error', { allow: ['kbd'] }] },
});
```

Some code may render raw elements on purpose, such as a canvas editor or an adapter for another library. Turn the rule off for those files, or disable it on one line and say why:

```js
export default defineConfig(envui.configs.recommended, {
  files: ['src/editor/**'],
  rules: { 'envui/no-html-elements': 'off' },
});
```

```tsx
// eslint-disable-next-line envui/no-html-elements -- the drawing surface handles its own keys
<div role="application" tabIndex={0} onClick={draw} />
```

If envUI lacks something you need, propose an addition to envUI rather than keeping a local copy.

## Rules

| Rule                                      | Reports                                                         |
| ----------------------------------------- | --------------------------------------------------------------- |
| [no-html-elements](#no-html-elements)     | Raw elements and widget roles that envUI provides as components |
| [no-private-classes](#no-private-classes) | envUI's private `env-` classes in class names and selectors     |
| [no-raw-colors](#no-raw-colors)           | Literal colors in inline styles                                 |
| [no-renamed-exports](#no-renamed-exports) | Names that envUI 0.x exported and 1.0 renamed or made internal  |

### no-html-elements

Reports JSX elements and widget roles that envUI already provides as components, and names the component to use and its import:

```text
Use envUI's TextField instead of a raw <input type="email">: import { TextField } from '@envsemble/envui'. TextField takes the same type. If envUI can't do what you need, propose an addition to envUI instead of a local copy.
```

One rule reads one mapping table, [`src/data/elements.json`](src/data/elements.json), rather than one rule per element. Adding a component to the table, as later envUI releases do, then never adds a rule name that configurations have to learn; one `allow` option and one disable comment cover every element; and the table is data that other tools, such as envUI's documentation, can read.

How an element is matched:

1. A static `role` is checked first, on any JSX element: `<ul role="menu">`, a `<Box role="dialog">` of the application's own or of another library, and envUI's own `<Surface role="dialog">` or `<Stack role="menu">`, which hand-roll the widget. An envUI component that renders the role itself, listed in the role's `owners`, passes, since a role on it refines its own: `<Popover role="dialog">`, `<Menu.Submenu role="menu">`, and the component the role names, `<Menu.Root role="menu">`. An element whose name is imported counts by the name its entry point exports, from `@envsemble/envui`, `/content`, `/diff` or `/rich-text`: `Surface` imported as `Dialog` is a `Surface`, a `Dialog` from another library is not envUI's, and `<Menu.Item role="menu">` is an item, not the menu. An element whose name nothing in the file declares, as in an example written without its imports, counts by its full written name. With several roles, the first counts.
2. Otherwise HTML elements are checked in the order of the table, and the first entry whose element and attributes match decides. An `<input>` is matched by its `type`.
3. Nothing is reported for:
   - what a part renders in place of its own element, through the `render` prop: `<Menu.Item render={<a href="/settings" />}>`;
   - an element hidden from assistive technology and out of the tab order (`aria-hidden` with `tabIndex={-1}`);
   - `<input type="hidden">`;
   - the `<a href>` of a link adapter, the component that `LinkProvider` renders for envUI's destinations, as the [setup guide](../../docs/setup.md#router-links) writes it: a function whose props are typed `LinkComponentProps`, or one that a `LinkProvider` in the same file takes as its `component`, directly, through a variable, as a member of an object literal (`component={adapters.link}`, also `adapters?.link`), or as either side of a choice (`component={external ? ExternalLink : RouterLink}`, `component={custom ?? RouterLink}`). It draws the anchor itself, because envUI's `Link` would render the adapter again;
   - entries named in `allow`.

Options:

| Option        | Default      | Meaning                                                                                                                                               |
| ------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `allow`       | `[]`         | Entries to allow, by the id in the table below, or an element name for all of its entries, such as `input`. An unknown name is a configuration error. |
| `renderProps` | `['render']` | Props whose value a component renders in place of its own element.                                                                                    |

The mapping table:

| Entry                    | Reports                                                                                                             | Use instead                                                         |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `[role=button]`          | `role="button"`                                                                                                     | `Button`, or `IconButton` for an icon-only button                   |
| `[role=link]`            | `role="link"`                                                                                                       | `Link`                                                              |
| `[role=checkbox]`        | `role="checkbox"`                                                                                                   | `Checkbox`                                                          |
| `[role=switch]`          | `role="switch"`                                                                                                     | `Switch`                                                            |
| `[role=radio]`           | `role="radio"`                                                                                                      | `Radio` in a `RadioGroup`                                           |
| `[role=radiogroup]`      | `role="radiogroup"`                                                                                                 | `RadioGroup` with a `Radio` for each option                         |
| `[role=slider]`          | `role="slider"`                                                                                                     | `Slider`                                                            |
| `[role=textbox]`         | `role="textbox"`                                                                                                    | `TextField`, or `Textarea` for text on several lines                |
| `[role=searchbox]`       | `role="searchbox"`                                                                                                  | `SearchField`                                                       |
| `[role=combobox]`        | `role="combobox"`                                                                                                   | `Combobox`, or `Select` when people pick without typing             |
| `[role=listbox]`         | `role="listbox"`                                                                                                    | `Select`, or `Combobox` when typing filters the options             |
| `[role=menu]`            | `role="menu"`                                                                                                       | `Menu.Root`                                                         |
| `[role=menubar]`         | `role="menubar"`                                                                                                    | `Menubar.Root`                                                      |
| `[role=dialog]`          | `role="dialog"`                                                                                                     | `Dialog`                                                            |
| `[role=alertdialog]`     | `role="alertdialog"`                                                                                                | `Dialog`                                                            |
| `[role=tablist]`         | `role="tablist"`                                                                                                    | `Tabs`                                                              |
| `[role=tree]`            | `role="tree"`                                                                                                       | `Tree`                                                              |
| `[role=tooltip]`         | `role="tooltip"`                                                                                                    | `Tooltip`                                                           |
| `[role=progressbar]`     | `role="progressbar"`                                                                                                | `Progress`                                                          |
| `[role=meter]`           | `role="meter"`                                                                                                      | `Meter`                                                             |
| `[role=alert]`           | `role="alert"`                                                                                                      | `Alert`                                                             |
| `[role=table]`           | `role="table"`                                                                                                      | `Table.Root`                                                        |
| `button`                 | `<button>`                                                                                                          | `Button`, or `IconButton` for an icon-only button                   |
| `input[type=hidden]`     | nothing: hidden inputs pass                                                                                         |                                                                     |
| `input[type=checkbox]`   | `<input type="checkbox">`                                                                                           | `Checkbox`, or `Switch` for a setting that applies at once          |
| `input[type=radio]`      | `<input type="radio">`                                                                                              | `Radio` in a `RadioGroup`                                           |
| `input[type=range]`      | `<input type="range">`                                                                                              | `Slider`                                                            |
| `input[type=date]`       | `<input type="date">`, `type="datetime-local"`                                                                      | `DatePicker`                                                        |
| `input[type=file]`       | `<input type="file">`                                                                                               | `DropZone`                                                          |
| `input[type=color]`      | `<input type="color">`                                                                                              | `ColorPicker`                                                       |
| `input[type=search]`     | `<input type="search">`                                                                                             | `SearchField`                                                       |
| `input[type=submit]`     | `<input>` of type `submit`, `reset`, `button` or `image`                                                            | `Button`                                                            |
| `input[type=text]`       | `<input>` without a type, or of type `text`, `email`, `password`, `tel`, `url`, `number`, `time`, `month` or `week` | `TextField`, which takes the same type                              |
| `input`                  | any other `<input>`, such as one whose type is computed                                                             | `TextField`, or the field for its type                              |
| `select`                 | `<select>`                                                                                                          | `Select`, or `Combobox` when typing filters the options             |
| `textarea`               | `<textarea>`                                                                                                        | `Textarea`, or `Composer` for writing a chat message                |
| `dialog`                 | `<dialog>`                                                                                                          | `Dialog`                                                            |
| `table`                  | `<table>`                                                                                                           | `Table.Root`                                                        |
| `details`                | `<details>`                                                                                                         | `Disclosure`                                                        |
| `progress`               | `<progress>`                                                                                                        | `Progress`                                                          |
| `meter`                  | `<meter>`                                                                                                           | `Meter`                                                             |
| `kbd`                    | `<kbd>`                                                                                                             | `Kbd`                                                               |
| `a[onClick]:not([href])` | `<a onClick>` without an `href`, or with `href=""`, `"#"` or `"javascript:…"`                                       | `Button`                                                            |
| `a[href]`                | `<a href>`                                                                                                          | `Link`, or `Button` with `href` for a link that looks like a button |
| `[onClick][tabIndex]`    | any other element that handles clicks and takes focus, such as `<div onClick tabIndex={0}>`                         | `Button`, or `IconButton` for an icon-only button                   |

Item roles (`menuitem`, `option`, `tab`, `row`) are not reported on their own: their container's role is. A `<div onClick>` that cannot take focus is left to accessibility linting, which reports it with the fix that suits it.

#### Adding to the table

Each entry has an `id`, an `element` (or `*` with an `except` list) or a `role`, optional `attributes` conditions, and `use`: the component, then alternatives with `when`. `import` overrides the bindings to import, `note` adds a sentence, and `describe` how the message names the element. An attribute condition is `true` (present), `false` (absent) or a list of values, where `null` stands for an absent attribute and a trailing `*` matches a prefix. Absence is unknown while an element spreads props. For example, a later envUI component could be added as:

```json
{ "id": "nav", "element": "nav", "use": [{ "component": "NavList.Root" }] }
```

The tests check that every entry names a 1.0 component and appears in the table above.

### no-private-classes

envUI's markup and its `env-` class names are private: they change in any release, as the 1.0 renames change nearly all of them. Code that sets, selects or restyles them breaks silently. This rule reports `env-` classes:

- in `className` and `class`, in strings, template literals, conditions, arrays and objects, including a utility class's arbitrary variant such as `[&_.env-button]:px-2`;
- in the arguments of class-name helpers: `clsx`, `cx`, `classnames`, `classNames`, `cn`, `twMerge` and `twJoin`;
- in `classList.add`, `remove`, `toggle`, `contains` and `replace`, and in `getElementsByClassName`;
- in selectors passed to `querySelector`, `querySelectorAll`, `closest`, `matches` and a browser test's `locator`, as `.env-…` or `[class*="env-…"]`;
- in style sheets written in JavaScript: `css`, `injectGlobal`, `createGlobalStyle` and `styled` templates, and `<style>` elements.

Use the component and its props instead, and put your own class on your own element. In tests, find elements by role or label.

A CSS module's lookup such as `styles['env-panel']` names a local class and passes. `env-theme`, the theme boundary on which the setup guide has applications set envUI's tokens, is allowed by default.

| Option       | Default                                                                 | Meaning                                   |
| ------------ | ----------------------------------------------------------------------- | ----------------------------------------- |
| `allow`      | `['env-theme']`                                                         | envUI classes that may be used            |
| `attributes` | `['className', 'class']`                                                | JSX attributes that hold class names      |
| `functions`  | `['clsx', 'cx', 'classnames', 'classNames', 'cn', 'twMerge', 'twJoin']` | Functions whose arguments are class names |

### no-raw-colors

Reports literal colors in JSX `style` objects: hex colors, color functions whose channels are not custom properties (`rgb()`, `hsl()`, `hwb()`, `lab()`, `lch()`, `oklab()`, `oklch()`, `color()`), and named colors in properties that take a color, such as `border: '1px solid red'`. Use an envUI color token instead, so the color follows the theme and keeps its contrast. The message suggests the semantic role of the property: a text color such as `var(--color-fg-default)` for `color`, `fill` and `stroke`, a `var(--color-bg-…)` background, or a `var(--color-border-…)` boundary for borders and outlines:

```text
Raw color #fff in an inline style: use an envUI color token instead, such as var(--color-fg-default) or another var(--color-fg-…) role, so the color follows the theme and keeps its contrast.
```

The token names come from [`src/data/tokens.json`](src/data/tokens.json). Before every pack, `scripts/SyncTokens.mjs` rewrites it from the library's generated token list (`packages/ui/src/generated/tokens.json` in the envUI repository), so a release names the tokens of the same envUI release, and the tests fail when a message or this README names a token that does not exist.

Values that depend on state, spread objects and custom properties are checked too, including an inline override of envUI's own tokens. A template literal is read as one value, each expression standing for a literal channel: `` `rgb(${r} 0 0)` `` is reported, as is the `#fff` in `` `url('${a}') #fff` ``, and the strings in its expressions are checked on their own. A relative color derived from a token, `hsl(from var(--color-fg-link) h s calc(l - 10))`, and `color-mix()` of tokens pass. So does a function whose channels all come from custom properties, each channel a `var()` whose fallback, if any, is a `var()` too, with or without a literal alpha after the `/` or as the last of two or four comma-separated arguments, `rgb(var(--…) / 50%)` and `rgba(var(--…), 0.5)` alike, and one `var()` that holds all three channels, `rgb(var(--…))`. Any other channel, such as `calc(255)`, `none` or a fallback such as `var(--…, 255 0 0)`, makes the color raw. `currentColor`, `transparent`, `url()` references and colors inside CSS strings, such as `content: '"rgb(1 2 3)"'`, pass. Style sheets are the [Stylelint config](../stylelint-config/README.md)'s concern. The rule has no options.

### no-renamed-exports

Reports imports and re-exports from `@envsemble/envui` of names that envUI 0.x exported and 1.0 does not, with the 1.0 name and its import:

```text
MenuItem is not exported by envUI 1.0: use Menu.Item instead (import { Menu } from '@envsemble/envui'). The v1-names codemod in @envsemble/envui-codemods rewrites the old names.
```

It also reports:

- members of a namespace import: `envui.Input`, `envui['Input']`, `<envui.Input>`, `createElement(envui['Input'])`, and in TypeScript `envui.InputProps`, `(typeof envui)['Input']` and members through an assertion, such as `(envui as any).Input`;
- the module and its names reached without an import declaration: `require('@envsemble/envui')`, `import('@envsemble/envui')`, awaited or through `.then()`, `import envui = require('@envsemble/envui')` in TypeScript, names destructured from any module object, as in `const { Input } = envui`, `const { ['Input']: Field } = envui` or the assignment `({ Input } = envui)`, and type queries such as `import('@envsemble/envui').InputProps`;
- rendering a name that became a namespace of parts, such as `<Menu>` or `<Table>`, which must now be `<Menu.Root>` or `<Table.Root>`, in JSX or through `createElement()`, `React.createElement()` and the JSX runtime's `jsx()`.

Type imports count. A name is read statically, so a member with a computed key, such as `envui[name]`, or a module object passed through a function is not followed. A name is checked where it resolves to envUI, so a local `Menu` or a parameter named `envui` that shadows the import passes. Only the entry point that exported a name is checked, so an icon named `Input` from `@envsemble/envui/icons` passes. The rule has no options.

What the codemods' map says to do instead comes with the report:

- A name that became internal gives the map's hint: `LoadingBar is internal in envUI 1.0 and no longer exported. AppShell's loading and loadingLabel props show page progress along the bottom of its topbar; Progress shows the progress of a task.`
- `Toast` stays importable, because 1.0's `Toast` is the namespace of `Toast.Provider`; rendering `<Toast …/>`, the 0.x manual toast, is reported with its hint: show notifications through `useToast()` inside `Toast.Provider`.
- Each rendered `DirectionLink` is told its part: `<DirectionLink direction="previous">` is `Pager.Previous`, `direction="next"` is `Pager.Next`, and with a computed `direction` the message names both, each with the value that chooses it.

The names come from [`src/data/renames.json`](src/data/renames.json). The canonical rename map belongs to the codemods (`packages/codemods/src/maps/v1.json` in the envUI repository). Before every pack, `scripts/SyncRenames.mjs` rewrites `src/data/renames.json` from that map when it exists, keeping the renames of names that envUI 0.7 exported ([`data/envui-0.7-exports.json`](data/envui-0.7-exports.json)) and leaving out prop, value and class renames. Each name's entry has `to`, its replacements, and where the map gives them, the `use` hint of a removed name, the `prop` and `values` of a split, and `namespace` for a removed name that 1.0 reuses as a namespace. Until the codemods' map exists, the plugin's own copy is used; its `source` field says which one a release carries, and the tests fail when the copy falls behind the codemods' map.

The plugin's own copy:

| envUI 0.7                                                                                                                                                     | envUI 1.0                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Input`, `InputProps`                                                                                                                                         | `TextField`, `TextFieldProps`                                                                                                                         |
| `DateTimeField`, `DateTimeFieldProps`                                                                                                                         | `DatePicker`, `DatePickerProps`                                                                                                                       |
| `FileDropzone`, `FileDropzoneProps`                                                                                                                           | `DropZone`, `DropZoneProps`                                                                                                                           |
| `DisclosureNote`, `DisclosureNoteProps`                                                                                                                       | `Disclosure`, `DisclosureProps`                                                                                                                       |
| `Notice`, `NoticeProps`, `NoticeTone`                                                                                                                         | `Alert`, `AlertProps`, `AlertTone`                                                                                                                    |
| `Counter`, `CounterProps`                                                                                                                                     | `CounterBadge`, `CounterBadgeProps`                                                                                                                   |
| `DiffCount`, `DiffCountProps`                                                                                                                                 | `DiffStat`, `DiffStatProps`                                                                                                                           |
| `Heatmap`, `HeatmapProps`, `HeatmapCell`, `HeatmapDay`                                                                                                        | `CalendarHeatmap`, `CalendarHeatmapProps`, `CalendarHeatmapCell`, `CalendarHeatmapDay`                                                                |
| `OrganizationMenu`, `OrganizationMenuProps`, `OrganizationMenuOrganization`                                                                                   | `OrganizationSwitcher`, `OrganizationSwitcherProps`, `OrganizationSwitcherOrganization`                                                               |
| `GroupedRows`, `GroupedRowsProps`, `Row`, `RowProps`                                                                                                          | `List.Root`, `List.RootProps`, `List.Item`, `List.ItemProps`                                                                                          |
| `NavigationItem`, `NavigationItemProps`                                                                                                                       | `NavList.Item`, `NavList.ItemProps`                                                                                                                   |
| `DirectionLinks`, `DirectionLinksProps`                                                                                                                       | `Pager.Root`, `Pager.RootProps`                                                                                                                       |
| `DirectionLinksDestination`                                                                                                                                   | `Pager.LinkProps`                                                                                                                                     |
| `DirectionLink`, `DirectionLinkProps`                                                                                                                         | `Pager.Previous` or `Pager.Next`, `Pager.LinkProps`                                                                                                   |
| `Menu` (rendered), `MenuProps`                                                                                                                                | `Menu.Root`, `Menu.RootProps`                                                                                                                         |
| `MenuItem`, `MenuGroup`, `MenuRadioGroup`, `MenuRadioItem`, `MenuCheckboxItem`, `MenuSeparator`, `MenuHeader`, `MenuSubmenu`                                  | `Menu.Item`, `Menu.Group`, `Menu.RadioGroup`, `Menu.RadioItem`, `Menu.CheckboxItem`, `Menu.Separator`, `Menu.Header`, `Menu.Submenu`                  |
| `MenuDensity`                                                                                                                                                 | `Menu.Density`                                                                                                                                        |
| `MenuItemProps`, `MenuGroupProps`, `MenuRadioGroupProps`, `MenuRadioItemProps`, `MenuCheckboxItemProps`, `MenuHeaderProps`, `MenuSubmenuProps`                | `Menu.ItemProps`, `Menu.GroupProps`, `Menu.RadioGroupProps`, `Menu.RadioItemProps`, `Menu.CheckboxItemProps`, `Menu.HeaderProps`, `Menu.SubmenuProps` |
| `Menubar` (rendered), `MenubarProps`, `MenubarMenu`, `MenubarMenuProps`, `MenubarMenuOpenChangeDetails`                                                       | `Menubar.Root`, `Menubar.RootProps`, `Menubar.Menu`, `Menubar.MenuProps`, `Menubar.MenuOpenChangeDetails`                                             |
| `Table` (rendered), `TableProps`, `TableHead`, `TableBody`, `TableRow`, `TableHeaderCell`, `TableCell`                                                        | `Table.Root`, `Table.RootProps`, `Table.Head`, `Table.Body`, `Table.Row`, `Table.HeaderCell`, `Table.Cell`                                            |
| `TableSortDirection`                                                                                                                                          | `Table.SortDirection`                                                                                                                                 |
| `TableHeadProps`, `TableBodyProps`, `TableRowProps`, `TableHeaderCellProps`, `TableCellProps`                                                                 | `Table.HeadProps`, `Table.BodyProps`, `Table.RowProps`, `Table.HeaderCellProps`, `Table.CellProps`                                                    |
| `Stat` (rendered), `StatProps`, `StatGroup`, `StatGroupProps`, `StatTrend`, `StatTrendTone`                                                                   | `Stat.Root`, `Stat.RootProps`, `Stat.Group`, `Stat.GroupProps`, `Stat.Trend`, `Stat.TrendTone`                                                        |
| `Toast` (rendered), `ToastProps`                                                                                                                              | `useToast()` inside `Toast.Provider`; describe a notification with `ToastNotification`                                                                |
| `ToastProvider`, `ToastProviderProps`                                                                                                                         | `Toast.Provider`, `Toast.ProviderProps`                                                                                                               |
| `LoadingBar`, `LoadingBarProps`, `getInitials`, `useLinkComponent`, `useSidebarCompact`, and `defaultThemeStorageKey` from `@envsemble/envui/theme-bootstrap` | internal, no longer exported                                                                                                                          |

## Development

Run from the envUI repository root:

```sh
npm test --workspace @envsemble/eslint-plugin-envui           # the rule and package tests
npm run sync:renames --workspace @envsemble/eslint-plugin-envui  # update the rename map from the codemods
npm run sync:tokens --workspace @envsemble/eslint-plugin-envui   # update the token names from the library
npm run dogfood --workspace @envsemble/eslint-plugin-envui     # count reports in the catalogue and test fixture
```

The root `npm test` runs these tests too. The dogfood run only counts: envUI's own catalogue and fixture render raw elements and the library's classes on purpose, so the plugin is not enforced on this repository.
