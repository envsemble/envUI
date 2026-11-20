---
'@envsemble/eslint-plugin-envui': major
---

`configs.recommended` reports only envUI used wrongly. The rules that set the application's own policy, `no-html-elements` (envUI's components in place of plain HTML) and `label-vocabulary` (the words of envUI's writing guide), move to the new opt-in `configs.strict`, which extends `configs.recommended` and turns both on as errors. See [the ESLint plugin](https://github.com/envsemble/envUI/tree/main/packages/eslint-plugin#use).

Breaking changes:

- `configs.recommended` no longer turns on `no-html-elements` and `label-vocabulary`. To keep them, use `envui.configs.strict` in place of `envui.configs.recommended`, or turn either on yourself, such as `rules: { 'envui/no-html-elements': 'error' }`.
