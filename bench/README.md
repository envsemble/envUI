# envUI agent benchmark

Coding agents in apps that use envUI often hand-roll their own buttons, dialogs, sidebars, tables and layouts, invent props, and skip the docs that ship in the package. This benchmark measures that. It gives Claude Code, with Claude Haiku 5.5 at high effort and with Claude Opus 5.5 at low effort, realistic product tasks in a small app that depends on envUI, then scores how much of what they built uses envUI and, rendered in a browser at four widths, how it lays out.

Each later agent aid (the AGENTS.md index, the MCP server, the manifest, the lint rules) is a **condition**. A condition is judged by its score against `baseline`.

## Contents

| Path                 | What it is                                                                                                                                                                                                                                                                                                                 |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `fixtures/basic/`    | A minimal Vite + React 19 + TypeScript app. It installs `@envsemble/envui` from a tarball, imports `styles.css` and renders inside `Theme`. Its `AGENTS.md` matches what apps have today: it says the UI uses `@envsemble/envui` and nothing more. It has a mocked `src/api.ts` and neutral sample data.                   |
| `fixtures/hard/`     | Laid over `basic`: the same app with its own hand-rolled `Button`, `Modal`, `Toolbar` (raw `<button>`s) and `StatusPill` in `src/components/`, a barrel that also re-exports envUI's `Column`, `Row` and `Text`, and CSS with hex colors and px values. Agents imitate the code around them, so this fixture has headroom. |
| `tasks.json`         | 19 tasks. Each has a prompt, phrased the way a product engineer would ask without naming envUI components, and its capabilities: the envUI exports that provide one, or checks of what renders.                                                                                                                            |
| `run.mjs`            | The runner and the CLI.                                                                                                                                                                                                                                                                                                    |
| `lib/agents.mjs`     | The agents: how Claude Code is invoked with each model and effort, the environment it gets, and how its transcript is read.                                                                                                                                                                                                |
| `lib/browser.mjs`    | The browser step: renders a result in development with envUI's dev mode and measures it at four widths.                                                                                                                                                                                                                    |
| `lib/dev-server.mjs` | The result's dev server, which the browser step runs in a child process with the agent's environment.                                                                                                                                                                                                                      |
| `lib/audit.mjs`      | The isolation audit of each run's transcript.                                                                                                                                                                                                                                                                              |
| `lib/conditions/`    | Conditions. `baseline` changes nothing.                                                                                                                                                                                                                                                                                    |
| `lib/prepare.mjs`    | Packing the library, fixture variants, the installed template, workspaces and git diffs.                                                                                                                                                                                                                                   |
| `lib/process.mjs`    | Running an agent with a timeout that bounds it, and stopping what it left running.                                                                                                                                                                                                                                         |
| `lib/score.mjs`      | The scorer: the static parts, deterministic, built on the TypeScript compiler API and the ESLint plugin's layout rule, and the total with the browser step's parts.                                                                                                                                                        |
| `lib/report.mjs`     | Aggregates and the Markdown summary.                                                                                                                                                                                                                                                                                       |
| `lib/paths.mjs`      | Matching paths in any spelling, and redacting them from saved results.                                                                                                                                                                                                                                                     |
| `scoring/*.json`     | Scoring data: raw HTML elements and roles, local-name aliases, and third-party UI packages.                                                                                                                                                                                                                                |
| `test/`              | Unit tests for the runner, the audit and the scorer; part of `npm test`.                                                                                                                                                                                                                                                   |
| `results/<run-id>/`  | Saved results: `summary.md` and compact `results.json`. Transcripts are not in git.                                                                                                                                                                                                                                        |

## Running it

Requirements:

- Node 24 and npm.
- The `claude` CLI, logged in, with access to Claude Haiku 5.5 and Claude Opus 5.5.
- Playwright's Chromium, which the repository's browser tests use too (`npx playwright install chromium`), for the browser step.
- A built library, or a tarball of a released version.

```sh
npm ci
npm run build:library            # or pass --build
npm run bench -- --condition baseline --agents haiku,opus --tasks all
```

The benchmark runs locally only. It is not part of CI, and it uploads nothing: results are files on disk, and the browser step's dev server listens on 127.0.0.1.

Options:

| Option                                | Default                   | Meaning                                                                         |
| ------------------------------------- | ------------------------- | ------------------------------------------------------------------------------- |
| `--condition`                         | `baseline`                | One or more conditions, comma-separated                                         |
| `--agents`                            | `haiku,opus`              | Agents to run, below                                                            |
| `--tasks`                             | `all`                     | `all` (without the pending tasks), or task ids such as `sidebar,app-frame`      |
| `--fixture`                           | `basic`                   | `basic` or `hard`                                                               |
| `--concurrency`                       | `4`                       | Runs in parallel                                                                |
| `--timeout`                           | `12`                      | Minutes per run; the process tree is killed at the limit                        |
| `--run-id`                            | `<date>-<condition>`      | Name of the run directory and of `results/<run-id>`; `-hard` is added for hard  |
| `--workdir`                           | `%TEMP%/agent-workspaces` | Workspaces, transcripts and caches; must not be near the repository             |
| `--tarball`, `--envui-commit`         | pack `packages/ui`        | Measure this `@envsemble/envui` tarball instead, built from that commit         |
| `--audit-path`                        | none                      | More folders, comma-separated, that agents must not touch, such as notes        |
| `--model-<agent>`, `--effort-<agent>` | see below                 | Override an agent's model or reasoning effort                                   |
| `--build`                             | off                       | Run `npm run build:library` before packing                                      |
| `--no-browser`                        | off                       | Skip the browser step; see [Scoring](#scoring) for what is then left out        |
| `--no-save`                           | off                       | Do not write `bench/results/<run-id>/`                                          |
| `--dry-run`                           | off                       | Prepare one workspace per agent and print the commands and environment          |
| `--resume`                            | off                       | Finish a run whose runner stopped: keep the finished runs, run the others again |

After a scorer change, rescore an earlier run from its workspaces without running the agents again. The audit runs again too:

```sh
npm run bench -- rescore --run-id 2026-10-16-baseline-v2
```

If the runner stops before the end, for example because an agent stopped it, run the same command again with `--resume`. Runs that finished are rescored and kept; the others run again, and the logs of their unfinished attempt move to `_logs/<agent>-<task>.unfinished`.

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
   - when the agent changed anything, renders the result in the browser step (below) and adds its parts to the score.
4. Writes `results.json` and `summary.md` to the run directory and to `bench/results/<run-id>/`.

Workdir layout:

```
<workdir>/
  _cache/packs/*.tgz, _cache/templates/<hash>/, _cache/npm/   npm cache for the template and the agents
  <run-id>/
    <agent>-<task>/                 the agent's workspace (a git repo)
    _tmp/<agent>-<task>/            the run's TEMP and TMP; home/ is its HOME on Windows
    _logs/<agent>-<task>/           transcript.jsonl, stderr.log, last-message.txt, diff.patch, score.json, rendered.json, meta.json
    run.json, records.json, results.json, summary.md
```

The workspace path is deliberately neutral (`agent-workspaces`, not "envui-bench"). The agent sees its working directory in its system prompt, and a path naming an envUI benchmark could prime it to use envUI.

### What a run can and can't reach

A run is **confined by its environment and audited afterwards. It is not sandboxed.**

- **Environment.** The agent starts from an allow-list, not from the runner's environment, which names the repository: npm puts its `node_modules/.bin` on `PATH` and sets `INIT_CWD`, and an outer agent session adds its own variables and tokens. It gets:
  - `SystemRoot`, `windir`, `SystemDrive`, `COMSPEC`, `PATHEXT`, `OS`, `NUMBER_OF_PROCESSORS` and `PROCESSOR_ARCHITECTURE`, which Windows programs need to start;
  - `USERPROFILE`, because the CLI reads its login from the profile (`~/.claude/.credentials.json`), and `CLAUDE_CONFIG_DIR` if set;
  - a new `PATH` of the Windows system folders, Node and npm, Git's `cmd` folder (the agents use git, and Claude Code finds Git Bash through it) and the CLI's own folder, so no repository or development folders;
  - `TEMP` and `TMP` in the run's `_tmp` folder, and on Windows `HOME` in `_tmp/<run>/home`, so Git Bash's `~`, `~/bin` and `~/.gitconfig` are not the user's;
  - `npm_config_cache` in `_cache/npm`;
  - for Claude Code, `DISABLE_AUTOUPDATER=1`, so the CLI doesn't update itself during a benchmark.

  The CLI was tested to start, log in and run shell commands with only these. On macOS and Linux, `HOME` stays the user's, because that is where the login is.

- **Working directory.** Each agent starts in its workspace. The workdir must be outside the folder that holds the repository; the runner refuses one the audit would flag.
- **No sandbox for Claude Code.** `--dangerously-skip-permissions` lets it read and run anything the user can. Nothing stops it from finding the source checkout by searching the disk.
- **Git Bash's `/tmp` is the user's temp folder.** Git for Windows mounts `/tmp` there whatever `TEMP` says, so in the baselines Claude Code wrote scratch files such as screenshots and browser scripts to the user's temp folder. That folder can hold other projects' files. No baseline run read any of them, but the audit doesn't check that folder.
- **Logins and user state.** Claude Code still creates a folder per workspace under `~/.claude/projects/` (with `--no-session-persistence`, no session is kept in it).
- **Processes and ports.** Runs share the machine. An agent can stop any process the user can, and parallel runs can start dev servers on the same port. In the first hard-fixture baseline, a Claude Code run cleaned up with `taskkill /F /IM node.exe`, which stopped every Node process on the machine, the runner included; `--resume` finished that run.

#### The isolation audit

Because the confinement is not a sandbox, every run's `transcript.jsonl`, `stderr.log` and `last-message.txt` are scanned after it ends, in any path spelling (`C:\`, `C:/`, Git Bash's `/c/`, JSON's doubled backslashes, Claude Code's `C--folder-name`). A run is **escaped** when they mention:

- the folder that holds the repository checkout, or the checkout's top-level folder (such as `C:\Dev`) unless that folder also holds the user profile or the temp folder;
- the folder name of a worktree of the repository;
- a path given with `--audit-path`;
- another run: its workspace, its temp folder, the logs, the list of temp folders or the run's own files such as `records.json`. A scratch folder an agent makes next to its own temp folder, say for a browser check, is not another run's.
- a command that stops processes by name across the machine, such as `taskkill /F /IM node.exe` or `Stop-Process -Name node`. Stopping a process by its id or port doesn't count.

The main checkout's name, `envUI`, is also a folder inside the installed package (`assets/envUI`), so it counts only as part of the paths above.

Escaped runs are marked in `results.json` (`isolation.escaped` and the first hits) and in the summary, which says how many escaped in its header. They are failures of isolation, and their scores are not trustworthy. The audit can't see what an agent read without printing a path, such as a directory listing it never followed up on.

### How the agents are invoked

Each agent is Claude Code with one model at one effort, headless, with its user configuration left out. That way a run sees only the project and is reproducible on another machine. A run compares the models under the same harness.

| Agent   | Model                                 | Effort |
| ------- | ------------------------------------- | ------ |
| `haiku` | Claude Haiku 5.5 (`claude-haiku-5-5`) | `high` |
| `opus`  | Claude Opus 5.5 (`claude-opus-5-5`)   | `low`  |

`--model-<agent>` and `--effort-<agent>` override them for one run, such as `--effort-opus medium`. The prompt arrives on stdin, and the working directory is the workspace:

```
claude -p --model <model> --effort <effort> --dangerously-skip-permissions
  --output-format stream-json --verbose --no-session-persistence
  --setting-sources project,local --strict-mcp-config
```

- `--setting-sources project,local` skips user settings, plugins and hooks.
- `--strict-mcp-config` with no `--mcp-config` means no MCP servers.
- The stream-json transcript ends in a `result` event with turns, `total_cost_usd` and per-model token usage.
- Claude Code 2.1.300 reads `AGENTS.md` natively, so the fixture has no `CLAUDE.md`.

The baselines of 2026-10-16 ran Claude Code with Claude Opus 5.5 at high effort and Codex; the runner no longer has Codex. `rescore` keeps an older run's agent reports for agents it doesn't have.

### The timeout

A run ends when the agent's process exits or at the timeout, whichever comes first. The runner doesn't wait for the agent's output pipes to close: a dev server started in the background, such as `npm run dev &` in Git Bash, holds them open for as long as it runs. At the timeout, the whole process tree is killed (`taskkill /T /F` on Windows, the process group elsewhere). Afterwards, processes whose command line names the workspace or the run's temp folder are stopped.

## Scoring

The scorer looks only at files the agent created or changed (`git diff` against the base commit, including untracked files). In a changed file, the base version's counts are subtracted, so only what the agent added counts.

| Part                      |   Points | How                                                                                                                                                                                                                                                                                                                |
| ------------------------- | -------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Typecheck                 |       15 | The app type-checks with no errors: its own `tsconfig.json` with `strict` forced on, plus every changed TypeScript file as a root.                                                                                                                                                                                 |
| Capabilities covered      |       30 | × the share of the task's capabilities covered. A capability named by envUI exports is covered when one of them is used in the changed files; `Component.prop` entries also need that prop, as in `TableHeaderCell.onSort`. One described by what renders is covered when all its checks pass in the browser step. |
| No raw HTML               |       15 | −4 per weighted occurrence of raw JSX where envUI has a component (`scoring/raw-html.json`).                                                                                                                                                                                                                       |
| No local duplicates       |       10 | −5 per locally declared component that duplicates envUI (`scoring/aliases.json`).                                                                                                                                                                                                                                  |
| No type errors on envUI   |       10 | −5 per TypeScript error attributed to envUI: an invented export, an unknown module such as a wrong icon path, a wrong or missing prop on an envUI element, a wrong member on an envUI value, or a local `declare module '@envsemble/envui'` shim.                                                                  |
| No raw style values       |        5 | −0.5 per raw color or raw px length in changed CSS or inline `style` objects, and per private component token set.                                                                                                                                                                                                 |
| No hand-rolled layout     |        5 | −2 per flex or grid layout hand-rolled in an inline style, as the ESLint plugin's `no-hand-rolled-layout` rule reports it. A hand-rolled container costs more than the half point of a raw value, so it is never cheaper than a primitive, whose layout dev mode checks.                                           |
| Rendered layout           |       10 | −2 per distinct layout problem the browser step finds at 22, 40, 60 and 80rem, in envUI's layout nodes and in hand-rolled containers alike; 0 when the app doesn't render.                                                                                                                                         |
| Third-party UI packages   | −10 each | A package from `scoring/ui-libraries.json`, such as a toast, date-picker, icon or headless-UI package, added to `package.json` or imported in a changed file. Importing counts because envUI's own dependencies, such as `@base-ui/react`, are installed already.                                                  |
| Type-checker suppressions |  −5 each | A `@ts-nocheck`, `@ts-ignore` or `@ts-expect-error` added in a changed file.                                                                                                                                                                                                                                       |

Parts never go below zero. A run that changed no source or CSS scores 0. Timeouts and agent errors are scored on whatever they left on disk, and their status is reported. An idiomatic envUI solution scores 100.

With `--no-browser`, or when the browser step fails on its own account (below), the parts a run couldn't check, the rendered layout and the capabilities described by what renders, are left out, and the parts that were checked are scaled to 100 before the penalties come off. Such a score is marked by `notChecked` in `results.json` and "n/a" in the summary's layout columns, and is not comparable with a score that had the browser step.

#### Changes on 2026-10-21

The weights changed when the browser step came: the typecheck went from 20 to 15 points and the capabilities from 35 to 30, for the 10 points of rendered layout, and raw HTML from 20 to 15, for the 5 points of hand-rolled layout. Part classes (`env-*`) in class names and selectors no longer count against a result, since part names are a public, versioned contract; setting a private component token does instead. Scores before and after this change are not comparable.

### The browser step

After a run is scored statically, the runner renders its result:

1. It starts the app's own Vite dev server in a child process (`lib/dev-server.mjs`), with the agent's environment and the app's `vite.config`, from the workspace's `node_modules`, on a free port on 127.0.0.1. The result's config and plugins never run inside the runner. Vite's cache goes to the run's temp folder, so nothing is written to the workspace. A small plugin adds the runner's module, `virtual:bench-dev-mode`, to the page; it loads envUI's dev mode, `@envsemble/envui/dev`, and installs it with the package's part names and without its button or shortcut.
2. One headless Chromium serves the whole run, opened once, with a new context for each result. `Math.random` is seeded in it before the app's scripts, so the fixture's mocked calls, which fail at random, fail or succeed the same way every time a result is measured. Nothing is captured as an image.
3. The page loads at 80rem wide. The checks a task asks for while loading are measured as soon as the app has rendered. The step then waits for dev mode, until the fixture's mocked calls have answered (1.8 s after the first render), nothing is `aria-busy` and the DOM has been quiet for 0.3 s, 5 s at most.
4. At 22, 40, 60 and 80rem in turn, the window takes the width, so the app's own media queries respond as well as container queries, and after two frames the step reads `envui.layout.at([width])`, the page's own sideways overflow, the hand-rolled containers' overflow and the task's rendered checks.
5. The dev server's process tree is killed (`taskkill /T /F` on Windows, the process group elsewhere) and the context closed, however the step ended. The whole step has 120 s; a page that hangs is closed, not reused, and a dev server that starts late is killed as it starts.

A problem is one of dev mode's (`content-overflow`, `child-overflow`, `overlay-off-window`, `layout-paints`, `sticky-without-scroll`, `text-squeezed`, see `docs/dev-mode.md`); `page-overflow`, the whole page wider than the window; or one of the benchmark's own check of hand-rolled containers. A problem seen at several widths, the same rule on the same node, counts once.

Dev mode checks layout nodes, the elements envUI's primitives and scaffolds mark with `data-env-layout`, and open overlays. So that hand-rolling is not exempt from what a primitive is checked for, the benchmark checks the hand-rolled containers itself, without changing dev mode's rules: every visible flex or grid container in the app's root that is neither a layout node nor one of envUI's parts (an `env-*` class), whether its `display` comes from an inline style or a style sheet, that doesn't scroll. It has `child-overflow` when a child sticks out while it doesn't clip, and `content-overflow` when its content is wider than it; only the deepest such container is reported, as dev mode does. Its node is written `hand-rolled div.summary`.

A result that doesn't render gets 0 for rendered layout and no rendered capability. That is the result's doing: its dev server fails in the result's `vite.config` or plugins, exits, or says something and never listens; the page shows a build error from the result's files; or the app renders nothing within 3 s of an uncaught error. When the step fails on its own account, nothing of it is charged to the agent: a port that can't be bound, a build error in the runner's own module (`virtual:bench-dev-mode`, which loads dev mode, so its errors name it), dev mode not loading, a dev server that says nothing for 60 s, or the step's 120 s limit. `harnessError` says why, the summary lists it as "browser step failed, not scored", and the parts are left out as with `--no-browser`. The step takes about 4–6 s per run, plus Vite's first dependency optimization for a template. The outcome is in `_logs/<run>/rendered.json`.

### Type checking

- The app's `tsconfig.json` is parsed with its own path, and the compiler's working directory is the app, so `types` such as `vite/client` and the type roots resolve from the app's `node_modules` wherever the scorer runs. If the agent broke or removed `tsconfig.json`, its version in the base commit is used.
- In the changed files, suppression directives are neutralized before checking, so the errors they hide still count, in the typecheck and as envUI type errors.

### What counts as envUI

An envUI export is used when a changed file references it: imported from `@envsemble/envui` or one of its entry points, or imported from a local module that re-exports it. Re-exports are resolved with the TypeScript program, so `import { Button } from './ui'` counts when `./ui` has `export { Button } from '@envsemble/envui'`, `export *` from it, or imports and exports `Button` again, under any name.

### What counts as raw HTML

| Raw element                                                                                                                                                                                           |                                                                    Weight |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------: |
| `<button>`, `<select>`, `<textarea>`, `<dialog>`, `<table>`, `<progress>`, `<meter>`, `<details>`                                                                                                     |                                                                         1 |
| `<input>`                                                                                                                                                                                             | 1; its `type` names the envUI replacement; `type="hidden"` is not counted |
| ARIA widget roles (`role="button"`, `"dialog"`, `"tab"`, `"menu"`, `"switch"`, `"alert"`, ...) on raw elements, and on envUI elements whose own role differs (`<Text role="alert">` rebuilds `Alert`) |                                                                         1 |
| `<a>` used as a button: `onClick` with no real `href`                                                                                                                                                 |                                                                         1 |
| Other elements with `onClick`, `onMouseDown` or `onPointerDown`, such as a clickable `<div>`                                                                                                          |                                                                         1 |
| `<kbd>`, `<nav>`, `<aside>`, inline `<svg>` icons, and `<a href>` links                                                                                                                               |                                                                       0.5 |

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
- declarations that set one of envUI's private component tokens, such as `--env-card-padding`, in CSS or an inline style: the custom properties the installed `styles.css` declares only in `@layer env.components`. System tokens, declared in `env.tokens` or `env.base`, may be set;
- in inline `style` objects, the same values and bare numbers on length properties (React adds `px` to those);

Part classes (`env-*`) in class names and selectors are not counted: part names are public.

Hand-rolled flex and grid layout has a part of its own: what the ESLint plugin's `no-hand-rolled-layout` rule reports, `display: flex`, `inline-flex`, `grid` or `inline-grid` in an inline style, also through a `const` of the same file. Plain CSS in a style sheet is not counted there, but its containers are checked in the browser step.

### Reported but not scored: docs lookups

The transcript tells whether the agent read envUI's own material. "Read envUI docs" means at least one tool call read or searched Markdown in the installed package: `docs/`, `skills/` or `README.md`. Listing the folder doesn't count. Lookups in the type declarations and anywhere in the package are counted separately in `agentReport.envuiLookups`. An AGENTS.md index or an MCP server should raise these numbers before it raises the score.

### Saved results

`bench/results/<run-id>/` is committed, so it names no local user or folder: paths inside the run directory are stored relative to it, the user profile becomes `~`, and the tarball is stored by file name. An agent's final message is cut to a short excerpt; the full one is in `_logs/<run>/last-message.txt`, with the transcripts, which stay in the workdir.

### Limits

- **Behaviour isn't checked.** The browser step renders the app and measures its layout, but doesn't click or type. A capability built with the right component but wired wrongly still counts as covered.
- **Rendered checks find elements by their text.** A capability described by what renders anchors on texts the prompt names, such as a destination's label; a result that renames them, or puts a label only in a tooltip, fails the check.
- **Coverage is by export name.** Using envUI's `Button` for a toggle covers "toggle button" even if `AppShell` would have provided it. That is why the sidebar task lists only `AppShell` for the toggle.
- **The basic fixture has little headroom.** It is small, already uses envUI, and envUI is the only UI package installed. Agents that look in `node_modules` find the shipped docs and skills there. In its baseline, Claude Code with Opus 5.5 at high effort scored 100 on every task. Judge a condition on the `hard` fixture (that baseline: Claude Code 92.6, Codex 50.5), on Haiku and Opus at low effort, on the layout tasks and on the docs-lookup numbers.
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

- **AGENTS.md index.** `setup` runs `npx --no envui agents` in the workspace, or appends the generated block between the `BEGIN/END envui` markers.
- **MCP server.**
  - `setup` writes `.mcp.json`.
  - For Claude Code, `agentArgs` returns `['--mcp-config', join(appDir, '.mcp.json')]`, because `--strict-mcp-config` ignores other sources.
- **ESLint plugin.** `setup` adds the plugin and an `eslint.config.js`, and adds `npm run lint` to the AGENTS.md commands. If the plugin isn't published yet, the fixture's `package.json` gets it as a `file:` tarball before install. That changes the template hash, so the template is reinstalled automatically.

Run several conditions in one go with `--condition baseline,agents-md`. Workspaces are then named `<condition>-<agent>-<task>`.

## Adding a task

Add an entry to `tasks.json` with:

- an `id`;
- a `title`;
- a `prompt` that doesn't name envUI components;
- `capabilities`, each with the envUI exports that provide it (`envui`), or with checks of what renders (`rendered`) when the task is about arrangement rather than a component.

Rendered checks are measured by the browser step at their widths (`at`, all four by default), loaded or while loading (`state: "loading"`). An anchor is a visible element that holds a text (`text`), case-insensitively, or has it as its `aria-label`; with `within`, the nearest element around it matching that selector, and with `up`, that many levels above, such as `{ "text": "Quarterly report", "within": "h1, h2, h3, h4, h5, h6, [role=heading]", "up": 1 }` for the pane that holds the selected project's heading.

| Check       | Passes when                                                                                        |
| ----------- | -------------------------------------------------------------------------------------------------- |
| `visible`   | every `text` has a visible anchor                                                                  |
| `relation`  | anchor `a` is `left-of`, `right-of`, `above`, `below` or `beside` anchor `b`                       |
| `exclusive` | exactly one of the `anchors` is visible, as when one pane shows at a time                          |
| `columns`   | the anchors of `text` sit in at least `min` and at most `max` columns, counted by their left edges |
| `size`      | the anchor's width is within `minWidth` and `maxWidth`, in rem                                     |
| `centered`  | the anchor's margins to the window's edges differ by at most `tolerance` rem (1.5 by default)      |
| `busy`      | something visible is `aria-busy="true"`                                                            |

A task that waits for an envUI API that doesn't exist yet has `pending`, saying what it waits for. `--tasks all` leaves it out; name it in `--tasks` to run it. No task waits now: `card-skeletons` and `loading-skeletons` check the skeleton API, `skeleton` on Card and Surface and `placeholders()`. The scorer sees a prop on a component imported by name, not on a namespace's part such as `List.Item`, so a list's skeleton counts through `placeholders()`. `activity-loading` needs only `LoadingState`, which envUI has, and runs.

If the task needs mocked data or an API call, add it to `fixtures/basic/src/api.ts` or `fixtures/basic/src/data/`. The hard fixture inherits it. That changes the template hash, and the next run reinstalls the template. Check that the task still makes sense in the hard fixture, whose projects page already has a toolbar (Refresh, Share) and a share modal.

## Cost and time

Baselines on envUI 0.7.0, 2026-10-16, 26 runs each, 4 in parallel, with Claude Code (Opus 5.5 at high effort) and Codex, before the browser step. Exact figures are in `results/2026-10-16-baseline-v2/summary.md` (basic) and `results/2026-10-16-baseline-hard/summary.md` (hard).

| Fixture | Wall-clock time | Agent       | Agent time | Per run     | Cost at list price | Input tokens (cached) | Output tokens |
| ------- | --------------- | ----------- | ---------: | ----------- | -----------------: | --------------------- | ------------: |
| basic   | 10 min          | Claude Code |   19.2 min | 0.6–3.0 min |              $7.55 | 8.8M (8.3M)           |           94k |
|         |                 | Codex       |    9.4 min | 0.4–1.0 min |       not reported | 3.9M (3.5M)           |           39k |
| hard    | 15 min          | Claude Code |   29.5 min | 0.9–5.8 min |              $9.96 | 12.7M (12.1M)         |          133k |
|         |                 | Codex       |    8.3 min | 0.4–0.9 min |       not reported | 2.2M (2.0M)           |           40k |

- The hard baseline's wall-clock time includes a resume: a run stopped the runner after 12 minutes, and three runs were done again. The table counts only the runs in the results.
- Installing a template takes 30–40 s, once per tarball and fixture. Copying a workspace takes about 15 s per run.
- No run came near the 12-minute timeout.
- Claude Code reports a list-price cost per run. On a subscription this is an estimate, not a charge. Codex reported tokens only.
- The browser step adds about 4–6 s per run.
- Every condition repeats the full matrix. Run single tasks (`--tasks sidebar`) while developing a condition.
