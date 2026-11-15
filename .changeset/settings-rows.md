---
'@envsemble/envui': minor
'@envsemble/eslint-plugin-envui': minor
'@envsemble/stylelint-config-envui': minor
---

Settings screens come from List alone, and the rows around them look alike:

- **A row names its control.** `List.Item` takes `control`: the setting's Switch, Select, TextField, SearchField, Checkbox, RadioGroup, SegmentedControl or Slider, at the row's end. Given no label of its own, the control takes its accessible name from the row's `label` and its description from the row's `description`, so a settings row needs no hand-wired ids and isn't read twice. A control with its own label keeps it. SegmentedControl's `aria-label`, Slider's `label` and SearchField's `label` are optional for this; outside a row's `control` give them as before.
- **A titled group of rows.** `List.Root` takes `title`, a heading above the rows that names the list, `headingLevel` (2 by default) and `description`, a muted sentence under the title that describes it. New parts: `env-list-section`, `env-list-header`, `env-list-title`, `env-list-description` and the slot `env-list-item-control`.
- **Vertical radio rows follow the surface.** A vertical RadioGroup's rows read the same tokens as List rows: under the default `surface="plain"` they have no fill, hairlines between them and the radio showing the choice; under `surface="filled"` they are joined tiles with the outer corners and the selected fill, as before. Their padding and height match a List row's.
- **envUI's icons read `--env-icon-size`.** Every symbol icon is `--env-icon-size` square (the new part `env-icon-symbol`), so an icon in a `List.Item`'s `start` is the large icon size and centred on the row again, an icon in TopBar's and PageHeader's `start` the picture size, and elsewhere the control icon size rather than 1 em.
- **Fields that apply at once commit.** TextField and SearchField take `onValueCommitted`, called with the value on Enter and when the field loses focus with a value that changed; with it, Esc puts back the value last committed. Return `false` from it to reject the value, such as a port out of range: the value stays in the field to correct, and Esc still puts back the last value accepted.
- **Secondary and outline are told apart.** A secondary button is a quiet neutral fill, `--env-color-bg-neutral-muted`, with the control corners and no edge; an outline button keeps the thin edge.
- **A white page in light.** `--env-color-bg-page` is white in the light theme rather than a mid gray, so the frame and the content on it read crisp, with a hairline between them. The surfaces on it are tinted a step deeper: `--env-color-bg-default` (panes, sheets, Surface) gray 2, `--env-color-bg-muted` (cards and filled rows) gray 4, `--env-color-bg-recessed` gray 6, and `--env-color-bg-field` the recessed gray 6, each with its hover and pressed grades a step deeper; `--env-color-bg-raised` and `--env-color-bg-popup` stay white and part from the page by their edge. Dark and high contrast are unchanged. An application that set `--env-color-bg-page` to white or a light gray can drop that.
- **A lighter neutral selection.** `--env-color-bg-selected` and its hover and pressed grades are a step lighter in light (gray 11, 8 and 7) and in dark (gray 75, 80 and 84); a selected item keeps its second cue, its weight, bar or check.
- The guidance of Select, RadioGroup, SegmentedControl, Tabs and NavigationDrawer no longer sends a setting in circles: a setting in a row with a few options takes a Select in the row's `control`, RadioGroup is for options that need a sentence or must all stay in view, and SegmentedControl for views and filters.

Breaking changes:

- An envUI icon placed on its own is sized by `--env-icon-size` rather than 1 em of the text around it. To size one icon, set `--env-icon-size` on it or on its container.
- A vertical RadioGroup's rows have no fill and no selected fill under the default plain surface. For the tiles, set `surface="filled"` on the Theme.
