---
'@envsemble/envui': minor
'@envsemble/eslint-plugin-envui': minor
'@envsemble/stylelint-config-envui': minor
---

The patterns and the migration guide are removed from the docs the package ships and from the website.

Breaking changes:

- `docs/patterns/` and `docs/migration.md` are no longer in the package, and `docs/index.md` no longer lists them. Read a component's page, under `docs/components/`, and copy from its examples in `docs/examples/<page>/`; a page's `avoidWhen` names the component to use instead.
- On the website, the Patterns section and every pattern's page are gone, with the pattern examples. The old addresses of the patterns and of the migration guide open the Docs' home.
- The setup skill no longer says envUI is private, no longer points at patterns or a migration guide, and its AGENTS.md block no longer asks agents to propose an addition to envUI instead of writing a component of their own.
