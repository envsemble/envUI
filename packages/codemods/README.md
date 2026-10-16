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
| `--dry`                   | Reports what would change and writes nothing.                                                                                                              |
| `--print`                 | Prints every changed file.                                                                                                                                 |
| `--extensions=<list>`     | Reads only these comma-separated extensions. By default `js,jsx,ts,tsx,mjs,cjs,mts,cts`, and for v1-classes also `css,scss,sass,less,pcss`.                |
| `--ignore-pattern=<glob>` | Skips matching files and folders; repeatable. A pattern without a slash matches a name at any depth. `node_modules`, `dist` and `.git` are always skipped. |
| `--map=<path>`            | Uses another rename map with the shape of `src/maps/v1.json`, for example one component family at a time.                                                  |
| `--list`, `--help`        | Lists the transforms, or shows the usage.                                                                                                                  |

Paths default to the current folder. The CLI runs jscodeshift's runner with the `tsx` parser, or `ts` for `.ts`, `.mts` and `.cts` files, where `<T>value` is a type assertion. It prints a summary and every report as `REP <file> line <n>: …`, and exits with 1 when a file fails to parse or transform.

## Recommended order

1. Commit first: the codemods write files in place.
2. Run `npx envui-codemods v1-names src`.
3. Run `npx envui-codemods v1-classes src` over the scripts and style sheets.
4. Install `@envsemble/envui` 1.0, run your formatter, then type-check. Fix each reported line; removed exports stay in the code on purpose, so the type checker points at them too.

## v1-names

Rewrites imports from `@envsemble/envui` and `@envsemble/envui/theme-bootstrap`, and every reference bound to them. Imports from other packages and from `@envsemble/envui/icons`, `/content`, `/diff` and `/rich-text` are left alone.

- **Renamed exports.** `Input` becomes `TextField`, `NoticeProps` becomes `AlertProps`, and so on, in JSX, values, types and `typeof`. A shorthand property keeps its key: `{ Input }` becomes `{ Input: TextField }`. An aliased import keeps its alias: `Input as Field` becomes `TextField as Field`. When the new name is already used in the file, the import keeps the old name as an alias: `TextField as Input`.
- **Namespace parts.** `import { Menu, MenuItem, MenuSeparator }` becomes `import { Menu }`; `<Menu>` becomes `<Menu.Root>`, `<MenuItem>` becomes `<Menu.Item>`, `MenuItemProps` becomes `Menu.ItemProps` and `typeof Table` becomes `typeof Table.Root`. The same applies to Menubar, Table, Stat, List, NavList, Pager and `ToastProvider`, which becomes `Toast.Provider`. Type-only imports stay type-only: `import type { MenuItemProps }` becomes `import type { Menu }`, or is dropped when `Menu` is already imported. When the file already uses the namespace name, for instance for the `Menu` icon, the namespace is imported under a free alias such as `Menu as EnvMenu`. Existing `Menu.Root` and `Menu.Item` accesses are left as they are, so running the codemod again changes nothing.
- **Namespace imports.** With `import * as ui from '@envsemble/envui'`, `ui.Input` becomes `ui.TextField` and `<ui.MenuItem>` becomes `<ui.Menu.Item>`.
- **DirectionLink.** `<DirectionLink direction="previous">` becomes `<Pager.Previous>` and `direction="next"` becomes `<Pager.Next>`, without the prop.
- **Re-exports.** `export { Input } from '@envsemble/envui'` becomes `export { TextField } from '@envsemble/envui'`.
- **defaultThemeStorageKey.** References become the string `'env-theme'` and the import goes.

It reports instead of changing:

- removed exports, with what to use instead: `LoadingBar`, `LoadingBarProps`, the manual `Toast` (only its bare uses; `Toast.Provider` is the 1.0 API), `ToastProps`, `getInitials`, `useLinkComponent` and `useSidebarCompact`;
- `DirectionLink` with a dynamic, spread or missing `direction`, or used outside JSX; its import stays;
- re-exports and `export { … }` of namespace parts, `DirectionLink` and removed exports, which cannot keep their old name;
- names destructured from a namespace import, such as `const { MenuItem } = ui`.

## v1-classes

Renames 0.x `env-*` class names and custom properties. An entry also renames every name that continues it with a hyphen, the longest entry wins, and names that already have the new name are left alone: `env-notice-title` becomes `env-alert-title`, `--env-notice-tone` becomes `--env-alert-tone`, and `env-counter-badge` stays.

- **Style sheets** (`.css`, `.scss`, `.sass`, `.less`, `.pcss`): `.env-*` class selectors, including those inside `:is()` and `:not()`; `--env-*` custom property declarations and `var()` uses; and `[class~='env-*']`, `[class*='env-*']` and similar attribute selectors.
- **Scripts:** whole class tokens in strings and template literals inside JSX `className` and `class` attributes, including `classNames()`, `clsx()` and conditional expressions; `className` properties and assignments; selectors passed to `querySelector`, `querySelectorAll`, `closest` and `matches`; `classList` methods and `getElementsByClassName`; and `--env-*` custom properties in `style` attributes, string property keys, `style.setProperty()` and `var()` references in any string. Only the literals change, so the rest of the file keeps its formatting.

Both transforms keep a file's line endings, CRLF or LF, and its byte order mark; class names in template literals that span lines are renamed in CRLF files too.

## The rename map

`src/maps/v1.json` is the single source of the renames: `exports` (old export name to new name per entry point; a dot names a namespace part), `split` (components that became several parts, chosen by a prop value), `removed` (exports that became internal, with what to use instead), `classes` and `docs` (documentation page slugs). The transforms hardcode no names. Pass `--map` to run them with a map of the same shape; the map is checked before anything runs.

## Limitations

- Changed import declarations are printed again and can lose their line breaks; run your formatter afterwards.
- Class names built at run time, class strings kept in variables outside the contexts above, CSS-in-JS templates and HTML files are not changed.
- `require()`, dynamic `import()`, module mocks and `declare module '@envsemble/envui'` augmentations are not changed.
- In code that already uses 1.0, a bare use of a namespace that was a 0.x component, such as `Object.keys(Menu)`, would be read as the old component.
- To run a transform with jscodeshift directly, pass `--no-babel`: the transforms are ES modules, which jscodeshift's Babel register would break.
