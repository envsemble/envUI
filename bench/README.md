# envUI agent benchmark

Coding agents in apps that use envUI often hand-roll their own buttons, dialogs, sidebars and tables, invent props, and skip the docs that ship in the package. This benchmark measures that. It gives Claude Code and Codex realistic product tasks in a small app that depends on envUI, then scores how much of what they built uses envUI.

Each later agent aid (the AGENTS.md index, the MCP server, the manifest, the lint rules) is a **condition**. A condition is judged by its score against `baseline`.

## Contents

| Path                | What it is                                                                                                                                                                                                                                                                                               |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fixture/`          | A minimal Vite + React 19 + TypeScript app. It installs `@envsemble/envui` from a tarball, imports `styles.css` and renders inside `Theme`. Its `AGENTS.md` matches what apps have today: it says the UI uses `@envsemble/envui` and nothing more. It has a mocked `src/api.ts` and neutral sample data. |
| `tasks.json`        | 13 tasks. Each has a prompt, phrased the way a product engineer would ask without naming envUI components, and the capabilities envUI already offers for it.                                                                                                                                             |
| `run.mjs`           | The runner and the CLI.                                                                                                                                                                                                                                                                                  |
| `lib/agents.mjs`    | How each agent CLI is invoked and how its transcript is read.                                                                                                                                                                                                                                            |
| `lib/conditions/`   | Conditions. `baseline` changes nothing.                                                                                                                                                                                                                                                                  |
| `lib/prepare.mjs`   | Packing the library, the installed template, workspaces and git diffs.                                                                                                                                                                                                                                   |
| `lib/score.mjs`     | The scorer: static, deterministic, built on the TypeScript compiler API.                                                                                                                                                                                                                                 |
| `lib/report.mjs`    | Aggregates and the Markdown summary.                                                                                                                                                                                                                                                                     |
| `scoring/*.json`    | Scoring data: raw HTML elements and roles, local-name aliases, and third-party UI packages.                                                                                                                                                                                                              |
| `results/<run-id>/` | Saved results: `summary.md` and compact `results.json`. Transcripts are not in git.                                                                                                                                                                                                                      |

## Running it

Requirements:

- Node 24 and npm.
- The `claude` CLI and the `codex` CLI, both logged in.
- A built library.

```sh
npm ci
npm run build:library            # or pass --build
npm run bench -- --condition baseline --agents claude,codex --tasks all
```

Options:

| Option                                | Default                   | Meaning                                                  |
| ------------------------------------- | ------------------------- | -------------------------------------------------------- |
| `--condition`                         | `baseline`                | One or more conditions, comma-separated                  |
| `--agents`                            | `claude,codex`            | Agents to run                                            |
| `--tasks`                             | `all`                     | `all`, or task ids such as `sidebar,settings-form`       |
| `--concurrency`                       | `4`                       | Runs in parallel                                         |
| `--timeout`                           | `12`                      | Minutes per run; the process tree is killed at the limit |
| `--run-id`                            | `<date>-<condition>`      | Name of the run directory and of `results/<run-id>`      |
| `--workdir`                           | `%TEMP%/agent-workspaces` | Workspaces, transcripts and caches                       |
| `--model-<agent>`, `--effort-<agent>` | see below                 | Override an agent's model or reasoning effort            |
| `--build`                             | off                       | Run `npm run build:library` before packing               |
| `--no-save`                           | off                       | Do not write `bench/results/<run-id>/`                   |
| `--dry-run`                           | off                       | Prepare one workspace per agent and print the commands   |

After a scorer change, rescore an earlier run from its workspaces without running the agents again:

```sh
npm run bench -- rescore --run-id 2026-10-16-baseline
```

### What a run does

1. Packs `packages/ui` with `npm pack`.
2. Installs the fixture once per tarball and fixture version, into `_cache/templates/<hash>`. The tarball becomes `vendor/envsemble-envui.tgz` and the dependency is `file:vendor/envsemble-envui.tgz`, so an agent's own `npm install` still resolves it.
3. For each task, agent and condition:
   - copies the template, including `node_modules`, to `<workdir>/<run-id>/<agent>-<task>/`. This is outside the repo, so the agent never sees the envUI source.
   - applies the condition's `setup`, then commits everything as the base commit.
   - starts the agent there with the prompt on stdin and the timeout.
   - stops any processes left running in the workspace, such as dev servers.
   - scores the diff against the base commit.
4. Writes `results.json` and `summary.md` to the run directory and to `bench/results/<run-id>/`.

Workdir layout:

```
<workdir>/
  _cache/packs/*.tgz, _cache/templates/<hash>/
  <run-id>/
    <agent>-<task>/                 the agent's workspace (a git repo)
    _logs/<agent>-<task>/           transcript.jsonl, stderr.log, last-message.txt, diff.patch, score.json, meta.json
    run.json, records.json, results.json, summary.md
```

The workspace path is deliberately neutral (`agent-workspaces`, not "envui-bench"). The agent sees its working directory in its system prompt, and a path naming an envUI benchmark could prime it to use envUI.

### How the agents are invoked

Both agents run headless, at the same effort level, with their user configuration left out. That way a run sees only the project and is reproducible on another machine.

**Claude Code** (the prompt arrives on stdin, the working directory is the workspace):

```
claude -p --model claude-opus-5-5 --effort high --dangerously-skip-permissions
  --output-format stream-json --verbose --no-session-persistence
  --setting-sources project,local --strict-mcp-config
```

- `--setting-sources project,local` skips user settings, plugins and hooks.
- `--strict-mcp-config` with no `--mcp-config` means no MCP servers.
- The stream-json transcript ends in a `result` event with turns, `total_cost_usd` and per-model token usage.
- Claude Code 2.1.300 reads `AGENTS.md` natively, so the fixture has no `CLAUDE.md`.
- Environment variables of an outer Claude Code session (`CLAUDECODE`, `CLAUDE_CODE_*` and the like) are removed, so a run started from inside an agent is not a nested session.

**Codex** (`codex.js` run with Node; the prompt arrives on stdin as `-`):

```
codex exec --json --ignore-user-config --ephemeral --sandbox workspace-write
  --model gpt-6-luna -c model_reasoning_effort="high"
  -c sandbox_workspace_write.network_access=true -c windows.sandbox="unelevated"
  --add-dir <npm cache> --cd <workspace> --output-last-message <file> -
```

- `--ignore-user-config` drops `~/.codex/config.toml`: its MCP servers, plugins and model. Auth still comes from `CODEX_HOME`.
- The `workspace-write` sandbox is the "full auto" mode. It needs the `unelevated` Windows sandbox when headless:
  - Without a Windows sandbox setting, the workspace is treated as read-only.
  - The `elevated` sandbox fails with `helper_unknown_error: setup refresh had errors`.
- The npm cache is added as a writable root. Without it, `npm install` fails with `EPERM` in the sandbox.
- Codex reports tokens per turn (`turn.completed`) but no cost.
- Model: `gpt-6.1-sol`, the model in the local config, is rejected with "not supported when using Codex with a ChatGPT account". `gpt-6-luna` is the CLI's default for this account.

## Scoring

The scorer looks only at files the agent created or changed (`git diff` against the base commit, including untracked files). In a changed file, the base version's counts are subtracted, so only what the agent added counts.

| Part                          |   Points | How                                                                                                                                                                                                                                               |
| ----------------------------- | -------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Typecheck                     |       20 | The app type-checks with no errors: its own `tsconfig.json` with `strict` forced on, plus every changed TypeScript file as a root.                                                                                                                |
| Capabilities built with envUI |       35 | × the share of the task's capabilities covered. A capability is covered when one of its envUI exports is used in the changed files. `Component.prop` entries also need that prop, as in `TableHeaderCell.onSort`.                                 |
| No raw HTML                   |       20 | −4 per weighted occurrence of raw JSX where envUI has a component (`scoring/raw-html.json`).                                                                                                                                                      |
| No local duplicates           |       10 | −5 per locally declared component that duplicates envUI (`scoring/aliases.json`).                                                                                                                                                                 |
| No type errors on envUI       |       10 | −5 per TypeScript error attributed to envUI: an invented export, an unknown module such as a wrong icon path, a wrong or missing prop on an envUI element, a wrong member on an envUI value, or a local `declare module '@envsemble/envui'` shim. |
| No raw style values           |        5 | −0.5 per raw color, raw px length or `.env-*` override in changed CSS or in inline `style` objects.                                                                                                                                               |
| Third-party UI packages       | −10 each | A dependency added from `scoring/ui-libraries.json`, such as a toast, date-picker, icon or headless-UI package.                                                                                                                                   |

Parts never go below zero. A run that changed no source or CSS scores 0. Timeouts and agent errors are scored on whatever they left on disk, and their status is reported. An idiomatic envUI solution scores 100. A solution with no envUI that type-checks usually scores 20–40.

### What counts as raw HTML

| Raw element                                                                                                   |                                                                    Weight |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------: |
| `<button>`, `<select>`, `<textarea>`, `<dialog>`, `<table>`, `<progress>`, `<meter>`, `<details>`             |                                                                         1 |
| `<input>`                                                                                                     | 1; its `type` names the envUI replacement; `type="hidden"` is not counted |
| ARIA widget roles on any element (`role="button"`, `"dialog"`, `"tab"`, `"menu"`, `"switch"`, `"alert"`, ...) |                                                                         1 |
| `<a>` used as a button: `onClick` with no real `href`                                                         |                                                                         1 |
| Other elements with `onClick`, `onMouseDown` or `onPointerDown`, such as a clickable `<div>`                  |                                                                         1 |
| `<kbd>`, `<nav>`, `<aside>`, inline `<svg>` icons, and `<a href>` links                                       |                                                                       0.5 |

### Local duplicates

A component is a candidate when the agent declared it (a PascalCase function, arrow function, `memo` or `forwardRef` wrapper, or class that renders JSX) and either:

- its full name is an envUI export or an alias, such as `Modal`, `Sidebar`, `Toggle`, `Dropdown`, `Toast` or `DatePicker`; or
- its last one to three words match an alias, such as `ConfirmModal`, `SidebarToggle`, `UserMenu` or `StatusBadge`.

A candidate is a duplicate only when its body uses none of the alias's envUI exports. A local `ConfirmDeleteDialog` built on envUI's `Dialog` is composition, not duplication. Composite names such as `SettingsPage` or `ProjectsTableView` are never candidates.

### Raw style values

The scanner checks:

- hex colors and `rgb()`, `hsl()`, `oklch()` and similar color functions;
- named colors in color properties;
- px lengths, apart from `0`/`1px`, and `2px` in borders, outlines and shadows (hairlines, as in Principle 10);
- px in media queries;
- selectors on envUI's private `.env-*` classes, and `env-*` class names in JSX;
- in inline `style` objects, the same values and bare numbers on length properties (React adds `px` to those).

### Limits

The scorer is static. It does not run the app or check behaviour: a capability built with the right component but wired wrongly still counts as covered. Coverage is by export name, so using envUI's `Button` for a toggle covers "toggle button" even if `AppShell` would have provided it. That is why the sidebar task lists only `AppShell` for the toggle. Treat scores as relative: compare conditions under the same agent and settings, and repeat runs before trusting small differences.

## Adding a condition

A condition is a module in `lib/conditions/` registered in `lib/conditions/index.mjs`:

```js
export default {
  name: 'agents-md',
  description: 'AGENTS.md carries the envUI index block.',
  async setup({ appDir, repoDir, task, agent }) {
    // Runs on the fresh workspace before the base commit, so the agent sees the change as
    // existing project state and the scorer does not count it as the agent's work.
  },
  agentArgs({ agent, appDir }) {
    return []; // extra CLI arguments for that agent
  },
};
```

Planned conditions:

- **AGENTS.md index.** `setup` runs `npx envui agents` in the workspace, or appends the generated block between the `BEGIN/END envui` markers.
- **MCP server.**
  - `setup` writes `.mcp.json`.
  - For Claude Code, `agentArgs` returns `['--mcp-config', join(appDir, '.mcp.json')]`, because `--strict-mcp-config` ignores other sources.
  - For Codex, it returns `['-c', 'mcp_servers.envui.command="npx"', '-c', 'mcp_servers.envui.args=["envui","mcp"]']`.
- **ESLint plugin.** `setup` adds the plugin and an `eslint.config.js`, and adds `npm run lint` to the AGENTS.md commands. If the plugin isn't published yet, the fixture's `package.json` gets it as a `file:` tarball before install. That changes the template hash, so the template is reinstalled automatically.

Run several conditions in one go with `--condition baseline,agents-md`. Workspaces are then named `<condition>-<agent>-<task>`.

## Adding a task

Add an entry to `tasks.json` with:

- an `id`;
- a `title`;
- a `prompt` that doesn't name envUI components;
- `capabilities`, each with the envUI exports that provide it.

If the task needs mocked data or an API call, add it to `fixture/src/api.ts` or `fixture/src/data/`. That changes the template hash, and the next run reinstalls the template.

## Cost and time

Baseline on 2026-10-16: see `results/2026-10-16-baseline/summary.md` for exact figures.

- Installing the template takes about 40 s, once per tarball. Copying a workspace takes about 15 s per run.
- With 4 runs in parallel, one condition with both agents and all 13 tasks (26 runs) takes roughly 30–60 minutes.
- Claude Code reports a list-price cost per run. On a subscription this is an estimate, not a charge.
- Codex reports tokens only.
- Every condition repeats the full matrix. Run single tasks (`--tasks sidebar`) while developing a condition.
