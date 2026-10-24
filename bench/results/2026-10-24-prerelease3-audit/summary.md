# envUI agent benchmark: 2026-10-24-prerelease3-audit

- Date: 2026-10-24; condition: `baseline`; fixture: `basic`
- envUI 1.0.0-prerelease.0 from a packed tarball (sha256 41363a1f677b73d714b113d164c587c671dd9b8cea54d12ca2a740614e2e37dd, built from commit 5bec303778d1)
- Claude Code, Haiku 5.5 (`haiku`): 2.1.310 (Claude Code), model `claude-haiku-5-5`, effort `high`
- Claude Code, Opus 5.5 (`opus`): 2.1.310 (Claude Code), model `claude-opus-5-5`, effort `low`
- 19 tasks, one run per task and agent, 12 min timeout, 4 runs in parallel
- Isolation audit: **3 of 38 runs escaped**; their results are not trustworthy
- Transcripts and workspaces: `~\AppData\Local\Temp\agent-workspaces\2026-10-24-prerelease3-audit` (not in git)

## Aggregates

| Condition | Agent | Runs | Mean score | Median | Escaped | Read envUI docs | Typecheck pass | Capabilities covered | Runs with raw HTML | Local duplicates | envUI type errors | Raw style values | Hand-rolled layout | Layout problems | Not rendered | UI packages | Suppressions | Timeouts / errors | Time | Cost | Tokens in / cached / out |
|---|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| baseline | haiku | 19 | **99.5** | 100 | 3 | 16/19 | 100% | 68/68 | 2/19 | 0 | 0 | 0 | 0 | 1 | 0/19 | 0 | 0 | 0 / 0 | 34.5 min | $0.62 | 19,465k / 18,445k / 271k |
| baseline | opus | 19 | **99.3** | 100 | 0 | 17/19 | 100% | 68/68 | 3/19 | 0 | 0 | 0 | 0 | 1 | 0/19 | 0 | 0 | 0 / 0 | 14.5 min | $5.63 | 4,968k / 4,518k / 56k |

## Runs

| Task | Agent | Score | Read envUI docs | Typecheck | Capabilities covered | Raw HTML (weighted) | Duplicates | envUI errors | Raw styles | Layout problems | Time | Status | Isolation |
|---|---|--:|--:|---|---|--:|--:|--:|--:|--:|--:|---|---|
| sidebar | haiku | **100** | yes | pass | 5/5 | 0 | 0 | 0 | 0 | 0 | 4 min | completed | ok |
| sidebar | opus | **100** | yes | pass | 5/5 | 0 | 0 | 0 | 0 | 0 | 0.6 min | completed | ok |
| settings-form | haiku | **96** | yes | pass | 5/5 | 1 | 0 | 0 | 0 | 0 | 1.8 min | completed | ok |
| settings-form | opus | **96** | yes | pass | 5/5 | 1 | 0 | 0 | 0 | 0 | 1.1 min | completed | ok |
| projects-table | haiku | **98** | yes | pass | 5/5 | 0 | 0 | 0 | 0 | 1 | 2.7 min | completed | ok |
| projects-table | opus | **98** | yes | pass | 5/5 | 0 | 0 | 0 | 0 | 1 | 1.1 min | completed | ok |
| confirm-delete | haiku | **100** | yes | pass | 2/2 | 0 | 0 | 0 | 0 | 0 | 1.2 min | completed | ok |
| confirm-delete | opus | **100** | yes | pass | 2/2 | 0 | 0 | 0 | 0 | 0 | 0.7 min | completed | ok |
| save-toast | haiku | **100** | no | pass | 3/3 | 0 | 0 | 0 | 0 | 0 | 1.4 min | completed | ok |
| save-toast | opus | **100** | yes | pass | 3/3 | 0 | 0 | 0 | 0 | 0 | 0.9 min | completed | ok |
| page-header | haiku | **100** | no | pass | 5/5 | 0 | 0 | 0 | 0 | 0 | 0.9 min | completed | ok |
| page-header | opus | **100** | yes | pass | 5/5 | 0 | 0 | 0 | 0 | 0 | 0.4 min | completed | ok |
| command-palette | haiku | **100** | yes | pass | 3/3 | 0 | 0 | 0 | 0 | 0 | 2.1 min | completed | ok |
| command-palette | opus | **100** | yes | pass | 3/3 | 0 | 0 | 0 | 0 | 0 | 0.7 min | completed | ok |
| tabs-counts | haiku | **100** | yes | pass | 2/2 | 0 | 0 | 0 | 0 | 0 | 0.9 min | completed | ok |
| tabs-counts | opus | **100** | no | pass | 2/2 | 0 | 0 | 0 | 0 | 0 | 0.7 min | completed | ok |
| account-menu | haiku | **100** | yes | pass | 3/3 | 0 | 0 | 0 | 0 | 0 | 0.7 min | completed | ok |
| account-menu | opus | **100** | yes | pass | 3/3 | 0 | 0 | 0 | 0 | 0 | 0.6 min | completed | ok |
| file-upload | haiku | **100** | yes | pass | 3/3 | 0 | 0 | 0 | 0 | 0 | 2.2 min | completed | ok |
| file-upload | opus | **96** | yes | pass | 3/3 | 1 | 0 | 0 | 0 | 0 | 0.7 min | completed | ok |
| date-form | haiku | **96** | yes | pass | 5/5 | 1 | 0 | 0 | 0 | 0 | 1.2 min | completed | ok |
| date-form | opus | **96** | yes | pass | 5/5 | 1 | 0 | 0 | 0 | 0 | 1 min | completed | ok |
| loading-skeletons | haiku | **100** | yes | pass | 3/3 | 0 | 0 | 0 | 0 | 0 | 2.4 min | completed | ok |
| loading-skeletons | opus | **100** | yes | pass | 3/3 | 0 | 0 | 0 | 0 | 0 | 1.3 min | completed | ok |
| inline-notice | haiku | **100** | no | pass | 3/3 | 0 | 0 | 0 | 0 | 0 | 1.3 min | completed | ok |
| inline-notice | opus | **100** | yes | pass | 3/3 | 0 | 0 | 0 | 0 | 0 | 0.5 min | completed | ok |
| app-frame | haiku | **100** | yes | pass | 4/4 | 0 | 0 | 0 | 0 | 0 | 2.5 min | completed | **escaped** |
| app-frame | opus | **100** | yes | pass | 4/4 | 0 | 0 | 0 | 0 | 0 | 0.6 min | completed | ok |
| dashboard-grid | haiku | **100** | yes | pass | 4/4 | 0 | 0 | 0 | 0 | 0 | 1.9 min | completed | ok |
| dashboard-grid | opus | **100** | yes | pass | 4/4 | 0 | 0 | 0 | 0 | 0 | 0.9 min | completed | ok |
| list-detail | haiku | **100** | yes | pass | 4/4 | 0 | 0 | 0 | 0 | 0 | 2.2 min | completed | **escaped** |
| list-detail | opus | **100** | yes | pass | 4/4 | 0 | 0 | 0 | 0 | 0 | 0.7 min | completed | ok |
| settings-column | haiku | **100** | yes | pass | 3/3 | 0 | 0 | 0 | 0 | 0 | 2.3 min | completed | ok |
| settings-column | opus | **100** | yes | pass | 3/3 | 0 | 0 | 0 | 0 | 0 | 0.7 min | completed | ok |
| card-skeletons | haiku | **100** | yes | pass | 4/4 | 0 | 0 | 0 | 0 | 0 | 2.2 min | completed | **escaped** |
| card-skeletons | opus | **100** | yes | pass | 4/4 | 0 | 0 | 0 | 0 | 0 | 0.9 min | completed | ok |
| activity-loading | haiku | **100** | yes | pass | 2/2 | 0 | 0 | 0 | 0 | 0 | 0.7 min | completed | ok |
| activity-loading | opus | **100** | no | pass | 2/2 | 0 | 0 | 0 | 0 | 0 | 0.4 min | completed | ok |

## Isolation audit

Each run's transcript, stderr and final message are scanned for the source checkout's folders and names, for extra paths given with `--audit-path`, and for other runs' workspaces, temp folders and logs. A hit means the agent read, ran or was shown something outside its workspace that could tell it about envUI's source or another run.

| Task | Agent | Marker | File | Excerpt |
|---|---|---|---|---|
| app-frame | haiku | another run | transcript.jsonl | elease3-audit/haiku-app-frame\" && (npm run dev -- --port 5173 --strictPort > \"~/AppData/Local/Temp/agent-workspaces/2026-10-24-prerelease3-audit/dev.log\" 2>&1 &) ; sleep 6; cat \"C:/Us |
| list-detail | haiku | C:\Dev\envsemble-workspace | transcript.jsonl | ":"import { createRequire } from 'node:module';\nconst require = createRequire('C:/Dev/envsemble-workspace/envUI-0020-s1-avatar/package.json');\nconst { chromium } = require('@playwright/test');\ncons |
| card-skeletons | haiku | another run | transcript.jsonl | _use","id":"toolu_01GAT6skbNcJna4twc9NoNtJ","name":"Read","input":{"file_path":"~\\AppData\\Local\\Temp\\agent-workspaces\\2026-10-24-prerelease3-audit\\shots\\loading.png"},"caller":{" |

## Failure modes

### Capabilities not covered

A capability named by envUI exports is covered when the result uses one of them; one described by what renders is covered when all its checks pass in the browser step.

| Task | Capability | Covered by | haiku | opus |
|---|---|---|---|---|

### Raw HTML where envUI has a component (runs containing it)

| Element | haiku (baseline) | opus (baseline) |
|---|--:|--:|
| `role="status" on <Text>` | 2/19 | 3/19 |

### Local components that duplicate envUI

None.

### Type errors on envUI (invented exports, props or members)

None.

### Type-checker suppressions

None.

### Rendered layout

Problems found by dev mode's `layout.at()` and the page's own sideways overflow at 22, 40, 60 and 80rem; one problem seen at several widths counts once.

| Task | Agent | Rule | Node | Widths | Message |
|---|---|---|---|---|---|
| projects-table | haiku | text-squeezed | column | 22rem, 22rem, 22rem, 22rem, 22rem, 22rem, 22rem, 22rem | column: the text of td.env-table-cell is squeezed to 3.69rem, about 7 characters a line, under the 8 a line can take. Give it room, or let it wrap below its neighbours. |
| projects-table | opus | text-squeezed | column > column | 22rem, 22rem, 22rem, 22rem, 22rem, 22rem, 22rem, 22rem | column: the text of td.env-table-cell is squeezed to 3.69rem, about 7 characters a line, under the 8 a line can take. Give it room, or let it wrap below its neighbours. |

### Raw style values, hand-rolled layout, added dependencies and UI packages

None.

## Scoring

Per run, over the files the agent created or changed (counts in a changed file are relative to its base version): typecheck passes 15; task capabilities covered 30 × covered share, by envUI exports or by what renders; raw HTML 15 − 4 per weighted element; local duplicates of envUI 10 − 5 each; type errors on envUI 10 − 5 each; raw colors and px and private component tokens set 5 − 0.5 each; hand-rolled flex or grid layout in inline styles 5 − 2 each; rendered layout 10 − 2 per distinct problem at 22, 40, 60 and 80rem, from dev mode, the page's overflow and hand-rolled containers, 0 when the app does not render; −10 per third-party UI package added or imported; −5 per `@ts-nocheck`, `@ts-ignore` or `@ts-expect-error` added, with the type check run as if they were not there. Parts never go below zero; a run that changed no source scores 0; parts a run could not check, without the browser step or when it failed on its own account, are left out and the rest scaled to 100. Part classes (`env-*`) are public and cost nothing. See bench/README.md.

