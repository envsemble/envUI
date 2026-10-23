---
'@envsemble/envui': major
'@envsemble/envui-codemods': major
---

SearchTrigger is a pattern now, not a component: the search trigger pattern builds it from a secondary Button with the Search icon, its label and the shortcut's keys, or from a ghost IconButton in a Tooltip, and the application listens for ⌘K or Ctrl+K itself, once.

- SearchTrigger and `SearchTriggerProps` go, with `messages.searchTrigger`, the part classes `env-search-trigger`, `env-search-trigger-label`, `env-search-trigger-shortcut` and `env-search-trigger-tooltip`, and the page `components/search-trigger`, which is `patterns/search-trigger` now.
- Button takes `end`: quiet content after the label, such as the Kbd of a shortcut, in the muted color and at the far end of a button wider than its content, the part `env-button-end`.
- `v1-names` reports SearchTrigger and `SearchTriggerProps` where they are used, and `v1-classes` the `env-search-trigger-*` classes, each with a pointer to the pattern; no codemod rewrites them.

Migration guide: [Folded components and patterns](https://github.com/envsemble/envUI/blob/main/docs/migration.md#folded-components-and-patterns).
