---
'@envsemble/envui': major
'@envsemble/envui-codemods': major
'@envsemble/eslint-plugin-envui': patch
---

EmptyState is a pattern now, not a component: it carries no behavior, and its parts are envUI's own.

- EmptyState and `EmptyStateProps` are gone. The empty states pattern, `docs/patterns/empty-states.md`, builds one from a Column with an icon, a Text heading, a Text sentence and a Button: at the start of a card or under a list's toolbar, or centred with a larger icon where it takes a region's place. Its notes keep what EmptyState took care of: the heading's level in the page's outline, which `headingLevel` set, and the alert role of a failure, which `tone="danger"` set.
- The part classes `env-empty-state` and `env-empty-state-description` go, with `data-tone` and `data-align`. CodeDiff shows a failure to load with its own parts, `env-code-diff-failed` and `env-code-diff-failed-icon`, as an alert. The `empty-state` page opens the pattern.
- `v1-names` reports EmptyState where it is used, and `v1-classes` its classes and 0.x's `env-empty-copy`; no codemod rewrites them. `envui/no-renamed-exports` reports them with the pattern to use instead.

Migration guide: [Folded components and patterns](https://github.com/envsemble/envUI/blob/main/docs/migration.md).
