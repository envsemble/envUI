---
'@envsemble/eslint-plugin-envui': minor
---

`label-vocabulary` is a warning in `configs.recommended`, not an error: it is the one rule about wording among rules that report mistakes, and a team that keeps a word for its domain can still list it in `allow`. Set it to `'error'` in your config to keep it failing the lint. See [label-vocabulary](https://github.com/envsemble/envUI/tree/main/packages/eslint-plugin#label-vocabulary).
