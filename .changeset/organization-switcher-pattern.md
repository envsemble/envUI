---
'@envsemble/envui': major
'@envsemble/envui-codemods': major
'@envsemble/eslint-plugin-envui': patch
---

OrganizationSwitcher is a pattern now, not a component: it is a Menu that lists the organizations, which applications arrange as they need.

- OrganizationSwitcher, `OrganizationSwitcherProps`, `OrganizationSwitcherItem` and `messages.organizationSwitcher` are gone. The organization switcher pattern, `docs/patterns/organization-switcher.md`, builds it from a Menu.Root whose trigger is a secondary Button that names the active organization, a Menu.RadioGroup of Menu.RadioItems with the person's role as each `description`, and a Menu.Item that creates one; before the first organization, the create action is a Button of its own. The Menu page links to it.
- The part classes `env-organization-switcher`, its `-trigger`, `-trigger-label`, `-header`, `-heading`, `-options`, `-option`, `-description` and `-create` go: the pattern's rows are Menu's own.
- `v1-names` reports OrganizationSwitcher, and 0.x's OrganizationMenu and their types, where they are used, and `v1-classes` the `env-organization-switcher-*` and `env-organization-menu-*` classes; no codemod rewrites them, and `v1-props` no longer renames OrganizationSwitcher's props. `envui/no-renamed-exports` reports OrganizationMenu with the pattern to use instead.

Migration guide: [Folded components and patterns](https://github.com/envsemble/envUI/blob/main/docs/migration.md#folded-components-and-patterns).
