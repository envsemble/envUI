---
'@envsemble/envui': major
---

A SegmentedControl's thumb says it shows with `data-placed`, once it has measured the chosen segment, rather than by losing its `hidden` attribute: it is hidden by its style until then. Restyle a shown thumb with `.env-segmented-control-thumb[data-placed]` in place of `.env-segmented-control-thumb:not([hidden])`.
