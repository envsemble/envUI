# For agents

Coding agents use envUI the way people do, so the package carries what they need to find the right component instead of writing their own: an index for the project's `AGENTS.md`, an MCP server, a manifest of the whole library, `llms.txt` and three skills. Everything is generated from the same sources as these pages and describes the installed version only.

The rule they all carry: **search envUI before writing any UI element; propose an envUI addition instead of a local copy.**

## What the package ships

| Path in `node_modules/@envsemble/envui/` | What it holds                                                                                                                                                          |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/`                                  | These pages, with examples and props filled in; `docs/index.md` lists them.                                                                                            |
| `docs/examples/<page>/<Name>.tsx`        | Every example as a file an application can copy.                                                                                                                       |
| `manifest.json`                          | The library as data: every component with its summary, aliases, when to use it and what instead, exports, props, examples and parts.                                   |
| `llms.txt`                               | The index of the documentation in the [llms.txt](https://llmstxt.org) format.                                                                                          |
| `llms-full.txt`                          | Every page in one file, about 1 MB, for tools that split it into chunks or index it. Too large for an agent to read whole: read `docs/index.md` and the pages instead. |
| `bin/envui.mjs`                          | The `envui` command: `envui agents` and `envui mcp`.                                                                                                                   |
| `skills/`                                | The envui-use, envui-migrate and envui-contribute skills.                                                                                                              |
| `docs/generated/props.json`              | The props of every export, from the TypeScript declarations.                                                                                                           |

`npx --no -- envui --version` prints the installed version; without the `--`, npx takes `--version` for itself.

## Add the index to AGENTS.md

```sh
npx --no envui agents
```

`--no`, here and in every command that starts envui through npx, stops it from fetching an unrelated package called `envui` from the public registry when envUI isn't installed in the folder; in CI and without a terminal, npx would otherwise install it without asking.

It writes a compressed index of envUI, under 8 KB, into `AGENTS.md` in the current folder, between `<!-- BEGIN envui -->` and `<!-- END envui -->`. The index carries the rule above, where the docs are, the entry points, every component page with its exports and the names people search for, and the pattern, template and foundation pages; where there are templates, it says their sources are in `docs/examples/<template>/<Name>.tsx`, to copy and edit. Agents read `AGENTS.md` at the start of every task, so they see it without a tool call.

- It keeps the rest of the file, replaces an earlier index and creates the file when it is missing. Running it again changes nothing.
- The paths in it lead from the file's folder to the installed package, also when a workspace installs it in a folder above, such as `../../node_modules/@envsemble/envui/docs/`.
- `npx --no envui agents --check` changes nothing and exits with 1 when the index is missing or doesn't match the installed version. Add it to CI, and run `npx --no envui agents` again after upgrading envUI.
- `--file CLAUDE.md` writes the index to another file. Claude Code also reads `AGENTS.md` when `CLAUDE.md` imports it with a line `@AGENTS.md`.
- `--print` prints the index instead.

## Register the MCP server

`envui mcp` starts a Model Context Protocol server over stdio. It reads the installed `manifest.json` and `docs/`, so it always matches the project's version, and needs no network. Register it per project, with Node and the path of the installed bin, which starts the same way on every platform and in every client:

```sh
# Claude Code: writes .mcp.json, which the team shares.
claude mcp add --scope project envui -- node node_modules/@envsemble/envui/bin/envui.mjs mcp

# Codex, started from the project folder
codex mcp add envui -- node node_modules/@envsemble/envui/bin/envui.mjs mcp
```

Or in Codex's `config.toml`:

```toml
[mcp_servers.envui]
command = "node"
args = ["node_modules/@envsemble/envui/bin/envui.mjs", "mcp"]
```

The server starts in the folder the client works in. Where a workspace installs envUI in a folder above, give the path to it, such as `../../node_modules/@envsemble/envui/bin/envui.mjs`, or use `npx --no envui mcp`, which finds it: `--no` stops npx from fetching an unrelated package called `envui` from the public registry when envUI isn't installed, since a client starts the server without asking. Windows clients can't start `npx` directly; there it is `cmd /c npx --no envui mcp`.

| Tool              | What it answers                                                                                                                                                 |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `plan`            | A description of a screen or feature → candidates for each part with the words that matched, patterns, tokens, gaps and ignored words.                          |
| `search`          | Components, exports without a page of their own, patterns, foundations, guides and tokens by what they do or what people call them, ranked.                     |
| `list_components` | Every component page with its exports, import path, status and summary, optionally by category or status.                                                       |
| `get_component`   | A component or export by name, part or alias: when to use it, what to use instead, exports, examples, parts, related pages and, with `docs`, its page.          |
| `get_props`       | The props of an export or part, with types, defaults and descriptions, or a function's signature.                                                               |
| `get_example`     | The examples of a component or pattern, or the source of one.                                                                                                   |
| `list_patterns`   | The patterns, with their intent, status and what they compose, optionally of one `intent`.                                                                      |
| `get_pattern`     | A pattern by name, title or alias: when to use it, what to use or read instead, what it composes, its examples and, with `docs`, its page.                      |
| `get_tokens`      | Tokens by words, name prefix or type, with their custom property and values per theme and scale; with `legacy`, the 0.7 names and the tokens that replace them. |

`plan` and `search` rank by plain term matching over names, aliases, summaries and when-to-use text; no model is involved. So `plan` proposes candidates, not an answer: each comes with the words that matched and the part it answers, to confirm with `get_component` and `get_props`, and it gives no list of imports to paste. Words it reads as content, such as quoted labels, code or capitalized names envUI has no component for, come back under `ignored`. `plan` reads each part of a description in the context of the whole: a part that a component already chosen also matches, such as the toggle of "a collapsible sidebar with a toggle", stays with it. Words such as page, screen, view and flow name structure, which templates and patterns answer. A part that nothing matches comes back under `uncovered`.

A name an agent passes to `get_example` resolves in a fixed order: a pattern's own name or title first, then a component by name, export or alias, then a pattern by alias. A name always wins over an alias, so `get_example loading` gives the Loading pattern's examples even where a component lists loading as an alias; ask for that component by its own name, such as `Spinner`. `get_pattern` adds `requested` when they found the page by an alias, so the agent sees which page answered.

## The manifest

`manifest.json` has `schemaVersion` 1. Its paths are relative to the package root.

- `package`, `version` and `rule`; `files`, the other agent files; `imports`, the entry points, the stylesheet and the icon path.
- `categories`, the component groups in the order of the index, and `intents`, the groups of the patterns: what people are doing.
- `components`: one entry per component page, with `name`, `page`, `doc`, `category`, `status`, `since`, `summary`, `aliases`, `useWhen`, `avoidWhen` (each `{ text, use }` or `{ text, see }`, `use` naming the export to use instead and `see` the page to read instead; the page's one list of related components and pages), `related`, the pages its `avoidWhen` names, the names of its `exports` and its `examples`, each with `name`, `title`, `description` and `file`, its source in `docs/examples/`, `usedIn`, the `patterns` and `templates` that compose its exports, and its `parts`, described below.
- `patterns`: one entry per pattern page, with `name`, `title`, `intent`, `status`, `since`, `summary`, `aliases`, `useWhen`, `avoidWhen` (each `{ text, use }` or `{ text, see }`, `see` naming the page to read instead), `composes`, the exports it combines, `related`, the pages its `avoidWhen` names, `doc` and its `examples`.
- `guides` and `foundations`: the other pages, with `name`, `title`, `summary`, `doc`, the exports they document and the pages they link to.
- `exports`: every runtime export by name, with its `kind` (component, namespace or function), `import`, `description`, the `page` and `doc` that document it, the `aliases` its page gives it when it has no component page of its own, and for a component its `props` and `native`, the elements whose native props it also accepts; a namespace lists its `parts`, which are exports too, such as `Menu.Item`, and a function its `signature`.
- `tokens`: `usage`, how to use them and what is public; `themes`, `scales`, the current tokens in `items` (`id`, `cssVariable`, `type`, `description`, a `value` or `values` per theme, and the compact value under `compact`) and, in `legacy`, each 0.7 name with its `type` and the token to `use` instead.

## Parts

A component's part classes (`env-<component>-<part>`) and state attributes (`data-*`) are public and versioned: an application's CSS may target them, and a release that renames or removes one is a major release with a migration note. Component tokens, the custom properties a component declares for itself such as `--env-card-padding`, are private and may change in any release; applications rely on the system tokens and the part names. `docs/generated/parts.json` holds the contract, and each component's `parts` in the manifest holds its share, keyed by export:

- `root`: the class on the component's outermost element, or `null` when it renders none of its own.
- `parts`: every part class of its own, each with `class` and a one-line `description`, the root first. A root that belongs to another component or shared group, such as ConfirmDialog's `env-dialog-popup`, is listed there and not here.
- `states`: each state attribute with the `values` it takes (`""` is an attribute set without a value; an empty list, one that takes any value or is selected by its presence alone) and the `parts` it is set on.
- Anatomy several components render, such as the row of menu, select and combobox options, is listed under its own name with `shared: true`.

`get_component` returns the same `parts`.

## Skills

The package ships three short skills under `skills/`. They lean on the MCP tools and fall back on the manifest and these pages.

- **envui-use**: build or change UI with envUI, looking up every element first.
- **envui-migrate**: move an application onto envUI, or from 0.x to 1.0, keeping its behavior.
- **envui-contribute**: when envUI lacks something, propose the addition upstream instead of a local copy.

Copy the three folders together from `node_modules/@envsemble/envui/skills` into the project: Codex reads `.agents/skills`, Claude Code `.claude/skills`. Keep them at the installed version, or [install the plugin](#install-the-skills-and-the-server-as-a-plugin), which brings the skills and the server together. Installing the package registers nothing by itself.

## Install the skills and the server as a plugin

The skills and the MCP server also reach agents as one plugin, `envui`, for Claude Code and Codex. The envUI repository is its private marketplace, also named `envui`, so the plugin is `envui@envui`. Install it once per machine:

```sh
# Claude Code
claude plugin marketplace add envsemble/envUI#main
claude plugin install envui@envui

# Codex
codex plugin marketplace add envsemble/envUI --ref main
codex plugin add envui@envui
```

- Both clients clone the repository with the Git credentials the machine already holds, an SSH key loaded in an agent or a stored HTTPS credential such as the one `gh auth login` and `gh auth setup-git` leave, and never prompt for them.
- The commands follow `main`, which holds the released versions, so the plugin matches the envUI that applications install. To try unreleased work, add the marketplace without the branch, `envsemble/envUI` in both clients, which follows the default branch, `dev`.
- The plugin's server is `node node_modules/@envsemble/envui/bin/envui.mjs mcp`, as in [Register the MCP server](#register-the-mcp-server). It starts in the folder the client works in, so it answers from the project's installed envUI and needs envUI installed there. Where a workspace installs envUI in a folder above, register the server per project instead.
- The plugin takes the place of the registered server and the copied skills; use one or the other. Its skills are those of the plugin's version and look everything up in the installed package, so their answers match the project's version.

Start a new session after installing or updating.

### How a release updates the plugin

The repository holds the marketplace. `.claude-plugin/marketplace.json` (Claude Code) and `.agents/plugins/marketplace.json` (Codex) list the plugin in `plugin/`:

- `.claude-plugin/plugin.json` and `.codex-plugin/plugin.json`: the name `envui` and the version of `@envsemble/envui`; the Codex manifest also points at `./skills/` and `./.mcp.json`;
- `.mcp.json`: the server;
- `skills/`: a copy of `.agents/skills`, which stays the skills' one source.

A client installs a copy of `plugin/` alone, and a plugin's manifest can't point outside its folder, so the plugin carries its own copy of the skills. `npm run plugin:generate` (`scripts/GeneratePlugin.mjs`) copies `.agents/skills` into `plugin/skills` and sets both manifests' version to that of `@envsemble/envui`. After editing a skill, run it and commit `plugin/` with the change: `npm run check`, `npm test` and `npm run docs:check` fail while the copy or the version is stale.

`npm run changeset:version` runs it too, so preparing a release raises the plugin's version with the packages', and the Release workflow refuses a tag whose plugin version differs. Clients keep their cached copy until the version changes, so a skill edited between releases reaches people with the next release. Once the release is merged into `main`:

- Claude Code updates it in the background when auto-update is on for the marketplace (`/plugin`, Marketplaces); otherwise `claude plugin update envui@envui`.
- Codex: `codex plugin marketplace upgrade envui`, then `codex plugin add envui@envui` again.

## Lint feedback

[`@envsemble/eslint-plugin-envui`](https://github.com/envsemble/envUI/tree/main/packages/eslint-plugin) and `@envsemble/stylelint-config-envui` report hand-built controls and raw colors, naming the envUI component or token to use. Agents see their messages in the usual edit-and-check loop, even when they skipped the docs.
