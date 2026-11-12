---
'@envsemble/envui': minor
---

Select is an outlined field, as TextField, Combobox and DatePicker are: its label rests inside the well and floats into the outline, and the chevron sits at the end. `variant` is a field's, `outline`, the default, or `floating`, for a long form on a page; the Button variants `secondary` and `outline` are gone, and a Select with `variant="outline"` keeps working. A Select without a visible label, with `aria-label` or `showLabel={false}`, as in a toolbar, is as wide as its longest option. Select takes `open` and `onOpenChange`, which receives why, `readOnly` and `showLabel`; `className` reaches the field's root. The well is `env-select-control`, the chosen option `env-select-value`, the placeholder `env-select-placeholder`, the chevron's place `env-select-end` and the hidden option labels that size it `env-select-sizer`; `--env-select-container`, `--env-select-content` and `--env-select-outline` color the well, the value and the edge.
