---
'@envsemble/envui': minor
---

`isPlaceholder()` is a type guard: `isPlaceholder(item) ? <Badge>…</Badge> : item.name` reads the loaded item's own `name`, a `string` rather than `string | undefined`, also where the items' ids are strings. A `Placeholder` comes only from `placeholders()`, so an object of the application's own no longer passes for one.
