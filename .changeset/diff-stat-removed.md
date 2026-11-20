---
'@envsemble/envui': major
---

DiffStat leaves the library: a change's line counts as one pill is one product's display, and CodeDiff's file header already shows them. An app that lists changed files with their size copies the example on [Code](https://github.com/envsemble/envUI/blob/main/docs/components/code.md) into its own code: a Badge with the counts in the success and danger text colors, hidden from assistive technology, and their meaning in a VisuallyHidden. `countDiffLines` from `@envsemble/envui/diff` still counts them.

Breaking changes:

- `DiffStat` and `DiffStatProps` are removed, with the parts `env-diff-stat`, `env-diff-stat-additions`, `env-diff-stat-deletions` and `env-diff-stat-label` and EnvUIProvider's `messages.diffStat`: copy the changed files example from Code's page, or write `<Badge>` with `+12` in `var(--env-color-fg-success)`, `−3` in `var(--env-color-fg-danger)` and `<VisuallyHidden>12 added lines and 3 removed lines</VisuallyHidden>`.
