---
'@envsemble/envui': major
'@envsemble/eslint-plugin-envui': major
'@envsemble/stylelint-config-envui': major
---

Part names are public; component tokens are private.

- **Part classes and state attributes are public and versioned.** Every part of a component has a class, `env-<component>-<part>`, such as `.env-card-header`, and a component shows its state in `data-*` attributes, such as `[data-tone='danger']`. An application's CSS may target them, and from now on a release that renames or removes one is a major release with a migration note. `docs/generated/parts.json` lists every component's root class, its parts with what each one is, and its state attributes with their values; the manifest gives each component page its `parts`, the MCP server's `get_component` returns them, and llms.txt names each component's root classes.
- **Component tokens are private.** The custom properties a component declares for itself, such as `--env-card-padding` or `--env-badge-fill`, may change in any release. Set the system tokens, such as `--env-space-4` or `--env-color-bg-muted`, instead.
- **The `no-private-classes` rules are removed** from the ESLint plugin (`envui/no-private-classes`) and the Stylelint config (`envui/no-private-classes`), since the classes they reported are public now. To migrate, delete the rule from any configuration or disable comment that names it: ESLint and Stylelint report a rule they don't know.

Migration guide: [Part names and component tokens](https://github.com/envsemble/envUI/blob/main/docs/migration.md).
