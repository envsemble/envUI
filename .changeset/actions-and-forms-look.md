---
'@envsemble/envui': minor
'@envsemble/eslint-plugin-envui': minor
'@envsemble/stylelint-config-envui': minor
---

Buttons and fields share one shape, and their default look is quieter:

- **One corner for every control.** The new token `--env-radius-control` is the corner of every button, in each variant, of every text field, of the triggers of Select, Combobox and the pickers, of a Slider, and of a SegmentedControl's track. It follows the theme's `corners` setting, so `corners="sharp"` squares buttons and fields alike. Buttons are no longer pills, and icon buttons are rounded squares.
- **Secondary buttons are a quiet fill.** A secondary button, and an IconButton without a variant, takes the translucent neutral fill, `--env-color-bg-neutral-muted`, with no edge, and its hover and pressed grades under the pointer and while pressed; an outline button keeps the thin edge. Its focus ring lies on its edge, as an outline button's does. It still joins a primary button in a ButtonGroup.
- **A pressed toggle is gray.** Any Button or IconButton with `aria-pressed="true"` takes the selection fill, `--env-color-bg-selected`, which is neutral unless the theme's `selection` is `'accent'`, with `--env-button-selected` and `--env-button-selected-content` as its color properties. Toolbar.Button's toggles take it from Button now.
- **Fields show their label above the box.** TextField, Textarea, SearchField, Select, Combobox, DatePicker, TimePicker and MonthPicker put their label above the field, as Field does, in the label size and the muted color. The field is a plain box with one edge and the control corners; focus draws the edge in the accent, twice as thick, inward, with no ring around it. A small field keeps the small height while its label shows, and a prefix or suffix always shows.
- **Primary buttons are solid in dark.** A primary button takes `--env-color-bg-primary-strong` and its hover and pressed tokens, under `--env-color-fg-on-strong`, a white label, in every theme. In light the strong fill is the emphasis fill, so an area that recolors `--env-color-bg-primary-emphasis` recolors its buttons too; in dark it is a saturated blue, and the accent tone takes `--env-color-bg-accent-strong`. The dark emphasis fill, which checked checkboxes, switches that are on, radios, meters and spinners take with dark marks, is a stronger blue than before.
- Every slot of these components renders through the Slot part, which places what it holds and never styles it: the label and description of a field, a Checkbox, a Switch, a radio and a RadioGroup, a DropZone and a ColorPicker; a field's start icon and end action; an IconButton's icon, a SegmentedControl item's icon and a ColorSwatch's label. Their slot parts are listed among each component's parts.

Breaking changes:

- `env-text-field-border`, the notched border of a field, is removed, with its legend: the edge is the field's box, `env-text-field-control`, itself.
- `data-label-floating`, on the boxes of Select (`env-select-control`) and of the pickers (`env-date-picker-control`), is removed: the label no longer floats.
- A field's label is no longer inside `env-text-field-control`: it is the field root's first child, above the box. Styles that placed the label in the box, or read it there, read `.env-text-field > label` instead.
- A field's end action sits in a slot of its own, `env-text-field-end-action`, inside `env-text-field-end`; its start icon is the slot `env-text-field-start`, which no longer takes the accent while the field has focus.
- TextField's and SearchField's `prefix` and `suffix` take a string, which the field cuts short with an ellipsis, rather than any content.
- A SegmentedControl item's `label` and a Slider's `label` take a string, which they cut short with an ellipsis, rather than any content.
- A field's description renders as a `div` rather than a `small`, so it can hold any content.
- `--env-text-field-indicator` no longer colors the label, which stays in the label color while the field has focus.
- Primary buttons read `--env-color-bg-primary-strong` and `--env-color-fg-on-strong` rather than `--env-color-bg-primary-emphasis` and `--env-color-fg-on-emphasis`; an area that recolors the primary fill in dark sets `--env-color-bg-primary-strong` and its hover and pressed tokens too. See [Customize](https://github.com/envsemble/envUI/blob/main/docs/customizing.md#recolor-an-area).
- An IconButton that shows a ColorSwatch alone no longer drops its edge: it looks as every secondary icon button does.
- Button's `[data-tone='neutral']` and DatePicker's `[data-label-hidden]` leave their components' listed states, as no style of theirs reads them now: a button still writes its tone, and a picker field with its label hidden still carries `data-label-hidden` on its root, as TextField lists it.
