---
'@envsemble/envui': major
---

Alert and EmptyState say `danger` for the status that was `error`.

- Alert's `tone` is `info`, `success`, `warning` or `danger`, and `AlertTone` follows. Its dismiss button is a CloseButton, named Dismiss through `messages.alert.dismiss`, and Alert stays a server component.
- EmptyState's `tone` is `neutral` or `danger`. Its modifier classes are attributes: `env-empty-state-error` is `[data-tone='danger']` and `env-empty-state-center` is `[data-align='center']`; `env-empty-copy` is `env-empty-state-description`.

Migrate with the codemods: `envui-codemods v1-props` maps `tone="error"` to `tone="danger"` and reports an expression; `v1-classes` rewrites the classes.

Migration guide: [Overlays and feedback](../../docs/migration.md#overlays-and-feedback).
