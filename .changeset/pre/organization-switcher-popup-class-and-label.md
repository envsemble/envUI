---
'@envsemble/envui': major
---

OrganizationSwitcher passes `className` to its menu popup, as Menu.Root, AccountMenu and ContextMenu do, and names each organization with `label`, as every other item does.

- `className` goes to the popup, beside `env-organization-switcher`, with `style` and `ref`; the new `triggerClassName` styles the trigger, or the create button without organizations, which `className` styled before.
- An `OrganizationSwitcherItem`'s `name` is `label`, also in AccountMenu.OrganizationSubmenu's `items`.

Migrate with the codemods: `envui-codemods v1-props` renames `className` to `triggerClassName`, and an organization's `name` to `label`, and 0.x's `detail` to `description`, in an array written in `items` or 0.x's `organizations`; it reports items it can't read, such as a variable.

Migration guide: [Navigation and collections](https://github.com/envsemble/envUI/blob/main/docs/migration.md).
