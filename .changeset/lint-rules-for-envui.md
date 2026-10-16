---
'@envsemble/eslint-plugin-envui': major
'@envsemble/stylelint-config-envui': major
---

The first release: lint rules that point people and coding agents in applications to envUI instead of hand-rolled controls and envUI's private markup. Each message names the envUI component or token to use and how to import it.

- `@envsemble/eslint-plugin-envui`, for ESLint 10 flat config, with `configs.recommended`:
  - `no-html-elements`: raw `<button>`, `<input>` by type, `<select>`, `<textarea>`, `<dialog>`, `<table>`, `<details>`, `<progress>`, `<meter>`, `<kbd>`, anchors used as buttons, focusable click handlers and widget roles such as `role="menu"`, each with the envUI component that replaces it. Elements a part renders through `render`, and entries named in `allow`, pass.
  - `no-private-classes`: `env-` classes in `className`, class-name helpers, `classList`, DOM and browser-test selectors and style sheets in JavaScript. `env-theme` is allowed.
  - `no-raw-colors`: literal colors in inline styles.
  - `no-renamed-exports`: names envUI 0.7 exported and 1.0 renamed or made internal, with the 1.0 name, and namespaces such as `Menu` rendered as components.
- `@envsemble/stylelint-config-envui`, for Stylelint 17: no selectors of `env-` classes besides `.env-theme`, no raw colors, `z-index` only from custom properties, and px only for hairlines.

Both are released with `@envsemble/envui`, at its version; install the same version as envUI.
