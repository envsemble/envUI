---
'@envsemble/envui': major
---

CommandPalette groups its items only as Select and Combobox do, in `{ label, items }` groups; an item's `group` key is removed.

Breaking changes:

- `CommandPaletteItem.group` is removed. Pass the groups in `items` or `suggestedItems`: `items={[{ label: 'Documents', items: documents }]}` in place of `items={documents.map((document) => ({ ...document, group: 'Documents' }))}`. A group with no items shows no heading.
- `CommandPaletteItem` reserves `items`: an entry with an `items` array is a group.
