# @envsemble/eslint-plugin-envui

ESLint rules for applications built with envUI. They report what envUI already provides but the code builds by hand: raw buttons, fields, dialogs, tables and menus, flex and grid layout in inline styles, literal colors in inline styles, and raw images and other icon packages. Every message names the envUI component or token to use and how to import it.

Lint output reaches people and coding agents in their usual edit-and-check loop, so it works even when nobody has read the documentation first. The [Stylelint config](https://github.com/envsemble/envUI/tree/main/packages/stylelint-config) does the same for style sheets.

## Install

The plugin is published to GitHub Packages with envUI, in the same `@envsemble` scope; an application that installs envUI already has the registry set up. It needs ESLint 10 and its flat config.

```sh
npm install --save-dev --save-exact @envsemble/eslint-plugin-envui@<the version of @envsemble/envui>
```

The plugin is released together with `@envsemble/envui` and has the same version number. Install the same version as envUI: the rules know the components of that release.

## Use

```js
// eslint.config.js
import { defineConfig } from 'eslint/config';
import envui from '@envsemble/eslint-plugin-envui';

export default defineConfig(envui.configs.recommended);
```

`configs.recommended` turns on every rule for JavaScript and TypeScript files (`**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}`) and enables JSX: each as an error, except [no-inline-layout](#no-inline-layout), a warning. TypeScript files need a parser such as typescript-eslint's, set up as usual; the rules need no type information. To pick rules yourself, register the plugin and configure them:

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

## Settings

The rules share their settings under `settings.envui` in the ESLint configuration. An unknown setting, or a value of the wrong shape, is a configuration error.

`reexportModules` lists the application's modules that re-export envUI's components under envUI's names, such as a `src/ui.ts` with `export * from '@envsemble/envui'`. Names imported from them count as envUI's:

```js
import path from 'node:path';

export default defineConfig(envui.configs.recommended, {
  settings: {
    envui: { reexportModules: [path.resolve(import.meta.dirname, 'src/ui'), '@/components/ui'] },
  },
});
```

- A path names the module's file. Write it absolute, from the configuration's own folder, with `path.resolve(import.meta.dirname, 'src/ui')`, so it names the same file wherever ESLint runs: from the application's folder, a monorepo's root or an editor. A relative entry, such as `'./src/ui'`, also works, but is read from ESLint's working directory (`cwd`), which changes with where ESLint runs. Either must name an existing module, the file itself, with a script extension (`.ts`, `.tsx`, `.js` and the like) or as its `/index`; an entry that names none is a configuration error, rather than matching nothing, that gives the path it looked for and, for a relative entry, the working directory. A relative import matches when it resolves to that module from the file that writes it, with or without the extension or `/index`, through symbolic links, and on Windows whatever the case of the drive letter or path: in `src/pages/Home.tsx`, `'../ui'`, `'../ui.ts'` and `'../ui/index'` match `src/ui`, and `'./ui'`, which is `src/pages/ui`, does not.
- Any other entry, an alias such as `'@/components/ui'` or a package, matches an import that writes it exactly, in any file: `'@/components/ui/index'` is a different spelling. List each spelling the application writes.
- [no-html-elements](#no-html-elements) counts a name imported from a listed module as the envUI component it is exported as: `<Dialog role="alertdialog">` with `Dialog` from `'./ui'` passes. [no-raw-graphics](#no-raw-graphics) counts a `Graphic` imported from one as envUI's.
- List only modules that keep envUI's names: a component of the application's own exported under an envUI name would count as envUI's.

## Rules

| Rule                                  | Reports                                                                                      |
| ------------------------------------- | -------------------------------------------------------------------------------------------- |
| [no-inline-layout](#no-inline-layout) | Flex and grid layout in inline styles, a warning                                             |
| [no-html-elements](#no-html-elements) | Raw elements and widget roles that envUI provides as components                              |
| [no-raw-colors](#no-raw-colors)       | Literal colors in inline styles                                                              |
| [no-raw-graphics](#no-raw-graphics)   | Raw images, fixed-size SVGs, other icon packages, and a Graphic without alt or with a margin |

### no-inline-layout

Warns on `display: flex`, `inline-flex`, `grid` and `inline-grid` in JSX `style` objects, and names the layout primitive to use instead: Row for a flex row, Column for a flex column (`flexDirection: 'column'` or `'column-reverse'`), Row or Column when the direction is computed, and Grid for a grid. The primitives take envUI's spacing steps for their gap and padding, and show up as named nodes in dev mode:

```text
Inline `display: flex` lays out a row by hand: use envUI's Row instead, import { Row } from '@envsemble/envui', with its gap, padding and alignment props and `wrap` to wrap. Keep plain CSS only where Row can't do what you need.
```

It is a warning, not an error, in `configs.recommended`: plain CSS stays allowed where a primitive can't do what the layout needs. Disable it on that line and say why:

```tsx
// eslint-disable-next-line envui/no-inline-layout -- a subgrid lines the rows up with the header
<div style={{ display: 'grid', gridTemplateColumns: 'subgrid' }} />
```

What it reads:

- every object literal in the `style` value, through conditions, spreads and calls, such as `style={{ ...base, ...(stacked ? { display: 'flex' } : {}) }}` and `style={useMemo(() => ({ display: 'grid' }), [])}`;
- a `const` of the same file that holds an object literal, with or without `as const`, where the style takes it as it is: `style={row}` with `const row = { display: 'flex' }`, one of its keys, as in `style={styles.toolbar}`, either branch of a condition, and a spread, as in `style={{ ...row, padding: 0 }}`; the declaration is reported once, however many elements use it;
- both branches of a condition, as in `display: wide ? 'grid' : 'flex'`, and a `const` of the same file that holds a string, as in `display: d` with `const d = 'flex'`.

A computed display, a constant passed to a call, as in `style={css(config)}`, whose result the rule can't know, a style object from another module or a function's parameter, and style sheets pass: plain CSS in a style sheet is the application's own business. Flex and grid properties without a `display` of their own, such as `flex: 1` or `gridColumn` on a child, pass too. The rule has no options.

### no-html-elements

Reports JSX elements and widget roles that envUI already provides as components, and names the component to use and its import:

```text
Use envUI's TextField instead of a raw <input type="email">: import { TextField } from '@envsemble/envui'. TextField takes the same type. If envUI can't do what you need, propose an addition to envUI instead of a local copy.
```

One rule reads one mapping table, [`src/data/elements.json`](src/data/elements.json), rather than one rule per element. Adding a component to the table, as later envUI releases do, then never adds a rule name that configurations have to learn; one `allow` option and one disable comment cover every element; and the table is data that other tools, such as envUI's documentation, can read.

How an element is matched:

1. A static `role` is checked first, on any JSX element: `<ul role="menu">`, a `<Box role="dialog">` of the application's own or of another library, and envUI's own `<Surface role="dialog">` or `<Column role="menu">`, which hand-roll the widget. An envUI component that renders the role itself, listed in the role's `owners`, passes, since a role on it refines its own: `<Popover role="dialog">`, `<Spinner role="progressbar">`, and the component the role names, `<Table.Root role="table">`. An element whose name is imported counts by the name its entry point exports, from one of envUI's entry points, such as `@envsemble/envui` or `/color`, or from a module listed in [`reexportModules`](#settings): `Surface` imported as `Dialog` is a `Surface`, a `Dialog` from another library is not envUI's, and `<Table.Row role="table">` is a row, not the table. An element whose name nothing in the file declares, as in an example written without its imports, counts by its full written name. With several roles, the first counts.
2. Otherwise HTML elements are checked in the order of the table, and the first entry whose element and attributes match decides. An `<input>` is matched by its `type`.
3. Nothing is reported for:
   - what a part renders in place of its own element, through the `render` prop: `<Card render={<a href="/settings" />}>`;
   - an element hidden from assistive technology and out of the tab order (`aria-hidden` with `tabIndex={-1}`);
   - `<input type="hidden">`;
   - the `<a href>` of a link adapter, the component that `LinkProvider` renders for envUI's destinations, as the [setup guide](https://envui.envsemble.com/docs?section=connect-your-router) writes it: a function whose props are typed `LinkComponentProps`, or one that a `LinkProvider` in the same file takes as its `component`, directly, through a variable, as a member of an object literal (`component={adapters.link}`, also `adapters?.link`), or as either side of a choice (`component={external ? ExternalLink : RouterLink}`, `component={custom ?? RouterLink}`). It draws the anchor itself, because envUI's `Link` would render the adapter again;
   - entries named in `allow`.

Options:

| Option        | Default      | Meaning                                                                                                                                               |
| ------------- | ------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `allow`       | `[]`         | Entries to allow, by the id in the table below, or an element name for all of its entries, such as `input`. An unknown name is a configuration error. |
| `renderProps` | `['render']` | Props whose value a component renders in place of its own element.                                                                                    |

The mapping table:

| Entry                    | Reports                                                                                            | Use instead                                                         |
| ------------------------ | -------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `[role=button]`          | `role="button"`                                                                                    | `Button`, or `IconButton` for an icon-only button                   |
| `[role=link]`            | `role="link"`                                                                                      | `Link`                                                              |
| `[role=checkbox]`        | `role="checkbox"`                                                                                  | `Checkbox`                                                          |
| `[role=switch]`          | `role="switch"`                                                                                    | `Switch`                                                            |
| `[role=radio]`           | `role="radio"`                                                                                     | `Radio` in a `RadioGroup`                                           |
| `[role=radiogroup]`      | `role="radiogroup"`                                                                                | `RadioGroup` with a `Radio` for each option                         |
| `[role=slider]`          | `role="slider"`                                                                                    | `Slider`                                                            |
| `[role=textbox]`         | `role="textbox"`                                                                                   | `TextField`, or `Textarea` for text on several lines                |
| `[role=searchbox]`       | `role="searchbox"`                                                                                 | `SearchField`                                                       |
| `[role=combobox]`        | `role="combobox"`                                                                                  | `Combobox`, or `Select` when people pick without typing             |
| `[role=listbox]`         | `role="listbox"`                                                                                   | `Select`, or `Combobox` when typing filters the options             |
| `[role=menu]`            | `role="menu"`                                                                                      | `Menu.Root`                                                         |
| `[role=menubar]`         | `role="menubar"`                                                                                   | `Menubar.Root`                                                      |
| `[role=dialog]`          | `role="dialog"`                                                                                    | `Dialog`                                                            |
| `[role=alertdialog]`     | `role="alertdialog"`                                                                               | `Dialog`                                                            |
| `[role=tablist]`         | `role="tablist"`                                                                                   | `Tabs`                                                              |
| `[role=tree]`            | `role="tree"`                                                                                      | `Tree`                                                              |
| `[role=tooltip]`         | `role="tooltip"`                                                                                   | `Tooltip`                                                           |
| `[role=progressbar]`     | `role="progressbar"`                                                                               | `Progress`                                                          |
| `[role=meter]`           | `role="meter"`                                                                                     | `Meter`                                                             |
| `[role=alert]`           | `role="alert"`                                                                                     | `Alert`                                                             |
| `[role=table]`           | `role="table"`                                                                                     | `Table.Root`                                                        |
| `button`                 | `<button>`                                                                                         | `Button`, or `IconButton` for an icon-only button                   |
| `input[type=hidden]`     | nothing: hidden inputs pass                                                                        |                                                                     |
| `input[type=checkbox]`   | `<input type="checkbox">`                                                                          | `Checkbox`, or `Switch` for a setting that applies at once          |
| `input[type=radio]`      | `<input type="radio">`                                                                             | `Radio` in a `RadioGroup`                                           |
| `input[type=range]`      | `<input type="range">`                                                                             | `Slider`                                                            |
| `input[type=date]`       | `<input type="date">`, `type="datetime-local"`                                                     | `DatePicker`                                                        |
| `input[type=time]`       | `<input type="time">`                                                                              | `TimePicker`                                                        |
| `input[type=month]`      | `<input type="month">`                                                                             | `MonthPicker`                                                       |
| `input[type=file]`       | `<input type="file">`                                                                              | `DropZone`                                                          |
| `input[type=color]`      | `<input type="color">`                                                                             | `ColorPicker`, from `@envsemble/envui/color`                        |
| `input[type=search]`     | `<input type="search">`                                                                            | `SearchField`                                                       |
| `input[type=submit]`     | `<input>` of type `submit`, `reset`, `button` or `image`                                           | `Button`                                                            |
| `input[type=text]`       | `<input>` without a type, or of type `text`, `email`, `password`, `tel`, `url`, `number` or `week` | `TextField`, which takes the same type                              |
| `input`                  | any other `<input>`, such as one whose type is computed                                            | `TextField`, or the field for its type                              |
| `select`                 | `<select>`                                                                                         | `Select`, or `Combobox` when typing filters the options             |
| `textarea`               | `<textarea>`                                                                                       | `Textarea`, or `Composer` for writing a chat message                |
| `dialog`                 | `<dialog>`                                                                                         | `Dialog`                                                            |
| `table`                  | `<table>`                                                                                          | `Table.Root`                                                        |
| `details`                | `<details>`                                                                                        | `Disclosure`                                                        |
| `progress`               | `<progress>`                                                                                       | `Progress`                                                          |
| `meter`                  | `<meter>`                                                                                          | `Meter`                                                             |
| `kbd`                    | `<kbd>`                                                                                            | `Kbd`                                                               |
| `a[onClick]:not([href])` | `<a onClick>` without an `href`, or with `href=""`, `"#"` or `"javascript:…"`                      | `Button`                                                            |
| `a[href]`                | `<a href>`                                                                                         | `Link`, or `Button` with `href` for a link that looks like a button |
| `[onClick][tabIndex]`    | any other element that handles clicks and takes focus, such as `<div onClick tabIndex={0}>`        | `Button`, or `IconButton` for an icon-only button                   |

Item roles (`menuitem`, `option`, `tab`, `row`) are not reported on their own: their container's role is. A `<div onClick>` that cannot take focus is left to accessibility linting, which reports it with the fix that suits it.

#### Adding to the table

Each entry has an `id`, an `element` (or `*` with an `except` list) or a `role`, optional `attributes` conditions, and `use`: the component, then alternatives with `when`. `import` overrides the bindings to import, `note` adds a sentence, and `describe` how the message names the element. An attribute condition is `true` (present), `false` (absent) or a list of values, where `null` stands for an absent attribute and a trailing `*` matches a prefix. Absence is unknown while an element spreads props. For example, a later envUI component could be added as:

```json
{ "id": "nav", "element": "nav", "use": [{ "component": "NavigationDrawer" }] }
```

The tests check that every entry names a 1.0 component and appears in the table above.

### no-raw-colors

Reports literal colors in JSX `style` objects: hex colors, color functions whose channels are not custom properties (`rgb()`, `hsl()`, `hwb()`, `lab()`, `lch()`, `oklab()`, `oklch()`, `color()`), and named colors in properties that take a color, such as `border: '1px solid red'`. Use an envUI color token instead, so the color follows the theme and keeps its contrast. The message suggests the semantic role of the property: a text color such as `var(--env-color-fg-default)` for `color`, `fill` and `stroke`, a `var(--env-color-bg-…)` background, or a `var(--env-color-border-…)` boundary for borders and outlines:

```text
Raw color #fff in an inline style: use an envUI color token instead, such as var(--env-color-fg-default) or another var(--env-color-fg-…) role, so the color follows the theme and keeps its contrast.
```

The token names come from [`src/data/tokens.json`](src/data/tokens.json). Before every pack, the envUI repository's `scripts/build/SyncLintPackages.ts` rewrites it from the library's generated token list (`packages/ui/src/generated/tokens.json`), so a release names the tokens of the same envUI release, and the tests fail when a message or this README names a token that does not exist.

Values that depend on state, spread objects and custom properties are checked too, including an inline override of envUI's own tokens. A template literal is read as one value, each expression standing for a literal channel: `` `rgb(${r} 0 0)` `` is reported, as is the `#fff` in `` `url('${a}') #fff` ``, and the strings in its expressions are checked on their own. A `#` followed by an expression is a hex color built from it, as in `` `#${hex}` `` or `` `#fff${alpha}` ``, also in a custom property, except inside `url()` and CSS strings, where `` `url(#${id})` `` refers to an element. Strings joined with `+` are read as one value the same way, so `'#' + hex` is a hex color built from `hex`. Calls are read through, their callee and their arguments alike: `darken('#123456', 0.1)`, `'#fff'.toUpperCase()`, `mergeStyles(base, { color: 'red' })` and `useMemo(() => ({ color: '#fff' }), [])` are reported. Strings that only choose a style rather than spell it are not read: a member's key, as in ``styles[`#${id}`]`` or ``theme[`#${id}`]``, and the arguments of a DOM lookup by selector or id, `querySelector`, `querySelectorAll`, `closest`, `matches` and `getElementById`, as in ``pick(document.querySelector(`#${id} .x`))``. A relative color derived from a token, `hsl(from var(--env-color-fg-link) h s calc(l - 10))`, and `color-mix()` of tokens pass. So does a function whose channels all come from custom properties, each channel a `var()` whose fallback, if any, is `var()`s too, whose own fallbacks are `var()`s in turn, as in `rgb(var(--…, var(--…, var(--…))))`, up to eight levels of fallbacks deep, where the [Stylelint config](https://github.com/envsemble/envUI/tree/main/packages/stylelint-config) stops too, with or without an alpha after the `/` or as the last of two or four comma-separated arguments that is a literal number or percentage, or one `var()` whose fallbacks are `var()`s as a channel's are, `rgb(var(--…) / 50%)` and `rgba(var(--…), var(--…))` alike, and one `var()` that holds all three channels, `rgb(var(--…))`. Any other channel, such as `calc(255)`, `none` or a fallback such as `var(--…, 255 0 0)`, makes the color raw, as does any other alpha, such as `none` or `calc(1 - var(--…))`, and so do fallbacks nested nine levels deep or more. `currentColor`, `transparent`, `url()` references and colors inside CSS strings, such as `content: '"rgb(1 2 3)"'`, pass. Style sheets are the [Stylelint config](https://github.com/envsemble/envUI/tree/main/packages/stylelint-config)'s concern. The rule has no options.

### no-raw-graphics

Reports pictures that skip envUI's Graphic, the component for an application's own logos, icons and pictures, and envUI's icons:

- a raw `<img>`, whose size comes from the file rather than envUI's steps:

  ```text
  Use envUI's Graphic instead of a raw <img>: import { Graphic } from '@envsemble/envui'. Its size comes from envUI's steps, not the file's: <Graphic src={logo} alt="Acme" size="md" />, or for a photo <Graphic src={photo} alt="…" size="fill" aspect="16/9" fit="cover" />.
  ```

- a raw `<svg>` with a fixed `width`, `height` or `fill`, a static value such as `width="24"`, `height="2rem"` or `fill="#1a73e8"`; the message names the attributes it found:

  ```text
  A raw <svg width="24" height="24"> takes its size from the file: pass it to an icon slot, such as Button's startIcon, or wrap it in envUI's <Graphic alt="">: import { Graphic } from '@envsemble/envui'.
  ```

  A component's own svg, one that spreads the props it is given, as in `<svg width="24" height="24" {...props}>`, or the root that a function component, a function whose name or variable is capitalized, returns, is fixed where it is written instead:

  ```text
  A component's <svg width="24" height="24"> takes its size from the file: write width="1em" height="1em", or leave them out, so it follows its slot or the text.
  ```

  For a fixed `fill`, it says to write `fill="currentColor"`, so it takes the text color.

- an import from another icon package, `lucide-react`, `react-icons`, `@heroicons/react`, `@mui/icons-material`, `@tabler/icons-react`, `@phosphor-icons/react` or `phosphor-react`, or a path inside one, such as `react-icons/fa`, by `import`, `export … from`, `require()`, `import()` with a literal and TypeScript's `import … = require()`:

  ```text
  Use envUI's icons instead of lucide-react: import { IconSearch } from '@envsemble/envui/icons/Search'. For the app's own icons and logos, use Graphic: import { Graphic } from '@envsemble/envui'.
  ```

- a `<Graphic>` without `alt`:

  ```text
  Graphic needs alt: what the picture says, such as the company's name, or alt="" when the text beside it says it already.
  ```

- a margin on a `<Graphic>`, any `margin*` property of an object literal in its `style`, such as `marginInlineStart` or `'margin-left'`, which makes up for empty edges inside the file; a margin of zero, such as `margin: 0` or `'0px'`, passes:

  ```text
  A margin on a Graphic makes up for the file's empty edges: trim the file once with npx envui-graphic <file>, and drop the margin.
  ```

A `Graphic` counts as envUI's when it is imported from `@envsemble/envui` or a module listed in [`reexportModules`](#settings), under any local name or through a namespace, or, when nothing in the file declares it, by its written name. Another library's or the application's own `Graphic` is not checked.

What passes:

- an svg whose size follows the text or its container and whose fill is the text color, as envUI's own icons write it, `width="1em" height="1em" fill="currentColor"`: sizes in `em`, `ex`, `ch`, `cap`, `ic`, `lh` or `%`, `auto` and `inherit`, and fills `currentColor`, `none`, `inherit` and `transparent`. A custom icon component written that way passes;
- an svg with `width="0" height="0"`, which only holds definitions, such as gradients or filters, and one whose attributes are computed, as in `width={size}`;
- an svg in an icon slot, whose slot sizes it: a prop or an object's property named `icon`, `start` or ending in `Icon`, such as `startIcon={<svg width="24" …>}`, List.Item's `start`, or `icon: <svg …>` in an array of destinations;
- an svg that is the child of a Graphic, directly or through a condition: `<Graphic alt=""><svg …></Graphic>`, `<Graphic alt="">{dark ? <svg …> : <svg …>}</Graphic>` or `{show && <svg …>}`;
- an `<img>` or svg that a part renders in place of its own element, through the `render` prop, as [no-html-elements](#no-html-elements) skips it: `<Avatar.Image render={<img … />} />`;
- type-only imports, such as `import type { LucideProps } from 'lucide-react'`, which render nothing;
- a Graphic that spreads props, which may supply `alt`, and a `style` that isn't an object literal, such as `style={styles.logo}`.

Options:

| Option  | Default | Meaning                                                                                                                                               |
| ------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `allow` | `[]`    | Icon packages to allow, by the names above, such as `react-icons` for `react-icons/si` and its other paths. An unknown name is a configuration error. |

## Development

Run from the envUI repository root:

```sh
npm test --workspace @envsemble/eslint-plugin-envui           # the rule and package tests
npm run tokens:build                                           # update the token names from the library
npm run dogfood --workspace @envsemble/eslint-plugin-envui     # count reports in the catalogue and test fixture
```

The root `npm test` runs these tests too. The dogfood run only counts: envUI's own catalogue and fixture render raw elements on purpose, so the plugin is not enforced on this repository.
