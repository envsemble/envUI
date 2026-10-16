---
name: envui-use
description: Build or modify React interfaces with @envsemble/envui, choosing public components and consulting only the documentation relevant to the task.
---

# Build with envUI

1. Locate `@envsemble/envui` in the application's manifest and lockfile. Inspect its installed package, exports and declarations; use documentation matching that version. For authorized work inside envUI, use the checkout's public API and root `docs/`.
2. Find documentation under `node_modules/@envsemble/envui/docs/`, resolving the actual package location for the application's package manager. Start with `docs/index.md`: it contains only topic names, short purposes and paths. Select pages for the requested interface and read only those pages. Follow related links when the task needs that behavior; do not read the complete documentation directory by default.
3. Read `docs/setup.md` when connecting the package, styles or theme. Consult relevant component pages for examples, behavior and their Props section, which is generated from the declarations; check declarations for anything else. Import public entries and keep routing, data, authorization, validation and persistence in the application.
4. Compose public components before introducing wrappers or new primitives. For a missing shared capability, consult `docs/foundations/composition.md`; read `docs/library-development.md` only when changes to envUI are authorized. Use `docs/local-development.md` only for linked co-development.
5. Run the consumer's applicable checks and exercise affected interactions. Report the adopted version and concrete gaps. Update the relevant documentation page as integration reveals issues.

For an existing application's migration, use [envui-migrate](../envui-migrate/SKILL.md). Optional code, Markdown and rich-text documentation is needed only for features using those capabilities.
