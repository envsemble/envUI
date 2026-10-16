# envUI agent benchmark: 2026-10-16-baseline-hard

- Date: 2026-10-16; condition: `baseline`; fixture: `hard`
- envUI 0.7.0 from a packed tarball (sha256 b101269e531fb91ca6e5753576ceb7c61076ded368500988ad88dd4bd0475fcd, built from commit 226168e87034)
- Claude Code (`claude`): 2.1.300 (Claude Code), model `claude-opus-5-5`, effort `high`
- Codex (`codex`): codex-cli 0.162.1, model `gpt-6-luna`, effort `high`
- 13 tasks, one run per task and agent, 12 min timeout, 4 runs in parallel
- Isolation audit: no run escaped (26 audited)
- Transcripts and workspaces: `~\AppData\Local\Temp\agent-workspaces\2026-10-16-baseline-hard` (not in git)

## Aggregates

| Condition | Agent | Runs | Mean score | Median | Escaped | Read envUI docs | Typecheck pass | Capabilities via envUI | Runs with raw HTML | Local duplicates | envUI type errors | Raw style values | UI packages | Suppressions | Timeouts / errors | Time | Cost | Tokens in / cached / out |
|---|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| baseline | claude | 13 | **92.6** | 99 | 0 | 13/13 | 100% | 36/43 | 3/13 | 0 | 0 | 26 | 0 | 0 | 0 / 0 | 29.5 min | $9.96 | 12,680k / 12,067k / 133k |
| baseline | codex | 13 | **50.5** | 48 | 0 | 1/13 | 100% | 1/43 | 12/13 | 2 | 0 | 293 | 0 | 0 | 0 / 0 | 8.3 min | n/a | 2,219k / 1,951k / 40k |

## Runs

| Task | Agent | Score | Read envUI docs | Typecheck | Capabilities via envUI | Raw HTML (weighted) | Duplicates | envUI errors | Raw styles | Time | Status | Isolation |
|---|---|--:|--:|---|---|--:|--:|--:|--:|--:|---|---|
| sidebar | claude | **100** | yes | pass | 2/2 | 0 | 0 | 0 | 0 | 2.1 min | completed | ok |
| sidebar | codex | **39** | no | pass | 0/2 | 4 | 1 | 0 | 44 | 0.7 min | completed | ok |
| settings-form | claude | **99.5** | yes | pass | 5/5 | 0 | 0 | 0 | 1 | 1.6 min | completed | ok |
| settings-form | codex | **40** | no | pass | 0/5 | 5 | 0 | 0 | 23 | 0.7 min | completed | ok |
| projects-table | claude | **88.5** | yes | pass | 4/5 | 1 | 0 | 0 | 1 | 3.2 min | completed | ok |
| projects-table | codex | **48** | no | pass | 0/5 | 3 | 0 | 0 | 12 | 0.7 min | completed | ok |
| confirm-delete | claude | **99.5** | yes | pass | 2/2 | 0 | 0 | 0 | 1 | 1 min | completed | ok |
| confirm-delete | codex | **61** | no | pass | 0/2 | 1 | 0 | 0 | 0 | 0.4 min | completed | ok |
| save-toast | claude | **71.7** | yes | pass | 1/3 | 1 | 0 | 0 | 2 | 1.1 min | completed | ok |
| save-toast | codex | **56** | no | pass | 0/3 | 1 | 0 | 0 | 22 | 0.9 min | completed | ok |
| page-header | claude | **91.3** | yes | pass | 3/4 | 0 | 0 | 0 | 0 | 1.9 min | completed | ok |
| page-header | codex | **56** | no | pass | 0/4 | 1 | 0 | 0 | 17 | 0.5 min | completed | ok |
| command-palette | claude | **99** | yes | pass | 3/3 | 0 | 0 | 0 | 2 | 5.8 min | completed | ok |
| command-palette | codex | **35** | no | pass | 0/3 | 8 | 1 | 0 | 63 | 0.8 min | completed | ok |
| tabs-counts | claude | **100** | yes | pass | 2/2 | 0 | 0 | 0 | 0 | 1.9 min | completed | ok |
| tabs-counts | codex | **82.5** | yes | pass | 1/2 | 0 | 0 | 0 | 0 | 0.6 min | completed | ok |
| account-menu | claude | **100** | yes | pass | 3/3 | 0 | 0 | 0 | 0 | 0.9 min | completed | ok |
| account-menu | codex | **48** | no | pass | 0/3 | 3 | 0 | 0 | 32 | 0.5 min | completed | ok |
| file-upload | claude | **75.3** | yes | pass | 2/3 | 2 | 0 | 0 | 14 | 3.2 min | completed | ok |
| file-upload | codex | **40** | no | pass | 0/3 | 5 | 0 | 0 | 36 | 0.7 min | completed | ok |
| date-form | claude | **93** | yes | pass | 4/5 | 0 | 0 | 0 | 0 | 3.6 min | completed | ok |
| date-form | codex | **41** | no | pass | 0/5 | 6 | 0 | 0 | 8 | 0.9 min | completed | ok |
| loading-skeletons | claude | **85.8** | yes | pass | 2/3 | 0 | 0 | 0 | 5 | 2.3 min | completed | ok |
| loading-skeletons | codex | **56** | no | pass | 0/3 | 1 | 0 | 0 | 15 | 0.5 min | completed | ok |
| inline-notice | claude | **100** | yes | pass | 3/3 | 0 | 0 | 0 | 0 | 0.9 min | completed | ok |
| inline-notice | codex | **54** | no | pass | 0/3 | 1.5 | 0 | 0 | 21 | 0.4 min | completed | ok |

## Isolation audit

Each run's transcript, stderr and final message are scanned for the source checkout's folders and names, for extra paths given with `--audit-path`, and for other runs' workspaces, temp folders and logs. A hit means the agent read, ran or was shown something outside its workspace that could tell it about envUI's source or another run.

No run escaped.

## Failure modes

17 of 26 runs scored below 90; 5 of those read envUI's Markdown docs or skills, against 9 of the 9 others.

### Capabilities not built with envUI

| Task | Capability | envUI provides | claude | codex |
|---|---|---|---|---|
| sidebar | collapsible sidebar and its toggle | `AppShell` | ok | missed 1/1 |
| sidebar | sidebar navigation links | `NavigationItem` | ok | missed 1/1 |
| settings-form | workspace name field | `Input` | ok | missed 1/1 |
| settings-form | multiline description | `Textarea` | ok | missed 1/1 |
| settings-form | time zone choice | `Select`, `Combobox` | ok | missed 1/1 |
| settings-form | on/off notifications | `Switch`, `Checkbox` | ok | missed 1/1 |
| settings-form | save and cancel buttons | `Button` | ok | missed 1/1 |
| projects-table | data table | `Table` | ok | missed 1/1 |
| projects-table | sortable column headers | `TableHeaderCell.onSort` | ok | missed 1/1 |
| projects-table | search box | `SearchField`, `Input` | ok | missed 1/1 |
| projects-table | empty state | `EmptyState` | ok | missed 1/1 |
| projects-table | clear search button | `Button` | missed 1/1 | missed 1/1 |
| confirm-delete | delete control | `Button`, `IconButton`, `ConfirmButton`, `MenuItem` | ok | missed 1/1 |
| confirm-delete | confirmation step | `Dialog`, `ConfirmButton` | ok | missed 1/1 |
| save-toast | managed toast | `useToast`, `ToastProvider`, `Toast`, `ToastRegion` | ok | missed 1/1 |
| save-toast | name field | `Input` | missed 1/1 | missed 1/1 |
| save-toast | save button | `Button` | missed 1/1 | missed 1/1 |
| page-header | breadcrumbs | `Breadcrumbs` | ok | missed 1/1 |
| page-header | project count | `Badge`, `Counter` | ok | missed 1/1 |
| page-header | header actions | `Button` | missed 1/1 | missed 1/1 |
| page-header | grouped actions | `ActionGroup`, `ButtonGroup` | ok | missed 1/1 |
| command-palette | search palette | `CommandPalette` | ok | missed 1/1 |
| command-palette | header search button | `Button`, `IconButton` | ok | missed 1/1 |
| command-palette | shortcut key caps | `Kbd` | ok | missed 1/1 |
| tabs-counts | count in each tab | `Badge`, `Counter` | ok | missed 1/1 |
| account-menu | avatar trigger | `AvatarButton`, `Avatar` | ok | missed 1/1 |
| account-menu | menu | `Menu` | ok | missed 1/1 |
| account-menu | menu items | `MenuItem` | ok | missed 1/1 |
| file-upload | drop area and file picker | `FileDropzone` | ok | missed 1/1 |
| file-upload | remove file control | `IconButton`, `Button` | missed 1/1 | missed 1/1 |
| file-upload | pending upload state | `Button.pending`, `Spinner`, `Progress`, `LoadingBar` | ok | missed 1/1 |
| date-form | date picker | `DateTimeField`, `Calendar` | ok | missed 1/1 |
| date-form | project choice | `Select`, `Combobox` | ok | missed 1/1 |
| date-form | title field | `Input` | ok | missed 1/1 |
| date-form | description | `Textarea` | ok | missed 1/1 |
| date-form | create button | `Button` | missed 1/1 | missed 1/1 |
| loading-skeletons | loading placeholders | `Skeleton`, `LoadingState` | ok | missed 1/1 |
| loading-skeletons | error message | `Notice`, `EmptyState` | ok | missed 1/1 |
| loading-skeletons | retry button | `Button` | missed 1/1 | missed 1/1 |
| inline-notice | inline notice | `Notice` | ok | missed 1/1 |
| inline-notice | dismissible | `Notice.onDismiss` | ok | missed 1/1 |
| inline-notice | upgrade link | `Button`, `Link` | ok | missed 1/1 |

### Raw HTML where envUI has a component (runs containing it)

| Element | claude (baseline) | codex (baseline) |
|---|--:|--:|
| `<button>` | 0/13 | 5/13 |
| `<input type="text">` | 1/13 | 3/13 |
| `role="alert"` | 0/13 | 4/13 |
| `<a href>` | 0/13 | 3/13 |
| `role="status"` | 0/13 | 3/13 |
| `role="status" on <Text>` | 2/13 | 0/13 |
| `<nav>` | 0/13 | 2/13 |
| `<textarea>` | 0/13 | 2/13 |
| `<select>` | 0/13 | 2/13 |
| `<input type="search">` | 0/13 | 2/13 |
| `role="alert" on <Text>` | 1/13 | 0/13 |
| `<svg>` | 0/13 | 1/13 |
| `<aside>` | 0/13 | 1/13 |
| `<input type="checkbox">` | 0/13 | 1/13 |
| `<table>` | 0/13 | 1/13 |
| `<kbd>` | 0/13 | 1/13 |
| `role="listbox"` | 0/13 | 1/13 |
| `role="option"` | 0/13 | 1/13 |
| `role="menu"` | 0/13 | 1/13 |
| `<input type="file">` | 0/13 | 1/13 |
| `role="button"` | 0/13 | 1/13 |
| `<input type="date">` | 0/13 | 1/13 |

### Local components that duplicate envUI

| Task | Agent | Component | Instead of |
|---|---|---|---|
| sidebar | codex | `NavigationIcon` (src/App.tsx:13) | `Icon`, `DecorativeIcon` |
| command-palette | codex | `QuickSearch` (src/components/QuickSearch.tsx:12) | `CommandPalette` |

### Type errors on envUI (invented exports, props or members)

None.

### Type-checker suppressions

None.

### Raw style values, added dependencies and UI packages

| Task | Agent | Raw colors | Raw px | `.env-*` overrides | Added dependencies | Third-party UI packages | Examples |
|---|---|--:|--:|--:|---|---|---|
| sidebar | codex | 13 | 31 | 0 |  |  | src/app.css: background: #f8f9fb; src/app.css: flex: 0 0 240px; src/app.css: padding: 16px 12px |
| settings-form | claude | 0 | 1 | 0 |  |  | src/app.css: background: #f8f9fb; src/app.css: gap: 12px; src/app.css: height: 56px |
| settings-form | codex | 6 | 17 | 0 |  |  | src/app.css: background: #f8f9fb; src/app.css: gap: 12px; src/app.css: height: 56px |
| projects-table | claude | 0 | 1 | 0 |  |  | src/app.css: background: #f8f9fb; src/app.css: gap: 12px; src/app.css: height: 56px |
| projects-table | codex | 5 | 7 | 0 |  |  | src/app.css: background: #f8f9fb; src/app.css: gap: 12px; src/app.css: height: 56px |
| confirm-delete | claude | 0 | 1 | 0 |  |  | src/app.css: background: #f8f9fb; src/app.css: gap: 12px; src/app.css: height: 56px |
| save-toast | claude | 0 | 2 | 0 |  |  | src/app.css: background: #f8f9fb; src/app.css: gap: 12px; src/app.css: height: 56px |
| save-toast | codex | 6 | 16 | 0 |  |  | src/app.css: background: #f8f9fb; src/app.css: gap: 12px; src/app.css: height: 56px |
| page-header | codex | 5 | 12 | 0 |  |  | src/app.css: background: #f8f9fb; src/app.css: gap: 12px; src/app.css: height: 56px |
| command-palette | claude | 1 | 1 | 0 |  |  | src/app.css: background: #f8f9fb; src/app.css: gap: 12px; src/app.css: height: 56px |
| command-palette | codex | 21 | 42 | 0 |  |  | src/app.css: background: #f8f9fb; src/app.css: gap: 12px; src/app.css: height: 56px |
| account-menu | codex | 12 | 20 | 0 |  |  | src/app.css: background: #f8f9fb; src/app.css: gap: 12px; src/app.css: height: 56px |
| file-upload | claude | 6 | 7 | 1 |  |  | src/app.css: background: #f8f9fb; src/app.css: gap: 12px; src/app.css: height: 56px |
| file-upload | codex | 15 | 21 | 0 |  |  | src/app.css: background: #f8f9fb; src/app.css: gap: 12px; src/app.css: height: 56px |
| date-form | codex | 3 | 5 | 0 |  |  | src/components/components.css: gap: 6px; src/components/components.css: height: 32px; src/components/components.css: padding: 0 12px |
| loading-skeletons | claude | 0 | 5 | 0 |  |  | src/app.css: background: #f8f9fb; src/app.css: gap: 12px; src/app.css: height: 56px |
| loading-skeletons | codex | 4 | 11 | 0 |  |  | src/app.css: background: #f8f9fb; src/app.css: gap: 12px; src/app.css: height: 56px |
| inline-notice | codex | 7 | 14 | 0 |  |  | src/app.css: background: #f8f9fb; src/app.css: gap: 12px; src/app.css: height: 56px |

## Scoring

Per run, over the files the agent created or changed (counts in a changed file are relative to its base version): typecheck passes 20; task capabilities built with envUI 35 × covered share; raw HTML 20 − 4 per weighted element; local duplicates of envUI 10 − 5 each; type errors on envUI 10 − 5 each; raw colors, px and `.env-*` overrides 5 − 0.5 each; −10 per third-party UI package added or imported; −5 per `@ts-nocheck`, `@ts-ignore` or `@ts-expect-error` added, with the type check run as if they were not there. Parts never go below zero; a run that changed no source scores 0. See bench/README.md.

