---
'@envsemble/eslint-plugin-envui': major
---

The first release: ESLint rules for applications built with envUI, for ESLint 10 flat config. They report what envUI already provides but the code builds by hand, and each message names the envUI component or token to use and how to import it. `configs.recommended` turns every rule on as an error.

- `no-html-elements`: raw `<button>`, `<input>` by type, `<select>`, `<textarea>`, `<dialog>`, `<table>`, `<details>`, `<progress>`, `<meter>` and `<kbd>`, anchors used as buttons, raw links, focusable elements that handle clicks, and widget roles such as `role="menu"`, each with the envUI component that replaces it. What a part renders through `render`, hidden inputs and entries named in `allow` pass.
- `no-private-classes`: envUI's `env-` classes in `className`, class-name helpers, `classList`, DOM and browser-test selectors and style sheets written in JavaScript. `env-theme` is allowed.
- `no-raw-colors`: literal colors in inline styles, also hex colors built in a template literal such as `` `#${hex}` `` or by concatenation such as `'#' + hex`, also through calls, such as `darken('#123456', 0.1)` or a style object passed to a helper, but not strings that only choose a style, such as a member's key or the selector given to `querySelector`, `closest` or another DOM lookup, with the envUI color tokens to use instead. Like the Stylelint config, it follows `var()` fallbacks eight levels deep, in the channels and the alpha alike, and reports deeper nesting; an alpha is a literal number or percentage or a `var()`.
- `no-renamed-exports`: names that envUI 0.7 exported and 1.0 renamed or made internal, with the 1.0 name, and names that became namespaces, such as `Menu`, rendered as components.

An application that re-exports envUI from a module of its own lists it in `settings.envui.reexportModules`: `no-html-elements` and `no-renamed-exports` then count the names imported from it as envUI's. A path, best written absolute as `path.resolve(import.meta.dirname, 'src/ui')`, names the module's file, and matches every relative import that resolves to it, with or without its extension or `/index`; a relative entry such as `./src/ui` is read from ESLint's working directory, and an entry that names no existing module is a configuration error. An alias such as `@/components/ui` matches as written. `no-renamed-exports` then says to update that module first and rename imports through it by hand, since the v1-names codemod rewrites imports from `@envsemble/envui` only.

The plugin is released with `@envsemble/envui` at the same version; install the version that matches envUI.

Migration guide: [Upgrade from envUI 0.x to 1.0](https://github.com/envsemble/envUI/blob/main/docs/migration.md).
