---
name: envui-migrate
description: Migrate an existing React application or selected UI area to @envsemble/envui while preserving application behavior and consulting only the affected component documentation.
---

# Migrate an interface to envUI

Use [envui-use](../envui-use/SKILL.md) to locate the selected version's `docs/` and public API. Read `docs/migration.md` for the migration workflow, then choose only affected component pages from `docs/index.md`.

Inspect the requested scope, existing UI owners and representative behavior before mapping components. Preserve routes, native form behavior, controlled state, focus, themes and product data contracts. Migrate a complete representative slice before expanding through callers. Keep vendor dependencies until their remaining consumers have been checked.

Read `docs/local-development.md` only for authorized co-development with an envUI checkout. Stored content requires compatibility checks when changing editors or serializers; consult the relevant content documentation only if that is part of the migration.

Run the application's established checks and affected user journeys. Confirm the final manifest and lockfile use the agreed package version. Report migrated areas, retained dependencies and concrete gaps in the task or PR. Improve the relevant documentation pages from observed integration issues.
