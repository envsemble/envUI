---
'@envsemble/envui': minor
---

Tooling for coding agents, all generated from the documentation and describing the installed version:

- `npx --no envui agents` writes a compressed index of envUI, under 8 KB, into the project's `AGENTS.md` between `<!-- BEGIN envui -->` and `<!-- END envui -->`: the rule to search envUI before writing any UI element and to propose an envUI addition instead of a local copy, where the installed docs are, and every component page with its exports and aliases. It keeps the rest of the file and creates it when missing; `--check` fails in CI when the index is missing or outdated, and `--file` writes to another file.
- `npx --no envui mcp` is an MCP server over stdio with the tools `search`, `list_components`, `get_component`, `get_props`, `get_example`, `list_patterns`, `list_templates`, `get_tokens` and `plan`, which maps a description of a screen to components, patterns, tokens and imports. Any MCP client registers it in the project as `node node_modules/@envsemble/envui/bin/envui.mjs mcp`. It needs nothing beyond Node, so envUI gains no dependency.
- The package root has `manifest.json`, every component with its summary, aliases, when to use it and what instead, exports, import paths, props and examples, plus the other pages and the tokens; `llms.txt`, the index of the documentation; and `llms-full.txt`, every page in one file for tools that index it.
- The skills are rewritten around these: `envui-use` and `envui-migrate` look every element up first, and the new `envui-contribute` covers adding what envUI lacks upstream.

The documentation's new For agents page, `docs/agent-tooling.md`, describes them.
