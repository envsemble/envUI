---
'@envsemble/envui': minor
---

SegmentedControl and Tabs look clearly different, after Material, with their APIs unchanged. SegmentedControl, which picks a value, is connected segments in one outline, the chosen one in the selected fill, `--env-color-bg-selected`, with a check before its label in place of its icon (a new part, `env-segmented-control-item-check`); a new color property, `--env-segmented-control-outline`, sets the outline, and the fill behind the options is transparent by default. Tabs, which switch panels, are text tabs on no fill, whatever their buttons' variants: the selected one in the accent's text color with an indicator under it, at the start in a vertical rail. New color properties `--env-tabs-selected-content` and `--env-tabs-indicator` set the selected label and the indicator, and the rail is transparent unless `--env-tabs-container` sets it.
