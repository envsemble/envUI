---
'@envsemble/envui': major
'@envsemble/envui-codemods': major
'@envsemble/eslint-plugin-envui': patch
---

LoadingState folds into Spinner: a Spinner with `showLabel` shows its label beside it.

- `<Spinner label="Loading project" showLabel />` is a status line for loading with no known shape: a busy `role="status"` that centres the spinner and its muted label in its row, the label read as the status. Without a `label` it says Loading, from EnvUIProvider's `messages.common.loading`. The label is `env-spinner-label`, and the spinner carries `data-show-label`. Without `showLabel`, a Spinner is as it was: a progress bar named by `label`, or hidden.
- LoadingState and `LoadingStateProps` are gone: `<LoadingState label>` is `<Spinner label showLabel>`, and `env-loading-state` and `env-loading-state-label` are `.env-spinner[data-show-label]` and `env-spinner-label`. CodeDiff shows its loading so.
- `v1-structure` rewrites a LoadingState without children into the Spinner and reports the children of one that has them; `v1-names` renames `LoadingStateProps` to `SpinnerProps`, and `v1-classes` renames the classes. A structure case can be `childless`, for elements without children. `envui/no-renamed-exports` reports LoadingState with what replaces it.

Migration guide: [Folded components and patterns](https://github.com/envsemble/envUI/blob/main/docs/migration.md).
