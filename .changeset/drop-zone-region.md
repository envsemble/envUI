---
'@envsemble/envui': minor
---

DropZone takes `render`, another element to render the zone as, such as the application's own panel or table region, which then takes dropped files and gets the zone's `data-drag-over`; and `target={false}` leaves out the target button, for content with its own Browse button that opens the picker through `inputRef`, while the label and description name the zone as a group. See [DropZone](https://github.com/envsemble/envUI/blob/main/docs/components/drop-zone.md).
