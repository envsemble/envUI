# envUI agent benchmark: 2026-10-22-prerelease1

- Date: 2026-10-22; condition: `baseline`; fixture: `basic`
- envUI 1.0.0-prerelease.0 from a packed tarball (sha256 1e4fb20440d74a6dacd03f0745f9d3d7cea3bfb238aab660e7394cd849e855f4, built from commit 35cb4a2a391a)
- Claude Code, Haiku 5.5 (`haiku`): 2.1.303 (Claude Code), model `claude-haiku-5-5`, effort `high`
- Claude Code, Opus 5.5 (`opus`): 2.1.303 (Claude Code), model `claude-opus-5-5`, effort `low`
- 19 tasks, one run per task and agent, 12 min timeout, 4 runs in parallel
- Isolation audit: no run escaped (38 audited)
- Transcripts and workspaces: `~\AppData\Local\Temp\agent-workspaces\2026-10-22-prerelease1` (not in git)

## Aggregates

| Condition | Agent | Runs | Mean score | Median | Escaped | Read envUI docs | Typecheck pass | Capabilities covered | Runs with raw HTML | Local duplicates | envUI type errors | Raw style values | Hand-rolled layout | Layout problems | Not rendered | UI packages | Suppressions | Timeouts / errors | Time | Cost | Tokens in / cached / out |
|---|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| baseline | haiku | 19 | **96.6** | 100 | 0 | 17/19 | 100% | 63/68 | 3/19 | 1 | 0 | 1 | 0 | 0 | 0/19 | 0 | 0 | 0 / 0 | 32.5 min | $0.67 | 19,454k / 18,491k / 273k |
| baseline | opus | 19 | **97.2** | 100 | 0 | 16/19 | 100% | 65/68 | 4/19 | 0 | 0 | 0 | 0 | 1 | 0/19 | 0 | 0 | 0 / 0 | 12.4 min | $5.35 | 4,575k / 4,139k / 52k |

## Runs

| Task | Agent | Score | Read envUI docs | Typecheck | Capabilities covered | Raw HTML (weighted) | Duplicates | envUI errors | Raw styles | Layout problems | Time | Status | Isolation |
|---|---|--:|--:|---|---|--:|--:|--:|--:|--:|--:|---|---|
| sidebar | haiku | **78.5** | yes | pass | 3/5 | 1 | 1 | 0 | 1 | 0 | 3.2 min | completed | ok |
| sidebar | opus | **100** | yes | pass | 5/5 | 0 | 0 | 0 | 0 | 0 | 0.8 min | completed | ok |
| settings-form | haiku | **96** | yes | pass | 5/5 | 1 | 0 | 0 | 0 | 0 | 1.2 min | completed | ok |
| settings-form | opus | **96** | yes | pass | 5/5 | 1 | 0 | 0 | 0 | 0 | 0.8 min | completed | ok |
| projects-table | haiku | **100** | yes | pass | 5/5 | 0 | 0 | 0 | 0 | 0 | 2.9 min | completed | ok |
| projects-table | opus | **94** | yes | pass | 5/5 | 1 | 0 | 0 | 0 | 1 | 0.8 min | completed | ok |
| confirm-delete | haiku | **85** | yes | pass | 1/2 | 0 | 0 | 0 | 0 | 0 | 1 min | completed | ok |
| confirm-delete | opus | **85** | yes | pass | 1/2 | 0 | 0 | 0 | 0 | 0 | 0.7 min | completed | ok |
| save-toast | haiku | **100** | yes | pass | 3/3 | 0 | 0 | 0 | 0 | 0 | 1.2 min | completed | ok |
| save-toast | opus | **100** | yes | pass | 3/3 | 0 | 0 | 0 | 0 | 0 | 0.5 min | completed | ok |
| page-header | haiku | **100** | yes | pass | 5/5 | 0 | 0 | 0 | 0 | 0 | 0.7 min | completed | ok |
| page-header | opus | **100** | no | pass | 5/5 | 0 | 0 | 0 | 0 | 0 | 0.9 min | completed | ok |
| command-palette | haiku | **80** | no | pass | 1/3 | 0 | 0 | 0 | 0 | 0 | 2.4 min | completed | ok |
| command-palette | opus | **80** | yes | pass | 1/3 | 0 | 0 | 0 | 0 | 0 | 0.5 min | completed | ok |
| tabs-counts | haiku | **100** | yes | pass | 2/2 | 0 | 0 | 0 | 0 | 0 | 1 min | completed | ok |
| tabs-counts | opus | **100** | no | pass | 2/2 | 0 | 0 | 0 | 0 | 0 | 0.9 min | completed | ok |
| account-menu | haiku | **100** | yes | pass | 3/3 | 0 | 0 | 0 | 0 | 0 | 1.2 min | completed | ok |
| account-menu | opus | **100** | no | pass | 3/3 | 0 | 0 | 0 | 0 | 0 | 0.5 min | completed | ok |
| file-upload | haiku | **96** | yes | pass | 3/3 | 1 | 0 | 0 | 0 | 0 | 1 min | completed | ok |
| file-upload | opus | **96** | yes | pass | 3/3 | 1 | 0 | 0 | 0 | 0 | 0.9 min | completed | ok |
| date-form | haiku | **100** | no | pass | 5/5 | 0 | 0 | 0 | 0 | 0 | 1.4 min | completed | ok |
| date-form | opus | **96** | yes | pass | 5/5 | 1 | 0 | 0 | 0 | 0 | 0.8 min | completed | ok |
| loading-skeletons | haiku | **100** | yes | pass | 3/3 | 0 | 0 | 0 | 0 | 0 | 1.3 min | completed | ok |
| loading-skeletons | opus | **100** | yes | pass | 3/3 | 0 | 0 | 0 | 0 | 0 | 0.6 min | completed | ok |
| inline-notice | haiku | **100** | yes | pass | 3/3 | 0 | 0 | 0 | 0 | 0 | 0.7 min | completed | ok |
| inline-notice | opus | **100** | yes | pass | 3/3 | 0 | 0 | 0 | 0 | 0 | 0.5 min | completed | ok |
| app-frame | haiku | **100** | yes | pass | 4/4 | 0 | 0 | 0 | 0 | 0 | 2.3 min | completed | ok |
| app-frame | opus | **100** | yes | pass | 4/4 | 0 | 0 | 0 | 0 | 0 | 0.7 min | completed | ok |
| dashboard-grid | haiku | **100** | yes | pass | 4/4 | 0 | 0 | 0 | 0 | 0 | 2.2 min | completed | ok |
| dashboard-grid | opus | **100** | yes | pass | 4/4 | 0 | 0 | 0 | 0 | 0 | 0.6 min | completed | ok |
| list-detail | haiku | **100** | yes | pass | 4/4 | 0 | 0 | 0 | 0 | 0 | 5 min | completed | ok |
| list-detail | opus | **100** | yes | pass | 4/4 | 0 | 0 | 0 | 0 | 0 | 0.6 min | completed | ok |
| settings-column | haiku | **100** | yes | pass | 3/3 | 0 | 0 | 0 | 0 | 0 | 1.4 min | completed | ok |
| settings-column | opus | **100** | yes | pass | 3/3 | 0 | 0 | 0 | 0 | 0 | 0.5 min | completed | ok |
| card-skeletons | haiku | **100** | yes | pass | 4/4 | 0 | 0 | 0 | 0 | 0 | 1.4 min | completed | ok |
| card-skeletons | opus | **100** | yes | pass | 4/4 | 0 | 0 | 0 | 0 | 0 | 0.7 min | completed | ok |
| activity-loading | haiku | **100** | yes | pass | 2/2 | 0 | 0 | 0 | 0 | 0 | 0.9 min | completed | ok |
| activity-loading | opus | **100** | yes | pass | 2/2 | 0 | 0 | 0 | 0 | 0 | 0.3 min | completed | ok |

## Isolation audit

Each run's transcript, stderr and final message are scanned for the source checkout's folders and names, for extra paths given with `--audit-path`, and for other runs' workspaces, temp folders and logs. A hit means the agent read, ran or was shown something outside its workspace that could tell it about envUI's source or another run.

No run escaped.

## Failure modes

5 of 38 runs scored below 90; 4 of those read envUI's Markdown docs or skills, against 29 of the 33 others.

### Capabilities not covered

A capability named by envUI exports is covered when the result uses one of them; one described by what renders is covered when all its checks pass in the browser step.

| Task | Capability | Covered by | haiku | opus |
|---|---|---|---|---|
| sidebar | the navigation as a list with full labels | `Drawer` | missed 1/1 | ok |
| sidebar | the navigation as a narrow strip of icons | `Rail` | missed 1/1 | ok |
| confirm-delete | confirmation step | `Dialog`, `ConfirmButton` | missed 1/1 | missed 1/1 |
| command-palette | header search button | `Button`, `IconButton` | missed 1/1 | missed 1/1 |
| command-palette | shortcut key caps | `Kbd` | missed 1/1 | missed 1/1 |

### Raw HTML where envUI has a component (runs containing it)

| Element | haiku (baseline) | opus (baseline) |
|---|--:|--:|
| `role="status" on <Text>` | 2/19 | 4/19 |
| `<nav>` | 1/19 | 0/19 |
| `<a href>` | 1/19 | 0/19 |

### Local components that duplicate envUI

| Task | Agent | Component | Instead of |
|---|---|---|---|
| sidebar | haiku | `SideNav` (src/components/SideNav.tsx:12) | `Drawer`, `Rail`, `Scaffold` |

### Type errors on envUI (invented exports, props or members)

None.

### Type-checker suppressions

None.

### Rendered layout

Problems found by dev mode's `layout.at()` and the page's own sideways overflow at 22, 40, 60 and 80rem; one problem seen at several widths counts once.

| Task | Agent | Rule | Node | Widths | Message |
|---|---|---|---|---|---|
| projects-table | opus | text-squeezed | column > column | 22rem, 22rem, 22rem, 22rem, 22rem, 22rem, 22rem, 22rem | column: the text of td.env-table-cell is squeezed to 3.69rem, about 7 characters a line, under the 8 a line can take. Give it room, or let it wrap below its neighbours. |

### Raw style values, hand-rolled layout, added dependencies and UI packages

| Task | Agent | Raw colors | Raw px | Private tokens set | Hand-rolled layout | Added dependencies | Third-party UI packages | Examples |
|---|---|--:|--:|--:|--:|---|---|---|
| sidebar | haiku | 0 | 0 | 1 | 0 |  |  | src/app.css: --env-icon-size: var(--env-control-icon-size) |

## Scoring

Per run, over the files the agent created or changed (counts in a changed file are relative to its base version): typecheck passes 15; task capabilities covered 30 × covered share, by envUI exports or by what renders; raw HTML 15 − 4 per weighted element; local duplicates of envUI 10 − 5 each; type errors on envUI 10 − 5 each; raw colors and px and private component tokens set 5 − 0.5 each; hand-rolled flex or grid layout in inline styles 5 − 2 each; rendered layout 10 − 2 per distinct problem at 22, 40, 60 and 80rem, from dev mode, the page's overflow and hand-rolled containers, 0 when the app does not render; −10 per third-party UI package added or imported; −5 per `@ts-nocheck`, `@ts-ignore` or `@ts-expect-error` added, with the type check run as if they were not there. Parts never go below zero; a run that changed no source scores 0; parts a run could not check, without the browser step or when it failed on its own account, are left out and the rest scaled to 100. Part classes (`env-*`) are public and cost nothing. See bench/README.md.

