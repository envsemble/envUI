# envUI agent benchmark: 2026-10-16-baseline-v2

- Date: 2026-10-16; condition: `baseline`; fixture: `basic`
- envUI 0.7.0 from a packed tarball (sha256 b101269e531fb91ca6e5753576ceb7c61076ded368500988ad88dd4bd0475fcd, built from commit 226168e87034)
- Claude Code (`claude`): 2.1.300 (Claude Code), model `claude-opus-5-5`, effort `high`
- Codex (`codex`): codex-cli 0.162.1, model `gpt-6-luna`, effort `high`
- 13 tasks, one run per task and agent, 12 min timeout, 4 runs in parallel
- Isolation audit: no run escaped (26 audited)
- Transcripts and workspaces: `~\AppData\Local\Temp\agent-workspaces\2026-10-16-baseline-v2` (not in git)

## Aggregates

| Condition | Agent | Runs | Mean score | Median | Escaped | Read envUI docs | Typecheck pass | Capabilities via envUI | Runs with raw HTML | Local duplicates | envUI type errors | Raw style values | UI packages | Suppressions | Timeouts / errors | Time | Cost | Tokens in / cached / out |
|---|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| baseline | claude | 13 | **100** | 100 | 0 | 13/13 | 100% | 43/43 | 0/13 | 0 | 0 | 0 | 0 | 0 | 0 / 0 | 19.2 min | $7.55 | 8,788k / 8,285k / 94k |
| baseline | codex | 13 | **80.6** | 89 | 0 | 9/13 | 100% | 29/43 | 8/13 | 1 | 0 | 18 | 0 | 0 | 0 / 0 | 9.4 min | n/a | 3,877k / 3,450k / 39k |

## Runs

| Task | Agent | Score | Read envUI docs | Typecheck | Capabilities via envUI | Raw HTML (weighted) | Duplicates | envUI errors | Raw styles | Time | Status | Isolation |
|---|---|--:|--:|---|---|--:|--:|--:|--:|--:|---|---|
| sidebar | claude | **100** | yes | pass | 2/2 | 0 | 0 | 0 | 0 | 1.6 min | completed | ok |
| sidebar | codex | **37** | no | pass | 0/2 | 4.5 | 1 | 0 | 13 | 1 min | completed | ok |
| settings-form | claude | **100** | yes | pass | 5/5 | 0 | 0 | 0 | 0 | 1.3 min | completed | ok |
| settings-form | codex | **100** | yes | pass | 5/5 | 0 | 0 | 0 | 0 | 0.7 min | completed | ok |
| projects-table | claude | **100** | yes | pass | 5/5 | 0 | 0 | 0 | 0 | 2.1 min | completed | ok |
| projects-table | codex | **89** | yes | pass | 4/5 | 1 | 0 | 0 | 0 | 1 min | completed | ok |
| confirm-delete | claude | **100** | yes | pass | 2/2 | 0 | 0 | 0 | 0 | 0.9 min | completed | ok |
| confirm-delete | codex | **96** | yes | pass | 2/2 | 1 | 0 | 0 | 0 | 0.6 min | completed | ok |
| save-toast | claude | **100** | yes | pass | 3/3 | 0 | 0 | 0 | 0 | 1.8 min | completed | ok |
| save-toast | codex | **100** | yes | pass | 3/3 | 0 | 0 | 0 | 0 | 0.7 min | completed | ok |
| page-header | claude | **100** | yes | pass | 4/4 | 0 | 0 | 0 | 0 | 2 min | completed | ok |
| page-header | codex | **91.3** | no | pass | 3/4 | 0 | 0 | 0 | 0 | 0.5 min | completed | ok |
| command-palette | claude | **100** | yes | pass | 3/3 | 0 | 0 | 0 | 0 | 3 min | completed | ok |
| command-palette | codex | **86.3** | yes | pass | 2/3 | 0.5 | 0 | 0 | 0 | 1 min | completed | ok |
| tabs-counts | claude | **100** | yes | pass | 2/2 | 0 | 0 | 0 | 0 | 0.7 min | completed | ok |
| tabs-counts | codex | **82.5** | yes | pass | 1/2 | 0 | 0 | 0 | 0 | 0.5 min | completed | ok |
| account-menu | claude | **100** | yes | pass | 3/3 | 0 | 0 | 0 | 0 | 1.6 min | completed | ok |
| account-menu | codex | **100** | yes | pass | 3/3 | 0 | 0 | 0 | 0 | 0.6 min | completed | ok |
| file-upload | claude | **100** | yes | pass | 3/3 | 0 | 0 | 0 | 0 | 1.2 min | completed | ok |
| file-upload | codex | **43.5** | no | pass | 0/3 | 6 | 0 | 0 | 3 | 0.9 min | completed | ok |
| date-form | claude | **100** | yes | pass | 5/5 | 0 | 0 | 0 | 0 | 1 min | completed | ok |
| date-form | codex | **92** | yes | pass | 5/5 | 2 | 0 | 0 | 0 | 0.9 min | completed | ok |
| loading-skeletons | claude | **100** | yes | pass | 3/3 | 0 | 0 | 0 | 0 | 0.6 min | completed | ok |
| loading-skeletons | codex | **72.7** | yes | pass | 1/3 | 1 | 0 | 0 | 0 | 0.5 min | completed | ok |
| inline-notice | claude | **100** | yes | pass | 3/3 | 0 | 0 | 0 | 0 | 1.3 min | completed | ok |
| inline-notice | codex | **58** | no | pass | 0/3 | 1.5 | 0 | 0 | 2 | 0.4 min | completed | ok |

## Isolation audit

Each run's transcript, stderr and final message are scanned for the source checkout's folders and names, for extra paths given with `--audit-path`, and for other runs' workspaces, temp folders and logs. A hit means the agent read, ran or was shown something outside its workspace that could tell it about envUI's source or another run.

No run escaped.

## Failure modes

7 of 26 runs scored below 90; 4 of those read envUI's Markdown docs or skills, against 18 of the 19 others.

### Capabilities not built with envUI

| Task | Capability | envUI provides | claude | codex |
|---|---|---|---|---|
| sidebar | collapsible sidebar and its toggle | `AppShell` | ok | missed 1/1 |
| sidebar | sidebar navigation links | `NavigationItem` | ok | missed 1/1 |
| projects-table | empty state | `EmptyState` | ok | missed 1/1 |
| page-header | grouped actions | `ActionGroup`, `ButtonGroup` | ok | missed 1/1 |
| command-palette | shortcut key caps | `Kbd` | ok | missed 1/1 |
| tabs-counts | count in each tab | `Badge`, `Counter` | ok | missed 1/1 |
| file-upload | drop area and file picker | `FileDropzone` | ok | missed 1/1 |
| file-upload | remove file control | `IconButton`, `Button` | ok | missed 1/1 |
| file-upload | pending upload state | `Button.pending`, `Spinner`, `Progress`, `LoadingBar` | ok | missed 1/1 |
| loading-skeletons | loading placeholders | `Skeleton`, `LoadingState` | ok | missed 1/1 |
| loading-skeletons | error message | `Notice`, `EmptyState` | ok | missed 1/1 |
| inline-notice | inline notice | `Notice` | ok | missed 1/1 |
| inline-notice | dismissible | `Notice.onDismiss` | ok | missed 1/1 |
| inline-notice | upgrade link | `Button`, `Link` | ok | missed 1/1 |

### Raw HTML where envUI has a component (runs containing it)

| Element | claude (baseline) | codex (baseline) |
|---|--:|--:|
| `<button>` | 0/13 | 3/13 |
| `role="alert" on <Text>` | 0/13 | 3/13 |
| `<a href>` | 0/13 | 2/13 |
| `role="status" on <Text>` | 0/13 | 2/13 |
| `<svg>` | 0/13 | 1/13 |
| `<aside>` | 0/13 | 1/13 |
| `<nav>` | 0/13 | 1/13 |
| `role="status"` | 0/13 | 1/13 |
| `<kbd>` | 0/13 | 1/13 |
| `<input type="file">` | 0/13 | 1/13 |
| `role="alert" on <Stack>` | 0/13 | 1/13 |

### Local components that duplicate envUI

| Task | Agent | Component | Instead of |
|---|---|---|---|
| sidebar | codex | `NavigationIcon` (src/App.tsx:13) | `Icon`, `DecorativeIcon` |

### Type errors on envUI (invented exports, props or members)

None.

### Type-checker suppressions

None.

### Raw style values, added dependencies and UI packages

| Task | Agent | Raw colors | Raw px | `.env-*` overrides | Added dependencies | Third-party UI packages | Examples |
|---|---|--:|--:|--:|---|---|---|
| sidebar | codex | 13 | 0 | 0 |  |  | src/app.css: background: #f7f8fa; src/app.css: background: #fff; src/app.css: border-right: 1px solid #e7e9ee |
| file-upload | codex | 2 | 1 | 0 |  |  | src/app.css: outline-offset: 3px; src/app.css: color: white; src/app.css: background: #737986 |
| inline-notice | codex | 2 | 0 | 0 |  |  | src/app.css: border-color: hsl(38 75% 55%); src/app.css: background: hsl(42 100% 96%) |

## Scoring

Per run, over the files the agent created or changed (counts in a changed file are relative to its base version): typecheck passes 20; task capabilities built with envUI 35 × covered share; raw HTML 20 − 4 per weighted element; local duplicates of envUI 10 − 5 each; type errors on envUI 10 − 5 each; raw colors, px and `.env-*` overrides 5 − 0.5 each; −10 per third-party UI package added or imported; −5 per `@ts-nocheck`, `@ts-ignore` or `@ts-expect-error` added, with the type check run as if they were not there. Parts never go below zero; a run that changed no source scores 0. See bench/README.md.

