---
title: Menu
summary: Actions, destinations and the shared organization switcher, opened from a trigger or a right click.
status: beta
since: 0.3.0
category: Feedback & overlays
aliases:
  - dropdown menu
  - context menu
  - action menu
  - overflow menu
  - kebab menu
  - MenuItem
  - OrganizationMenu
  - organization switcher
  - account menu
related:
  - menubar
  - nav-list
  - tooltip
  - avatar
  - app-shell
components:
  - Menu
  - ContextMenu
  - OrganizationSwitcher
---

# Menu

## React usage

```tsx
import { AvatarButton, Menu, Text } from '@envsemble/envui';
import { ManageAccounts } from '@envsemble/envui/icons/ManageAccounts';
import { Logout } from '@envsemble/envui/icons/Logout';

<Menu.Root
  aria-label="Account"
  trigger={
    <AvatarButton
      name="Alex Morgan"
      detail="alex@example.com"
      src={pictureUrl}
      aria-label="Open account menu"
    />
  }
>
  <Menu.Header>
    <Text>Alex Morgan</Text>
  </Menu.Header>
  <Menu.Item href="/account" icon={<ManageAccounts />}>
    Account settings
  </Menu.Item>
  <Menu.Separator />
  <Menu.Item icon={<Logout />} onClick={signOut}>
    Sign out
  </Menu.Item>
</Menu.Root>;
```

### Props & contracts

| Name                      | Contract                                                           |
| ------------------------- | ------------------------------------------------------------------ |
| trigger                   | The opening control; it receives the menu button semantics and ref |
| aria-label                | Required accessible name of the menu                               |
| side / align              | Placement relative to the trigger; bottom and end by default       |
| open / onOpenChange       | Optional controlled visibility                                     |
| Menu.Header               | Non-interactive context, such as the signed-in account             |
| Menu.Item href            | A destination, rendered through the LinkProvider link              |
| Menu.Item onClick         | An action; the menu closes after it runs                           |
| Menu.Item icon / disabled | Optional leading icon and unavailable state                        |
| Menu.Separator            | Splits items into groups; each group keeps large outer corners     |
| density                   | compact: the desktop dropdown for dense surfaces; see below        |

### Groups, choices and shortcuts

```tsx
import { Button, Menu } from '@envsemble/envui';
import { Search } from '@envsemble/envui/icons/Search';

<Menu.Root aria-label="View options" trigger={<Button variant="secondary">View options</Button>}>
  <Menu.RadioGroup label="Sort by" value={sort} onValueChange={setSort}>
    <Menu.RadioItem value="name">Name</Menu.RadioItem>
    <Menu.RadioItem value="date" description="Most recently changed first">
      Date changed
    </Menu.RadioItem>
  </Menu.RadioGroup>
  <Menu.Group label="Display">
    <Menu.CheckboxItem checked={showArchived} onCheckedChange={setShowArchived}>
      Show archived plans
    </Menu.CheckboxItem>
    <Menu.Item icon={<Search />} shortcut="Ctrl+P" onClick={openQuickOpen}>
      Quick open
    </Menu.Item>
  </Menu.Group>
</Menu.Root>;
```

| Name                                        | Contract                                                                                                       |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Menu.Item description                       | A second, muted line; announced as the item’s description                                                      |
| Menu.Item shortcut                          | Key hint at the end, such as <kbd>Ctrl</kbd>+<kbd>P</kbd>, also exposed as aria-keyshortcuts; the app binds it |
| Menu.Item trailing                          | End content such as a Badge or CounterBadge                                                                    |
| Menu.Group label                            | A labelled group with a small heading; its rows keep large outer corners                                       |
| Menu.RadioGroup value / onValueChange       | One checked choice among its Menu.RadioItems; optional label like Menu.Group                                   |
| Menu.RadioItem value / description / icon   | A choice with a check mark while checked; closeOnClick is true by default                                      |
| Menu.CheckboxItem checked / onCheckedChange | An on/off option with a check mark; the menu stays open unless closeOnClick is set                             |

### Compact menus and submenus

```tsx
import { Button, Menu } from '@envsemble/envui';
import { History } from '@envsemble/envui/icons/History';

<Menu.Root
  aria-label="Document"
  density="compact"
  align="start"
  trigger={<Button variant="secondary">Document</Button>}
>
  <Menu.Item shortcut="Ctrl+N" onClick={createDocument}>
    New document
  </Menu.Item>
  <Menu.Submenu
    label="Open recent"
    icon={<History />}
    onOpenChange={(open) => {
      if (open) loadRecentDocuments();
    }}
  >
    {recentDocuments.map((document) => (
      <Menu.Item key={document.id} onClick={() => openDocument(document.id)}>
        {document.name}
      </Menu.Item>
    ))}
    <Menu.Separator />
    <Menu.Item onClick={clearRecentDocuments}>Clear recent</Menu.Item>
  </Menu.Submenu>
  <Menu.Separator />
  <Menu.Submenu label="Theme">
    <Menu.RadioGroup value={theme} onValueChange={setTheme}>
      <Menu.RadioItem value="light">Light</Menu.RadioItem>
      <Menu.RadioItem value="dark">Dark</Menu.RadioItem>
      <Menu.RadioItem value="system">System</Menu.RadioItem>
    </Menu.RadioGroup>
  </Menu.Submenu>
</Menu.Root>;
```

| Name                                           | Contract                                                                                                                                  |
| ---------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| density="compact"                              | The desktop dropdown: the raised popup of Popover and Select with 1.75 rem rows, 16 px icons, shortcuts as small muted keys and hairlines |
| Menu.Submenu label / icon / description        | The row that opens the submenu, with a chevron at its end                                                                                 |
| Menu.Submenu children                          | The submenu's items: any menu part, including further submenus                                                                            |
| Menu.Submenu disabled                          | The row stays in place but cannot open its submenu                                                                                        |
| Menu.Submenu open / defaultOpen / onOpenChange | Optional control; onOpenChange can load the items as the submenu opens                                                                    |
| Menu.Submenu aria-label / className            | Name of the submenu, the label by default when it is text, and the class of its popup                                                     |

### Context menu

```tsx
import { ContextMenu, Menu } from '@envsemble/envui';

<ContextMenu
  aria-label="Document actions"
  content={(target) => {
    const id = target?.closest<HTMLElement>('[data-document-id]')?.dataset.documentId;
    return id ? (
      <>
        <Menu.Item shortcut="F2" onClick={() => rename(id)}>
          Rename
        </Menu.Item>
        <Menu.Separator />
        <Menu.Item onClick={() => remove(id)}>Delete</Menu.Item>
      </>
    ) : (
      <Menu.Item onClick={createDocument}>New document</Menu.Item>
    );
  }}
>
  <ul className="document-list">{rows}</ul>
</ContextMenu>;
```

| Name                              | Contract                                                                                                         |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| children                          | One element that becomes the region; it receives the handlers and ref                                            |
| content                           | Menu parts, or a function of the target: the deepest element under the pointer, or the focused element           |
| aria-label                        | Required accessible name of the menu                                                                             |
| disabled                          | Keep the browser’s own context menu                                                                              |
| open / onOpenChange / anchorPoint | Controlled visibility; anchorPoint `{ x, y }` in viewport pixels opens the menu there, for example from a button |

### Organization switcher

Every product shows the active organization in the application shell's context area with the same menu. Its trigger is a secondary Button with the organization name and up and down arrows; long names truncate.

```tsx
import { AppShell, OrganizationSwitcher } from '@envsemble/envui';

<AppShell
  context={
    <OrganizationSwitcher
      organizations={organizations}
      currentOrganizationId={activeOrganization?.id ?? null}
      onSelect={(organizationId) => switchOrganization(organizationId)}
      onCreate={openCreateOrganizationDialog}
    />
  }
  {...shellProps}
/>;
```

| Name                  | Contract                                                                                                               |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| organizations         | The person's organizations as `{ id, name, detail? }`, in display order; detail is a short muted note such as the role |
| currentOrganizationId | The active organization, or null; the trigger then shows the placeholder                                               |
| onSelect              | Called with another organization's id; the application switches and shows progress                                     |
| onCreate              | Optional; adds the create action, which is the only control without any organization                                   |
| heading / createLabel | Menu heading (Organizations) and create label (Create organization)                                                    |
| placeholder           | Trigger text without an active organization (Choose organization)                                                      |
| disabled              | Prevents opening, for example while a switch is in progress                                                            |

## Guidelines

- Use a menu for a short list of actions or destinations behind one trigger. Use Select to choose a value and Tabs to switch views.
- envUI provides two menus: OrganizationSwitcher, and the account menu composed from AvatarButton, Menu.Header and items. Every other menu is the application's own, built from Menu.Item, Menu.Group, Menu.RadioGroup, Menu.CheckboxItem, Menu.Submenu and Menu.Separator, in standard or compact density.
- Use compact density in dense desktop interfaces, such as a menubar, a compact tree's context menu or a toolbar. The popup is as wide as its content, between 12 and 22 rem, and descriptions wrap. Labels line up across rows: once a row has a check mark or an icon, the others keep its place. On coarse pointers, rows keep the touch height.
- A submenu opens beside its row on hover, after a short delay, and with <kbd>→</kbd>, <kbd>Enter</kbd> or <kbd>Space</kbd>, with focus on its first item; <kbd>←</kbd> and <kbd>Esc</kbd> close it and return to the row. It opens at the inline end, lines its first row up with the row that opened it and flips to the other side near the edge of the window. It takes the density and theme of its menu, and the row stays highlighted while it is open.
- Keep submenus shallow, one level in most menus, for groups of related choices such as recent documents or a theme. Frequent commands belong in the menu itself.
- A context menu opens on right click and long press at the pointer, and with the <kbd>Menu</kbd> key or <kbd>Shift</kbd>+<kbd>F10</kbd> below the focused element. For a widget with aria-activedescendant, such as Tree, the target is its active descendant. Focus returns to where it was when the menu closes.
- A context menu supplements visible controls: offer the same actions elsewhere, for people who cannot right click.
- Shortcut hints show as Kbd keys and describe keys the application already handles; the menu does not bind them. Write arrows as ←, →, ↑ and ↓, such as Alt+←; aria-keyshortcuts names them ArrowLeft, ArrowRight, ArrowUp and ArrowDown.
- <kbd>↑</kbd> and <kbd>↓</kbd> move between items, typing jumps to a matching item, <kbd>Enter</kbd> or <kbd>Space</kbd> activates, and <kbd>Esc</kbd> closes and returns focus to the trigger.
- The menu is a pane of list rows. Keep labels short; one icon per item at most.
- Organizations are radio items: the active one is checked, and choosing it again does nothing.
- Use an organization's detail for a short fact that matters before switching, such as the person's role there.

TypeScript declarations provide the complete public API.

## Related topics

- [Menubar](../components/menubar.md)
- [NavList](../components/nav-list.md)
- [Tooltip](../components/tooltip.md)
- [Avatar](../components/avatar.md)
- [AppShell](../components/app-shell.md)
