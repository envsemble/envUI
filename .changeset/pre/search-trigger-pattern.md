---
'@envsemble/envui': major
'@envsemble/envui-codemods': major
---

SearchTrigger is gone: CommandPalette's page builds the button that opens the palette from a secondary Button with the Search icon, its label and the shortcut's keys, or from a ghost IconButton in a Tooltip, and the application listens for ⌘K or Ctrl+K itself, once.

- SearchTrigger and `SearchTriggerProps` go, with `messages.searchTrigger`, the part classes `env-search-trigger`, `env-search-trigger-label`, `env-search-trigger-shortcut` and `env-search-trigger-tooltip`, and the page `components/search-trigger`, which opens CommandPalette's page now.
- Button takes `end`: quiet content after the label, such as the Kbd of a shortcut, in the button's content color with outlined key caps, so it keeps its contrast on every variant, and at the far end of a button wider than its content, the part `env-button-end`. Kbd takes `--env-kbd-separator-fg` for the + between keys.
- `v1-names` reports SearchTrigger and `SearchTriggerProps` where they are used, and `v1-classes` the `env-search-trigger-*` classes, each with a pointer to CommandPalette's page; no codemod rewrites them.

Migration guide: [Folded components and patterns](https://github.com/envsemble/envUI/blob/main/docs/migration.md#folded-components-and-patterns).
