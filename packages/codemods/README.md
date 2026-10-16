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
| `--map=<path>`            | Uses another rename map with the shape of `src/maps/v1.json`, for example one component family at a time.                                                  |
| `--list`, `--help`        | Lists the transforms, or shows the usage.                                                                                                                  |

Paths default to the current folder. The CLI runs jscodeshift's runner with the `tsx` parser, or `ts` for `.ts`, `.mts` and `.cts` files, where `<T>value` is a type assertion. It names every file it changes (`Changed src/menu.tsx`, or `Would change` with `--dry`), prints a summary and every report as `REP <file> line <n>: …`, and exits with 1 when a file fails to parse or transform.

## Recommended order

1. Commit first: the codemods write files in place.
2. Run `npx envui-codemods v1-names src`.
3. Run `npx envui-codemods v1-classes src` over the scripts and style sheets.
4. Install `@envsemble/envui` 1.0, run your formatter, then type-check. Fix each reported line; removed exports stay in the code on purpose, so the type checker points at them too.

## v1-names

Rewrites imports from `@envsemble/envui` and `@envsemble/envui/theme-bootstrap`, and every reference bound to them. Imports from other packages and from `@envsemble/envui/icons`, `/content`, `/diff` and `/rich-text` are left alone.

- **Renamed exports.** `Input` becomes `TextField`, `NoticeProps` becomes `AlertProps`, and so on, in JSX, values, types and `typeof`. A shorthand property keeps its key: `{ Input }` becomes `{ Input: TextField }`. An aliased import keeps its alias: `Input as Field` becomes `TextField as Field`. When the new name is already used in the file, the import keeps the old name as an alias: `TextField as Input`.
- **Namespace parts.** `import { Menu, MenuItem, MenuSeparator }` becomes `import { Menu }`; `<Menu>` becomes `<Menu.Root>`, `<MenuItem>` becomes `<Menu.Item>`, `MenuItemProps` becomes `Menu.ItemProps` and `typeof Table` becomes `typeof Table.Root`. The same applies to Menubar, Table, Stat, List, NavList, Pager and `ToastProvider`, which becomes `Toast.Provider`. Type-only imports stay type-only: `import type { MenuItemProps }` becomes `import type { Menu }`, or is dropped when `Menu` is already imported. When the file already uses the namespace name, for instance for the `Menu` icon, the namespace is imported under a free alias such as `Menu as EnvMenu`. Existing `Menu.Root` and `Menu.Item` accesses are left as they are, so running the codemod again changes nothing.
- **Shadowing locals.** Each rewritten reference must reach the import. Where a local in an inner scope has the name the rewrite would write, such as a `const Menu` in the function that renders `<MenuItem>`, or a local `TextField` where `<Input>` becomes `TextField`, the reference there uses a second import under a free alias, `<EnvMenu.Item>` with `Menu as EnvMenu`, and the run reports each one. Scopes follow the language: a `const`, `let` or `class` in a block, a `for` head, a `case` or a `catch` clause hides an import only inside it, a function body's `var` hides it in the body but not in the parameter defaults, an enum member inside its enum, and type parameters, local types and namespaces only from the types they declare, as TypeScript keeps values, types and namespaces apart: a local `interface Input` hides the import from `let field: Input` but not from `<Input />`, and the first name of `typeof Input.displayName` is a value, which a local `const Input` hides. Where a renamed reference would be read by a local of the new name, such as a type parameter `TextFieldProps` in the function that uses `InputProps`, the import keeps its old name as an alias: `TextFieldProps as InputProps`.
- **Namespace imports.** With `import * as ui from '@envsemble/envui'`, or `import ui = require('@envsemble/envui')` in TypeScript, `ui.Input` becomes `ui.TextField`, `<ui.MenuItem>` becomes `<ui.Menu.Item>` and `typeof ui.Input` becomes `typeof ui.TextField`. A literal key is followed too: `ui['Input']` becomes `ui['TextField']`, and `ui['MenuItem']` becomes `ui.Menu.Item`.
- **DirectionLink.** `<DirectionLink direction="previous">` becomes `<Pager.Previous>` and `direction="next"` becomes `<Pager.Next>`, without the prop.
- **Re-exports.** `export { Input } from '@envsemble/envui'` becomes `export { TextField } from '@envsemble/envui'`.
- **defaultThemeStorageKey.** References become the string `'env-theme'` and the import goes.

It reports instead of changing:

- removed exports, with what to use instead: `LoadingBar`, `LoadingBarProps`, the manual `Toast` (only its bare uses; `Toast.Provider` is the 1.0 API), `ToastProps`, `getInitials`, `useLinkComponent` and `useSidebarCompact`;
- `DirectionLink` with a dynamic, spread or missing `direction`, or used outside JSX; its import stays;
- re-exports and `export { … }` of namespace parts, `DirectionLink` and removed exports, which cannot keep their old name;
- a namespace import read with a key computed at run time, such as `ui[name]`;
- names destructured from a namespace import, such as `const { MenuItem } = ui`, `({ MenuItem } = ui)` or `const { ['MenuItem']: Item } = ui`. `const { Menu, Toast } = ui` names 1.0 namespaces too, and is reported only where `Menu` or `Toast` is then used as the 0.x component rather than through its members, as in `<Menu.Root>`;
- parts destructured from a namespace that was a 0.x component, such as `const { Root, Item } = Menu` or `const { Cell } = ui.Table`, which are 1.0 code and stay as they are rather than becoming `Menu.Root`.

## v1-classes

Renames 0.x `env-*` class names and custom properties. An entry also renames every name that continues it with a hyphen, the longest entry wins, and names that already have the new name are left alone: `env-notice-title` becomes `env-alert-title`, `--env-notice-tone` becomes `--env-alert-tone`, and `env-counter-badge` stays.

A few classes depend on where they are. 0.7 gave DiffCount's label the counter's class, `env-counter-label`, which becomes `env-counter-badge-label`; 1.0's DiffStat names its label `env-diff-stat-label`. In a selector that puts the class inside DiffCount, such as `.env-diff-count .env-counter-label` or `.env-diff-count > .env-counter-label`, the label takes the DiffStat name. A selector nested inside a DiffCount rule in Sass or Less, and class names in markup, are not changed by context: rename those by hand.

- **Style sheets** (`.css`, `.scss`, `.sass`, `.less`, `.pcss`): `.env-*` class selectors, including those inside `:is()` and `:not()`; `--env-*` custom property declarations and `var()` uses; and `[class~='env-*']`, `[class*='env-*']` and similar attribute selectors.
- **Scripts:** whole class tokens in strings and template literals inside JSX `className` and `class` attributes, including `classNames()`, `clsx()` and conditional expressions; `className` properties and assignments; selectors passed to `querySelector`, `querySelectorAll`, `closest` and `matches`; `classList` methods and `getElementsByClassName`; and `--env-*` custom properties in `style` attributes, string property keys, `style.setProperty()` and `var()` references in any string. Only the literals change, so the rest of the file keeps its formatting.

Both transforms keep a file's line endings, CRLF or LF, and its byte order mark; class names in template literals that span lines are renamed in CRLF files too.

## The rename map

`src/maps/v1.json` is the single source of the renames: `exports` (old export name to new name per entry point; a dot names a namespace part), `split` (components that became several parts, chosen by a prop value), `removed` (exports that became internal, with what to use instead), `classes`, `classesWithin` (class renames inside an ancestor's selector) and `docs` (documentation page slugs). The transforms hardcode no names. Pass `--map` to run them with a map of the same shape; the map is checked before anything runs.

## Limitations

- Changed import declarations are printed again and can lose their line breaks; run your formatter afterwards.
- Comments stay with what they describe. A comment on a renamed specifier stays on it, and the comments on a specifier that is removed move to the namespace specifier that takes its place, as `Menu` takes the place of `MenuItem`, or a value import of `Menu` takes that of `import type { Menu }`; an import whose namespace specifier gets a line comment is printed with a name on each line, so the comment stays above the name it describes; where none does, as when `Menu` was already imported, they are dropped and reported with their text. When an import is removed because its names moved into another import, a directive about its line (`@ts-ignore`, `eslint-disable-next-line`, `prettier-ignore` and the like) moves with the names to that import; when nothing replaces the import, as for `defaultThemeStorageKey`, the directive is dropped and reported. Other comments above a removed import, such as a file header, stay in place on the next statement.
- A `@ts-expect-error` above an import, re-export or specifier whose names change is dropped and reported rather than kept or moved: it expected an error from the 0.x names, and TypeScript fails on a `@ts-expect-error` that has no error below it (TS2578). Where the import also lists names that stay as they are, the error may have been theirs, and the report names them, so the comment can be put back if they still have it.
- Class names built at run time, class strings kept in variables outside the contexts above, CSS-in-JS templates and HTML files are not changed.
- `require()` outside `import ui = require(…)`, dynamic `import()`, module mocks and `declare module '@envsemble/envui'` augmentations are not changed.
- In code that already uses 1.0, a bare use of a namespace that was a 0.x component, such as `Object.keys(Menu)`, would be read as the old component.
- To run a transform with jscodeshift directly, pass `--no-babel`: the transforms are ES modules, which jscodeshift's Babel register would break.
