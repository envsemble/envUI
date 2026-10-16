---
name: envui-migrate
description: Move an existing React application, or part of it, onto @envsemble/envui, or upgrade it between envUI versions, while keeping its behavior. Maps local components to envUI through the manifest and the envui MCP tools.
---

# Migrate an interface to envUI

Use [envui-use](../envui-use/SKILL.md) to locate the installed version and look components up. Read `docs/migration.md` for the workflow; it also lists every 0.x name that 1.0 renamed.

1. **Inventory.** Confirm the scope. List the UI the scope owns: local components, wrappers, vendor widgets, CSS entry points, theme setup, forms and their state. Note the user journeys to keep working.
2. **Map.** For each local component, `search` its name and its role, such as "status pill" or "modal": aliases include earlier envUI names and common names, so a match is likely. Read the match's `avoidWhen` before accepting it. Record the mapping for a broad migration: local owner → envUI composition → behavior to keep → gap.
3. **Upgrade from 0.x.** Run `@envsemble/envui-codemods` (`v1-names`, then `v1-classes`), then type-check. `get_tokens` with `legacy: true`, or `tokens.legacy` in `manifest.json`, maps each 0.7 custom property to its successor.
4. **Migrate a slice.** Move one representative screen end to end, then expand through its callers. Keep routes, native form behavior, controlled state, focus and data contracts. Keep vendor dependencies until their last consumer is checked.
5. **Remove the copies.** Delete local components once their callers use envUI; a gap that remains goes to [envui-contribute](../envui-contribute/SKILL.md) rather than staying a local copy. Run `npx --no envui agents` so AGENTS.md carries the index.
6. **Check.** Run the application's checks and the affected journeys. Confirm the manifest and lockfile pin the agreed version. Report migrated areas, retained dependencies and gaps.

Read `docs/local-development.md` only for authorized co-development with an envUI checkout. Stored rich content needs compatibility checks when its editor or serializer changes.
