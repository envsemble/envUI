---
'@envsemble/envui': minor
---

SegmentedControl: an item's `label` takes any content again, as in 1.x, such as a status dot beside the text; a full-width control still cuts it short and its tooltip shows the same content whole. An item takes `end`, content after the label and count such as a Badge, read as part of its name, and `className`. With `visibleLabel: false` a segment shows only its icon, as in a List and Grid view switch: its label still names it and shows in a tooltip on hover and keyboard focus. The type of an item's `label` widens from `string` to `ReactNode`: items an app passes in keep working, and code that reads `label` back as a string needs a check that it is one. See [SegmentedControl](https://github.com/envsemble/envUI/blob/main/docs/components/segmented-control.md).
