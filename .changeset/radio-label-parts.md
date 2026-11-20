---
'@envsemble/envui': major
---

Radio names its label's parts as Checkbox and Switch do: `env-radio-label` is the label with the description under it, and `env-radio-label-content` the slot inside it. See [Customize](https://github.com/envsemble/envUI/blob/main/docs/customizing.md).

Breaking changes:

- `env-radio-label` is now the wrapper of the label and its description, which had no class: a selector that targeted the label's slot as `env-radio-label` targets `env-radio-label-content`.
