# envUI agent benchmark: 2026-10-16-baseline

- Date: 2026-10-16; condition: `baseline`
- envUI 0.7.0 from a packed tarball (sha256 b101269e531f)
- Claude Code (`claude`): 2.1.300 (Claude Code), model `claude-opus-5-5`, effort `high`
- Codex (`codex`): codex-cli 0.162.1, model `gpt-6-luna`, effort `high`
- 13 tasks, one run per task and agent, 12 min timeout, 4 runs in parallel
- Transcripts and workspaces: `C:\Users\Jacob\AppData\Local\Temp\agent-workspaces\2026-10-16-baseline` (not in git)

## Aggregates

| Condition | Agent | Runs | Mean score | Median | Read envUI docs | Typecheck pass | Capabilities via envUI | Runs with raw HTML | Local duplicates | envUI type errors | Raw style values | UI deps added | Timeouts / errors | Time | Cost | Tokens in / cached / out |
|---|---|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|--:|
| baseline | claude | 13 | **100** | 100 | 13/13 | 100% | 43/43 | 0/13 | 0 | 0 | 0 | 0 | 0 / 0 | 21 min | $7.16 | 8,384k / 7,902k / 86k |
| baseline | codex | 13 | **77.6** | 84.3 | 6/13 | 100% | 26/43 | 8/13 | 1 | 0 | 44 | 0 | 0 / 0 | 10.5 min | n/a | 3,292k / 2,945k / 38k |

## Runs

| Task | Agent | Score | Read envUI docs | Typecheck | Capabilities via envUI | Raw HTML (weighted) | Duplicates | envUI errors | Raw styles | Time | Status |
|---|---|--:|--:|---|---|--:|--:|--:|--:|--:|---|
| sidebar | claude | **100** | yes | pass | 2/2 | 0 | 0 | 0 | 0 | 0.8 min | completed |
| sidebar | codex | **45.5** | no | pass | 0/2 | 3.5 | 1 | 0 | 1 | 1 min | completed |
| settings-form | claude | **100** | yes | pass | 5/5 | 0 | 0 | 0 | 0 | 2.2 min | completed |
| settings-form | codex | **92** | no | pass | 5/5 | 2 | 0 | 0 | 0 | 0.6 min | completed |
| projects-table | claude | **100** | yes | pass | 5/5 | 0 | 0 | 0 | 0 | 1.6 min | completed |
| projects-table | codex | **100** | yes | pass | 5/5 | 0 | 0 | 0 | 0 | 0.6 min | completed |
| confirm-delete | claude | **100** | yes | pass | 2/2 | 0 | 0 | 0 | 0 | 0.8 min | completed |
| confirm-delete | codex | **96** | no | pass | 2/2 | 1 | 0 | 0 | 0 | 0.6 min | completed |
| save-toast | claude | **100** | yes | pass | 3/3 | 0 | 0 | 0 | 0 | 1 min | completed |
| save-toast | codex | **100** | yes | pass | 3/3 | 0 | 0 | 0 | 0 | 0.7 min | completed |
| page-header | claude | **100** | yes | pass | 4/4 | 0 | 0 | 0 | 0 | 0.7 min | completed |
| page-header | codex | **91.3** | yes | pass | 3/4 | 0 | 0 | 0 | 0 | 0.5 min | completed |
| command-palette | claude | **100** | yes | pass | 3/3 | 0 | 0 | 0 | 0 | 3 min | completed |
| command-palette | codex | **40** | no | pass | 0/3 | 9.5 | 0 | 0 | 32 | 0.7 min | completed |
| tabs-counts | claude | **100** | yes | pass | 2/2 | 0 | 0 | 0 | 0 | 0.7 min | completed |
| tabs-counts | codex | **82.5** | yes | pass | 1/2 | 0 | 0 | 0 | 0 | 0.4 min | completed |
| account-menu | claude | **100** | yes | pass | 3/3 | 0 | 0 | 0 | 0 | 2.7 min | completed |
| account-menu | codex | **48** | no | pass | 0/3 | 3 | 0 | 0 | 10 | 0.5 min | completed |
| file-upload | claude | **100** | yes | pass | 3/3 | 0 | 0 | 0 | 0 | 1.7 min | completed |
| file-upload | codex | **84.3** | yes | pass | 2/3 | 1 | 0 | 0 | 0 | 2.6 min | completed |
| date-form | claude | **100** | yes | pass | 5/5 | 0 | 0 | 0 | 0 | 3.4 min | completed |
| date-form | codex | **44.5** | no | pass | 0/5 | 6 | 0 | 0 | 1 | 0.8 min | completed |
| loading-skeletons | claude | **100** | yes | pass | 3/3 | 0 | 0 | 0 | 0 | 1.5 min | completed |
| loading-skeletons | codex | **84.3** | no | pass | 2/3 | 1 | 0 | 0 | 0 | 0.8 min | completed |
| inline-notice | claude | **100** | yes | pass | 3/3 | 0 | 0 | 0 | 0 | 0.8 min | completed |
| inline-notice | codex | **100** | yes | pass | 3/3 | 0 | 0 | 0 | 0 | 0.6 min | completed |

## Failure modes

7 of 26 runs scored below 90; 2 of those read envUI's Markdown docs or skills, against 17 of the 19 others.

### Capabilities not built with envUI

| Task | Capability | envUI provides | claude | codex |
|---|---|---|---|---|
| sidebar | collapsible sidebar and its toggle | `AppShell` | ok | missed 1/1 |
| sidebar | sidebar navigation links | `NavigationItem` | ok | missed 1/1 |
| page-header | grouped actions | `ActionGroup`, `ButtonGroup` | ok | missed 1/1 |
| command-palette | search palette | `CommandPalette` | ok | missed 1/1 |
| command-palette | header search button | `Button`, `IconButton` | ok | missed 1/1 |
| command-palette | shortcut key caps | `Kbd` | ok | missed 1/1 |
| tabs-counts | count in each tab | `Badge`, `Counter` | ok | missed 1/1 |
| account-menu | avatar trigger | `AvatarButton`, `Avatar` | ok | missed 1/1 |
| account-menu | menu | `Menu` | ok | missed 1/1 |
| account-menu | menu items | `MenuItem` | ok | missed 1/1 |
| file-upload | pending upload state | `Button.pending`, `Spinner`, `Progress`, `LoadingBar` | ok | missed 1/1 |
| date-form | date picker | `DateTimeField`, `Calendar` | ok | missed 1/1 |
| date-form | project choice | `Select`, `Combobox` | ok | missed 1/1 |
| date-form | title field | `Input` | ok | missed 1/1 |
| date-form | description | `Textarea` | ok | missed 1/1 |
| date-form | create button | `Button` | ok | missed 1/1 |
| loading-skeletons | error message | `Notice`, `EmptyState` | ok | missed 1/1 |

### Raw HTML where envUI has a component (runs containing it)

| Element | claude (baseline) | codex (baseline) |
|---|--:|--:|
| `<button>` | 0/13 | 4/13 |
| `role="alert" on <Text>` | 0/13 | 2/13 |
| `role="status" on <Text>` | 0/13 | 2/13 |
| `<svg>` | 0/13 | 1/13 |
| `<aside>` | 0/13 | 1/13 |
| `<nav>` | 0/13 | 1/13 |
| `<a href>` | 0/13 | 1/13 |
| `<kbd>` | 0/13 | 1/13 |
| `clickable <div>` | 0/13 | 1/13 |
| `role="dialog"` | 0/13 | 1/13 |
| `<input type="search">` | 0/13 | 1/13 |
| `role="listbox"` | 0/13 | 1/13 |
| `role="menu"` | 0/13 | 1/13 |
| `<select>` | 0/13 | 1/13 |
| `<input type="text">` | 0/13 | 1/13 |
| `<input type="date">` | 0/13 | 1/13 |
| `<textarea>` | 0/13 | 1/13 |
| `role="status"` | 0/13 | 1/13 |
| `role="alert" on <Stack>` | 0/13 | 1/13 |

### Local components that duplicate envUI

| Task | Agent | Component | Instead of |
|---|---|---|---|
| sidebar | codex | `NavigationIcon` (src/App.tsx:13) | `Icon`, `DecorativeIcon` |

### Type errors on envUI (invented exports, props or members)

None.

### Raw style values and added dependencies

| Task | Agent | Raw colors | Raw px | `.env-*` overrides | Added dependencies | Examples |
|---|---|--:|--:|--:|---|---|
| sidebar | codex | 0 | 1 | 0 |  | src/app.css: @media (max-width: 640px) |
| command-palette | codex | 31 | 1 | 0 |  | src/app.css: border-bottom: 1px solid #e8eaf0; src/app.css: border: 1px solid #e1e4eb; src/app.css: background: #fff |
| account-menu | codex | 8 | 2 | 0 |  | src/app.css: color: #fff; src/app.css: background: #475569; src/app.css: background: #fff |
| date-form | codex | 1 | 0 | 0 |  | src/app.css: color: white |

## Scoring

Per run, over the files the agent created or changed (counts in a changed file are relative to its base version): typecheck passes 20; task capabilities built with envUI 35 × covered share; raw HTML 20 − 4 per weighted element; local duplicates of envUI 10 − 5 each; type errors on envUI 10 − 5 each; raw colors, px and `.env-*` overrides 5 − 0.5 each; −10 per third-party UI package added. Parts never go below zero; a run that changed no source scores 0. See bench/README.md.

