---
'@envsemble/eslint-plugin-envui': major
---

The first release: ESLint rules for applications built with envUI, for ESLint 10 flat config. They report what envUI already provides but the code builds by hand, and each message names the envUI component or token to use and how to import it. `configs.recommended` turns every rule on as an error.

- `no-html-elements`: raw `<button>`, `<input>` by type, `<select>`, `<textarea>`, `<dialog>`, `<table>`, `<details>`, `<progress>`, `<meter>` and `<kbd>`, anchors used as buttons, raw links, focusable elements that handle clicks, and widget roles such as `role="menu"`, each with the envUI component that replaces it. What a part renders through `render`, hidden inputs and entries named in `allow` pass.
- `no-private-classes`: envUI's `env-` classes in `className`, class-name helpers, `classList`, DOM and browser-test selectors and style sheets written in JavaScript. `env-theme` is allowed.
- `no-raw-colors`: literal colors in inline styles, with the envUI color tokens to use instead.
- `no-renamed-exports`: names that envUI 0.7 exported and 1.0 renamed or made internal, with the 1.0 name, and names that became namespaces, such as `Menu`, rendered as components.

The plugin is released with `@envsemble/envui` at the same version; install the version that matches envUI.
