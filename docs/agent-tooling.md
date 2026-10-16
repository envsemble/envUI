# For agents

Coding agents use envUI the way people do, so the package carries what they need to find the right component instead of writing their own: an index for the project's `AGENTS.md`, an MCP server, a manifest of the whole library, `llms.txt` and three skills. Everything is generated from the same sources as these pages and describes the installed version only.

The rule they all carry: **search envUI before writing any UI element; propose an envUI addition instead of a local copy.**

## What the package ships

| Path in `node_modules/@envsemble/envui/` | What it holds                                                                                                                                                          |
| ---------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `docs/`                                  | These pages, with examples and props filled in; `docs/index.md` lists them.                                                                                            |
| `docs/examples/<page>/<Name>.tsx`        | Every example as a file an application can copy.                                                                                                                       |
| `manifest.json`                          | The library as data: every component with its summary, aliases, when to use it and what instead, exports, props and examples.                                          |
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

It writes a compressed index of envUI, under 8 KB, into `AGENTS.md` in the current folder, between `<!-- BEGIN envui -->` and `<!-- END envui -->`. The index carries the rule above, where the docs are, the entry points and every component page with its exports and the names people search for. Agents read `AGENTS.md` at the start of every task, so they see it without a tool call.

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
| `plan`            | A description of a screen or feature → the components for each part, matching patterns and templates, tokens, imports and gaps.                                 |
| `search`          | Components, exports without a page of their own, patterns, templates, foundations, guides and tokens by what they do or what people call them, ranked.          |
| `list_components` | Every component page with its exports, import path, status and summary, optionally by category or status.                                                       |
| `get_component`   | A component or export by name, part or alias: when to use it, what to use instead, exports, examples, related pages and, with `docs`, its page.                 |
| `get_props`       | The props of an export or part, with types, defaults and descriptions, or a function's signature.                                                               |
| `get_example`     | A component's examples, or the source of one.                                                                                                                   |
| `list_patterns`   | The patterns.                                                                                                                                                   |
| `list_templates`  | The templates.                                                                                                                                                  |
| `get_tokens`      | Tokens by words, name prefix or type, with their custom property and values per theme and scale; with `legacy`, the 0.7 names and the tokens that replace them. |

`plan` and `search` rank by plain term matching over names, aliases, summaries and when-to-use text; no model is involved. `plan` reads each part of a description in the context of the whole: a part that a component already chosen also matches, such as the toggle of "a collapsible sidebar with a toggle", stays with it. Words such as page, screen, view and flow name structure, which templates and patterns answer. A part that nothing matches comes back under `uncovered`.

## The manifest

`manifest.json` has `schemaVersion` 1. Its paths are relative to the package root.

- `package`, `version` and `rule`; `files`, the other agent files; `imports`, the entry points, the stylesheet and the icon path.
- `categories`, the component groups in the order of the index.
- `components`: one entry per component page, with `name`, `page`, `doc`, `category`, `status`, `since`, `summary`, `aliases`, `useWhen`, `avoidWhen` (each `{ text, use }`, `use` naming the export to use instead), `related` pages, the names of its `exports` and its `examples`, each with `name`, `title`, `description` and `file`, its source in `docs/examples/`.
- `guides`, `foundations`, `patterns` and `templates`: the other pages, with `name`, `title`, `summary`, `doc`, the exports they document and the pages they link to.
- `exports`: every runtime export by name, with its `kind` (component, namespace or function), `import`, `description`, the `page` and `doc` that document it, the `aliases` its page gives it when it has no component page of its own, and for a component its `props` and `native`, the elements whose native props it also accepts; a namespace lists its `parts`, which are exports too, such as `Menu.Item`, and a function its `signature`.
- `tokens`: `themes`, `scales`, the current tokens in `items` (`id`, `cssVariable`, `type`, `description`, a `value` or `values` per theme, and the compact value under `compact`) and, in `legacy`, each 0.7 name with its `type` and the token to `use` instead.

## Skills

The package ships three short skills under `skills/`. They lean on the MCP tools and fall back on the manifest and these pages.

- **envui-use**: build or change UI with envUI, looking up every element first.
- **envui-migrate**: move an application onto envUI, or from 0.x to 1.0, keeping its behavior.
- **envui-contribute**: when envUI lacks something, propose the addition upstream instead of a local copy.

Copy the three folders together from `node_modules/@envsemble/envui/skills` into the project: Codex reads `.agents/skills`, Claude Code `.claude/skills`. Keep them at the installed version. Installing the package registers nothing by itself.

## Publish the skills and the server as a plugin

The skills and the MCP server can also reach agents as one plugin from a private plugin marketplace, for Claude Code and, mirrored, for Codex. Nothing publishes it yet. For each release:

1. In the repository that hosts the marketplace, keep a plugin folder, `envui/`, with:
   - `skills/`: the three folders of `.agents/skills` at the release's tag;
   - `.mcp.json`: `{ "mcpServers": { "envui": { "command": "node", "args": ["node_modules/@envsemble/envui/bin/envui.mjs", "mcp"] } } }`, so the server comes from the project's own installed envUI;
   - `.claude-plugin/plugin.json`: `name` `envui`, `version` the envUI version, a `description` and the `author`;
   - `.codex-plugin/plugin.json`: the same fields, with `"skills": "./skills/"` and `"mcpServers": "./.mcp.json"`.
2. List the plugin in the marketplace's `.claude-plugin/marketplace.json` (`{ "name": "envui", "source": "./envui" }`) and, for Codex, in `.agents/plugins/marketplace.json` (`{ "name": "envui", "source": { "source": "local", "path": "./envui" } }`).
3. Raise the plugin's version with every release, so clients update their cached copy, and merge.
4. People install it once: `claude plugin marketplace add <owner>/<repository>` and `claude plugin install envui@<marketplace>`; in Codex, add the marketplace and `codex plugin add envui@<marketplace>`. `claude plugin update envui@<marketplace>` picks up a release.

## Lint feedback

[`@envsemble/eslint-plugin-envui`](https://github.com/envsemble/envUI/tree/main/packages/eslint-plugin) and `@envsemble/stylelint-config-envui` report hand-built controls, private `.env-*` classes and raw colors, naming the envUI component or token to use. Agents see their messages in the usual edit-and-check loop, even when they skipped the docs.
