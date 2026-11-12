---
'@envsemble/envui': major
---

SegmentedControl is segments in a recessed track, the chosen one raised on a thumb with a soft shadow, rather than Material's connected outlined segments: no outline, no lines between the segments and no check, and a chosen segment shows its icon. Tabs keep their indicator under the selected tab, so the two still read differently; the API stays. The check, `env-segmented-control-item-indicator`, is gone: select the chosen segment with `.env-segmented-control-item[data-checked]`. `--env-segmented-control-container` sets the track, the neutral fill by default, `--env-segmented-control-outline` an outline around the track, none by default, and `--env-segmented-control-selected` the thumb. At high contrast the thumb takes an edge in place of its shadow, and under forced colors the track an outline.
