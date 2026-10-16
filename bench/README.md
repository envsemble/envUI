# envUI agent benchmark

Coding agents in apps that use envUI often hand-roll their own buttons, dialogs, sidebars and tables, invent props, and skip the docs that ship in the package. This benchmark measures that. It gives Claude Code and Codex realistic product tasks in a small app that depends on envUI, then scores how much of what they built uses envUI.

Each later agent aid (the AGENTS.md index, the MCP server, the manifest, the lint rules) is a **condition**. A condition is judged by its score against `baseline`.

## Contents

| Path                | What it is                                                                                                                                                                                                                                                                                                         |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `fixtures/basic/`   | A minimal Vite + React 19 + TypeScript app. It installs `@envsemble/envui` from a tarball, imports `styles.css` and renders inside `Theme`. Its `AGENTS.md` matches what apps have today: it says the UI uses `@envsemble/envui` and nothing more. It has a mocked `src/api.ts` and neutral sample data.           |
| `fixtures/hard/`    | Laid over `basic`: the same app with its own hand-rolled `Button`, `Modal`, `Toolbar` (raw `<button>`s) and `StatusPill` in `src/components/`, a barrel that also re-exports envUI's `Stack` and `Text`, and CSS with hex colors and px values. Agents imitate the code around them, so this fixture has headroom. |
| `tasks.json`        | 13 tasks. Each has a prompt, phrased the way a product engineer would ask without naming envUI components, and the capabilities envUI already offers for it.                                                                                                                                                       |
| `run.mjs`           | The runner and the CLI.                                                                                                                                                                                                                                                                                            |
| `lib/agents.mjs`    | How each agent CLI is invoked, the environment it gets, and how its transcript is read.                                                                                                                                                                                                                            |
| `lib/audit.mjs`     | The isolation audit of each run's transcript.                                                                                                                                                                                                                                                                      |
| `lib/conditions/`   | Conditions. `baseline` changes nothing.                                                                                                                                                                                                                                                                            |
| `lib/prepare.mjs`   | Packing the library, fixture variants, the installed template, workspaces and git diffs.                                                                                                                                                                                                                           |
| `lib/process.mjs`   | Running an agent with a timeout that bounds it, and stopping what it left running.                                                                                                                                                                                                                                 |
| `lib/score.mjs`     | The scorer: static, deterministic, built on the TypeScript compiler API.                                                                                                                                                                                                                                           |
| `lib/report.mjs`    | Aggregates and the Markdown summary.                                                                                                                                                                                                                                                                               |
| `lib/paths.mjs`     | Matching paths in any spelling, and redacting them from saved results.                                                                                                                                                                                                                                             |
| `scoring/*.json`    | Scoring data: raw HTML elements and roles, local-name aliases, and third-party UI packages.                                                                                                                                                                                                                        |
| `test/`             | Unit tests for the runner, the audit and the scorer; part of `npm test`.                                                                                                                                                                                                                                           |
| `results/<run-id>/` | Saved results: `summary.md` and compact `results.json`. Transcripts are not in git.                                                                                                                                                                                                                                |

## Running it

Requirements:

- Node 24 and npm.
- The `claude` CLI and the `codex` CLI, both logged in.
- A built library, or a tarball of a released version.

```sh
npm ci
npm run build:library            # or pass --build
npm run bench -- --condition baseline --agents claude,codex --tasks all
```

Options:

| Option                                | Default                   | Meaning                                                                        |
| ------------------------------------- | ------------------------- | ------------------------------------------------------------------------------ |
| `--condition`                         | `baseline`                | One or more conditions, comma-separated                                        |
| `--agents`                            | `claude,codex`            | Agents to run                                                                  |
| `--tasks`                             | `all`                     | `all`, or task ids such as `sidebar,settings-form`                             |
| `--fixture`                           | `basic`                   | `basic` or `hard`                                                              |
| `--concurrency`                       | `4`                       | Runs in parallel                                                               |
| `--timeout`                           | `12`                      | Minutes per run; the process tree is killed at the limit                       |
| `--run-id`                            | `<date>-<condition>`      | Name of the run directory and of `results/<run-id>`; `-hard` is added for hard |
| `--workdir`                           | `%TEMP%/agent-workspaces` | Workspaces, transcripts and caches; must not be near the repository            |
| `--tarball`, `--envui-commit`         | pack `packages/ui`        | Measure this `@envsemble/envui` tarball instead, built from that commit        |
| `--audit-path`                        | none                      | More folders, comma-separated, that agents must not touch, such as notes       |
| `--model-<agent>`, `--effort-<agent>` | see below                 | Override an agent's model or reasoning effort                                  |
| `--build`                             | off                       | Run `npm run build:library` before packing                                     |
| `--no-save`                           | off                       | Do not write `bench/results/<run-id>/`                                         |
| `--dry-run`                           | off                       | Prepare one workspace per agent and print the commands and environment         |

After a scorer change, rescore an earlier run from its workspaces without running the agents again. The audit runs again too:

```sh
npm run bench -- rescore --run-id 2026-10-16-baseline-v2
```

### Measuring a released version

A baseline should measure a release, not a branch. Build that release's tarball in a temporary worktree outside the repository's folder, then pass it in:

```sh
git worktree add --detach "$TEMP/envui-src" <release commit>
cd "$TEMP/envui-src" && npm ci && npm run build:library
cd packages/ui && npm pack --pack-destination "$TEMP"
cd - && git worktree remove --force "$TEMP/envui-src"
npm run bench -- --tarball "$TEMP/envsemble-envui-<version>.tgz" --envui-commit <release commit>
```

The results record the tarball's sha256 and the commit. Without `--tarball`, they record the checkout's `HEAD`, with `-dirty` when `packages/ui` has uncommitted changes.

### What a run does

1. Packs `packages/ui` with `npm pack`, or takes the `--tarball`.
2. Installs the fixture once per tarball and fixture version, into `_cache/templates/<hash>`. For `hard`, `fixtures/hard/` is copied over `fixtures/basic/` first. The tarball becomes `vendor/envsemble-envui.tgz` and the dependency is `file:vendor/envsemble-envui.tgz`, so an agent's own `npm install` still resolves it.
3. For each task, agent and condition:
   - copies the template, including `node_modules`, to `<workdir>/<run-id>/<agent>-<task>/`. This is outside the repository, so the source isn't next to the workspace.
   - applies the condition's `setup`, then commits everything as the base commit.
   - starts the agent there, in its own environment (below), with the prompt on stdin and the timeout.
   - stops any processes left running from the workspace or the run's temp folder, such as dev servers.
   - audits the transcript (below).
   - scores the diff against the base commit.
4. Writes `results.json` and `summary.md` to the run directory and to `bench/results/<run-id>/`.

Workdir layout:

```
<workdir>/
  _cache/packs/*.tgz, _cache/templates/<hash>/, _cache/npm/   npm cache for the template and the agents
  <run-id>/
    <agent>-<task>/                 the agent's workspace (a git repo)
    _tmp/<agent>-<task>/            the run's TEMP and TMP; home/ is its HOME on Windows
    _logs/<agent>-<task>/           transcript.jsonl, stderr.log, last-message.txt, diff.patch, score.json, meta.json
    run.json, records.json, results.json, summary.md
```

The workspace path is deliberately neutral (`agent-workspaces`, not "envui-bench"). The agent sees its working directory in its system prompt, and a path naming an envUI benchmark could prime it to use envUI.

### What a run can and can't reach

A run is **confined by its environment and audited afterwards. It is not sandboxed.**

- **Environment.** The agent starts from an allow-list, not from the runner's environment, which names the repository: npm puts its `node_modules/.bin` on `PATH` and sets `INIT_CWD`, and an outer agent session adds its own variables and tokens. It gets:
  - `SystemRoot`, `windir`, `SystemDrive`, `COMSPEC`, `PATHEXT`, `OS`, `NUMBER_OF_PROCESSORS` and `PROCESSOR_ARCHITECTURE`, which Windows programs need to start;
  - `USERPROFILE`, because both CLIs read their login from the profile (`~/.claude/.credentials.json`, `~/.codex/auth.json`), and `CLAUDE_CONFIG_DIR` or `CODEX_HOME` if set;
  - a new `PATH` of the Windows system folders, Node and npm, Git's `cmd` folder (both agents use git, and Claude Code finds Git Bash through it) and the CLI's own folder, so no repository or development folders;
  - `TEMP` and `TMP` in the run's `_tmp` folder, and on Windows `HOME` in `_tmp/<run>/home`, so Git Bash's `~`, `~/bin` and `~/.gitconfig` are not the user's;
  - `npm_config_cache` in `_cache/npm`;
  - for Claude Code, `DISABLE_AUTOUPDATER=1`, so the CLI doesn't update itself during a benchmark.

  Both CLIs were tested to start, log in and run shell commands with only these. On macOS and Linux, `HOME` stays the user's, because that is where the logins are.

- **Working directory.** Each agent starts in its workspace. The workdir must be outside the folder that holds the repository; the runner refuses one the audit would flag.
- **No sandbox for Claude Code.** `--dangerously-skip-permissions` lets it read and run anything the user can. Nothing stops it from finding the source checkout by searching the disk.
- **Codex's `workspace-write` sandbox limits writes only.** Codex can write to the workspace, the npm cache and its temp folder, and still read the whole disk.
- **Logins and user state.** Claude Code still creates a folder per workspace under `~/.claude/projects/` (with `--no-session-persistence`, no session is kept in it).

#### The isolation audit

Because the confinement is not a sandbox, every run's `transcript.jsonl`, `stderr.log` and `last-message.txt` are scanned after it ends, in any path spelling (`C:\`, `C:/`, Git Bash's `/c/`, JSON's doubled backslashes, Claude Code's `C--folder-name`). A run is **escaped** when they mention:

- the folder that holds the repository checkout, or the checkout's top-level folder (such as `C:\Dev`) unless that folder also holds the user profile or the temp folder;
- the folder name of a worktree of the repository;
- a path given with `--audit-path`;
- another run: its workspace, its temp folder, or the logs.

The main checkout's name, `envUI`, is also a folder inside the installed package (`assets/envUI`), so it counts only as part of the paths above.

Escaped runs are marked in `results.json` (`isolation.escaped` and the first hits) and in the summary, which says how many escaped in its header. They are failures of isolation, and their scores are not trustworthy. The audit can't see what an agent read without printing a path, such as a directory listing it never followed up on.

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

**Codex** (`codex.js` run with Node; the prompt arrives on stdin as `-`):

```
codex exec --json --ignore-user-config --ephemeral --sandbox workspace-write
  --model gpt-6-luna -c model_reasoning_effort="high"
  -c sandbox_workspace_write.network_access=true -c windows.sandbox="unelevated"
  --add-dir <npm cache> --add-dir <run temp> --cd <workspace> --output-last-message <file> -
```

- `--ignore-user-config` drops `~/.codex/config.toml`: its MCP servers, plugins and model. Auth still comes from `CODEX_HOME`.
- The `workspace-write` sandbox is the "full auto" mode. It needs the `unelevated` Windows sandbox when headless:
  - Without a Windows sandbox setting, the workspace is treated as read-only.
  - The `elevated` sandbox fails with `helper_unknown_error: setup refresh had errors`.
- The npm cache and the run's temp folder are added as writable roots. Without the cache, `npm install` fails with `EPERM` in the sandbox.
- Codex reports tokens per turn (`turn.completed`) but no cost.
- Model: `gpt-6.1-sol`, the model in the local config, is rejected with "not supported when using Codex with a ChatGPT account". `gpt-6-luna` is the CLI's default for this account.

### The timeout

A run ends when the agent's process exits or at the timeout, whichever comes first. The runner doesn't wait for the agent's output pipes to close: a dev server started in the background, such as `npm run dev &` in Git Bash, holds them open for as long as it runs. At the timeout, the whole process tree is killed (`taskkill /T /F` on Windows, the process group elsewhere). Afterwards, processes whose command line names the workspace or the run's temp folder are stopped.

## Scoring

The scorer looks only at files the agent created or changed (`git diff` against the base commit, including untracked files). In a changed file, the base version's counts are subtracted, so only what the agent added counts.

| Part                          |   Points | How                                                                                                                                                                                                                                                               |
| ----------------------------- | -------: | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Typecheck                     |       20 | The app type-checks with no errors: its own `tsconfig.json` with `strict` forced on, plus every changed TypeScript file as a root.                                                                                                                                |
| Capabilities built with envUI |       35 | × the share of the task's capabilities covered. A capability is covered when one of its envUI exports is used in the changed files. `Component.prop` entries also need that prop, as in `TableHeaderCell.onSort`.                                                 |
| No raw HTML                   |       20 | −4 per weighted occurrence of raw JSX where envUI has a component (`scoring/raw-html.json`).                                                                                                                                                                      |
| No local duplicates           |       10 | −5 per locally declared component that duplicates envUI (`scoring/aliases.json`).                                                                                                                                                                                 |
| No type errors on envUI       |       10 | −5 per TypeScript error attributed to envUI: an invented export, an unknown module such as a wrong icon path, a wrong or missing prop on an envUI element, a wrong member on an envUI value, or a local `declare module '@envsemble/envui'` shim.                 |
| No raw style values           |        5 | −0.5 per raw color, raw px length or `.env-*` override in changed CSS or in inline `style` objects.                                                                                                                                                               |
| Third-party UI packages       | −10 each | A package from `scoring/ui-libraries.json`, such as a toast, date-picker, icon or headless-UI package, added to `package.json` or imported in a changed file. Importing counts because envUI's own dependencies, such as `@base-ui/react`, are installed already. |
| Type-checker suppressions     |  −5 each | A `@ts-nocheck`, `@ts-ignore` or `@ts-expect-error` added in a changed file.                                                                                                                                                                                      |

Parts never go below zero. A run that changed no source or CSS scores 0. Timeouts and agent errors are scored on whatever they left on disk, and their status is reported. An idiomatic envUI solution scores 100. A hand-rolled solution that type-checks scores about 20–50.

### Type checking

- The app's `tsconfig.json` is parsed with its own path, and the compiler's working directory is the app, so `types` such as `vite/client` and the type roots resolve from the app's `node_modules` wherever the scorer runs. If the agent broke or removed `tsconfig.json`, its version in the base commit is used.
- In the changed files, suppression directives are neutralized before checking, so the errors they hide still count, in the typecheck and as envUI type errors.

### What counts as envUI

An envUI export is used when a changed file references it: imported from `@envsemble/envui` or one of its entry points, or imported from a local module that re-exports it. Re-exports are resolved with the TypeScript program, so `import { Button } from './ui'` counts when `./ui` has `export { Button } from '@envsemble/envui'`, `export *` from it, or imports and exports `Button` again, under any name.

### What counts as raw HTML

| Raw element                                                                                                                                                                                            |                                                                    Weight |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------: |
| `<button>`, `<select>`, `<textarea>`, `<dialog>`, `<table>`, `<progress>`, `<meter>`, `<details>`                                                                                                      |                                                                         1 |
| `<input>`                                                                                                                                                                                              | 1; its `type` names the envUI replacement; `type="hidden"` is not counted |
| ARIA widget roles (`role="button"`, `"dialog"`, `"tab"`, `"menu"`, `"switch"`, `"alert"`, ...) on raw elements, and on envUI elements whose own role differs (`<Text role="alert">` rebuilds `Notice`) |                                                                         1 |
| `<a>` used as a button: `onClick` with no real `href`                                                                                                                                                  |                                                                         1 |
| Other elements with `onClick`, `onMouseDown` or `onPointerDown`, such as a clickable `<div>`                                                                                                           |                                                                         1 |
| `<kbd>`, `<nav>`, `<aside>`, inline `<svg>` icons, and `<a href>` links                                                                                                                                |                                                                       0.5 |

### Local duplicates

A component is a candidate when the agent declared it (a PascalCase function, arrow function, `memo` or `forwardRef` wrapper, or class that renders JSX) and either:

- its full name is an envUI export or an alias, such as `Modal`, `Sidebar`, `Toggle`, `Dropdown`, `Toast` or `DatePicker`; or
- its last one to three words match an alias, such as `ConfirmModal`, `SidebarToggle`, `UserMenu` or `StatusBadge`.

A candidate is a duplicate only when its body uses none of the alias's envUI exports. A local `ConfirmDeleteDialog` built on envUI's `Dialog` is composition, not duplication. Composite names such as `SettingsPage` or `ProjectsTableView` are never candidates. Components already in the fixture, such as the hard fixture's `Modal`, are not the agent's and don't count; reusing them shows up as capabilities not built with envUI.

### Raw style values

The scanner checks:

- hex colors and `rgb()`, `hsl()`, `oklch()` and similar color functions;
- named colors in color properties;
- px lengths, apart from `0`/`1px`, and `2px` in borders, outlines and shadows (hairlines, as in Principle 10);
- px in media queries;
- selectors on envUI's private `.env-*` classes, and `env-*` class names in JSX;
- in inline `style` objects, the same values and bare numbers on length properties (React adds `px` to those).

### Reported but not scored: docs lookups

The transcript tells whether the agent read envUI's own material. "Read envUI docs" means at least one tool call read or searched Markdown in the installed package: `docs/`, `skills/` or `README.md`. Listing the folder doesn't count. Lookups in the type declarations and anywhere in the package are counted separately in `agentReport.envuiLookups`. An AGENTS.md index or an MCP server should raise these numbers before it raises the score.

### Saved results

`bench/results/<run-id>/` is committed, so it names no local user or folder: paths inside the run directory are stored relative to it, the user profile becomes `~`, and the tarball is stored by file name. An agent's final message is cut to a short excerpt; the full one is in `_logs/<run>/last-message.txt`, with the transcripts, which stay in the workdir.

### Limits

- **Static.** The scorer doesn't run the app or check behaviour. A capability built with the right component but wired wrongly still counts as covered.
- **Coverage is by export name.** Using envUI's `Button` for a toggle covers "toggle button" even if `AppShell` would have provided it. That is why the sidebar task lists only `AppShell` for the toggle.
- **The basic fixture has little headroom.** It is small, already uses envUI, and envUI is the only UI package installed. Agents that look in `node_modules` find the shipped docs and skills there. Judge a condition on Codex, on the `hard` fixture and on the docs-lookup numbers.
- **One run per task and agent.** Repeat runs before trusting differences of a few points.

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

If the task needs mocked data or an API call, add it to `fixtures/basic/src/api.ts` or `fixtures/basic/src/data/`. The hard fixture inherits it. That changes the template hash, and the next run reinstalls the template. Check that the task still makes sense in the hard fixture, whose projects page already has a toolbar (Refresh, Share) and a share modal.

## Cost and time

Baseline on 2026-10-16 (26 runs, 4 in parallel; exact figures in `results/2026-10-16-baseline/summary.md`):

- The whole run took 11 minutes of wall-clock time.
- Claude Code:
  - 21 min of agent time, 0.7–3.4 min per run;
  - $7.16 at list price;
  - 8.4M input tokens, mostly cache reads, and 86k output tokens.
- Codex:
  - 10.5 min of agent time, 0.4–2.6 min per run;
  - cost not reported;
  - 3.3M input tokens, mostly cached, and 38k output tokens.

- Installing the template takes about 40 s, once per tarball. Copying a workspace takes about 15 s per run.
- No run came near the 12-minute timeout.
- Claude Code reports a list-price cost per run. On a subscription this is an estimate, not a charge. Codex reports tokens only.
- Every condition repeats the full matrix. Run single tasks (`--tasks sidebar`) while developing a condition.
