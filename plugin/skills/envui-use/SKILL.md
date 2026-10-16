---
name: envui-use
description: Build or change React UI in a project that uses @envsemble/envui. Find the envUI component, props and example for every element before writing it, through the envui MCP tools or the installed manifest and docs.
---

# Build with envUI

**Search envUI before writing any UI element; propose an envUI addition instead of a local copy.**

1. **Find the installed version.** Read `@envsemble/envui` in the manifest and lockfile, and locate the package, usually `node_modules/@envsemble/envui/`. Its `manifest.json`, `docs/` and `.d.ts` files describe exactly that version; for authorized work inside envUI, use the checkout's root `docs/` and `docs/generated/manifest.json`.
2. **Plan the screen.** With the `envui` MCP server, call `plan` with the feature in a sentence: it proposes candidates matched on words, not an answer, so confirm each with `get_component`, and `search` in other words for each part it leaves uncovered or ignored. Without the server, search `manifest.json`: every component lists `aliases`, `useWhen`, `avoidWhen` and the names of its exports, and `manifest.exports` gives each export its import path and props. `docs/index.md` lists the pages.
3. **Check each component before using it.** `get_component` gives when to use it and what to use instead; `get_props` gives the exact props; `get_example` gives code to start from. Without the server, read `docs/components/<page>.md` (Props is generated from the declarations) and `docs/examples/<page>/<Name>.tsx`. Use only the exports and props listed; read `avoidWhen` before settling.
4. **Write it.** Import from the public entries the manifest names, and each icon from `@envsemble/envui/icons/<Name>`. `docs/setup.md` covers `styles.css`, `Theme` and router links. Style the application's own layout with tokens (`get_tokens`, or `var(--…)` from `manifest.json`): no raw colors or pixel sizes, and no `.env-*` selectors. Routing, data, validation, authorization and persistence stay in the application.
5. **When envUI lacks it,** compose it from envUI parts as `docs/foundations/composition.md` describes. If it is still missing, don't keep a local copy of a control: follow [envui-contribute](../envui-contribute/SKILL.md) and report the gap.
6. **Check.** Run the project's type check, lint (with `@envsemble/eslint-plugin-envui` where installed) and tests, and exercise changed interactions with the keyboard and in both themes. After upgrading envUI, run `npx --no envui agents` so the AGENTS.md index matches.

To move an existing interface onto envUI, use [envui-migrate](../envui-migrate/SKILL.md).
