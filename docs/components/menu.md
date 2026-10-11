# Menus

## React usage

```tsx
import { Menu, MenuHeader, MenuItem, MenuSeparator, Avatar, Text } from '@envsemble/envui';
import { ManageAccounts } from '@envsemble/envui/icons/ManageAccounts';
import { Logout } from '@envsemble/envui/icons/Logout';

<Menu
  aria-label="Account"
  trigger={
    <button type="button" aria-label="Open account menu">
      <Avatar name="Alex Morgan" src={pictureUrl} size="small" />
    </button>
  }
>
  <MenuHeader>
    <Text>Alex Morgan</Text>
  </MenuHeader>
  <MenuItem href="/account" icon={<ManageAccounts />}>
    Account settings
  </MenuItem>
  <MenuSeparator />
  <MenuItem icon={<Logout />} onClick={signOut}>
    Sign out
  </MenuItem>
</Menu>;
```

### Props & contracts

| Name                     | Contract                                                           |
| ------------------------ | ------------------------------------------------------------------ |
| trigger                  | The opening control; it receives the menu button semantics and ref |
| aria-label               | Required accessible name of the menu                               |
| side / align             | Placement relative to the trigger; bottom and end by default       |
| open / onOpenChange      | Optional controlled visibility                                     |
| MenuHeader               | Non-interactive context, such as the signed-in account             |
| MenuItem href            | A destination, rendered through the LinkProvider link              |
| MenuItem onClick         | An action; the menu closes after it runs                           |
| MenuItem icon / disabled | Optional leading icon and unavailable state                        |
| MenuSeparator            | Splits items into groups; each group keeps large outer corners     |

### Organization menu

Every product shows the active organization in the application shell's context area with the same menu.

```tsx
import { AppShell, OrganizationMenu } from '@envsemble/envui';

<AppShell
  context={
    <OrganizationMenu
      organizations={organizations}
      currentOrganizationId={activeOrganization?.id ?? null}
      onSelect={(organizationId) => switchOrganization(organizationId)}
      onCreate={openCreateOrganizationDialog}
    />
  }
  {...shellProps}
/>;
```

| Name                  | Contract                                                                             |
| --------------------- | ------------------------------------------------------------------------------------ |
| organizations         | The person's organizations as `{ id, name }`, in display order                       |
| currentOrganizationId | The active organization, or null; the trigger then shows the placeholder             |
| onSelect              | Called with another organization's id; the application switches and shows progress   |
| onCreate              | Optional; adds the create action, which is the only control without any organization |
| heading / createLabel | Menu heading (Organizations) and create label (Create organization)                  |
| placeholder           | Trigger text without an active organization (Choose organization)                    |
| disabled              | Prevents opening, for example while a switch is in progress                          |

## Guidelines

- Use a menu for a short list of actions or destinations behind one trigger. Use Select to choose a value and Tabs to switch views.
- Arrow keys move between items, typing jumps to a matching item, Enter or Space activates, and Escape closes and returns focus to the trigger.
- The menu is a pane of grouped rows. Keep labels short; one icon per item at most.
- Organizations are radio items: the active one is checked, and choosing it again does nothing.

TypeScript declarations provide the complete public API.

## Related topics

- [Navigation items](../components/navigation.md)
- [Tooltips](../components/tooltip.md)
- [Avatars](../components/avatar.md)
- [Application shell](../components/app-shell.md)
