---
'@envsemble/envui': major
---

SegmentedControl takes `items`, and an unchosen segment's count keeps its contrast.

- `options` is `items`, and `SegmentedControlOption` is `SegmentedControlItem`.
- The segments' classes are `env-segmented-control-item`, `-item-label` and `-item-count`, for `env-segment`, `env-segment-label` and `env-segment-count`.
- An unchosen segment's count is muted text, at 4.5:1 on the rail, rather than 80% of the label's color, which measured about 3.6:1.
- SegmentedControl takes `ref`, `style`, `id` and the other attributes of its rail. Its page is listed under Forms & selection.

Migrate with the codemods: `envui-codemods v1-props` renames `options`, `v1-names` the type and `v1-classes` the classes.

Migration guide: [Content and display](../../docs/migration.md#content-and-display).
