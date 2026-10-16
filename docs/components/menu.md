# Menus

## React usage

```tsx
import { AvatarButton, Menu, MenuHeader, MenuItem, MenuSeparator, Text } from '@envsemble/envui';
import { ManageAccounts } from '@envsemble/envui/icons/ManageAccounts';
import { Logout } from '@envsemble/envui/icons/Logout';

<Menu
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
| density                  | compact: the desktop dropdown for dense surfaces; see below        |

### Groups, choices and shortcuts

```tsx
import {
  Button,
  Menu,
  MenuCheckboxItem,
  MenuGroup,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
} from '@envsemble/envui';
import { Search } from '@envsemble/envui/icons/Search';

<Menu aria-label="View options" trigger={<Button variant="secondary">View options</Button>}>
  <MenuRadioGroup label="Sort by" value={sort} onValueChange={setSort}>
    <MenuRadioItem value="name">Name</MenuRadioItem>
    <MenuRadioItem value="date" description="Most recently changed first">
      Date changed
    </MenuRadioItem>
  </MenuRadioGroup>
  <MenuGroup label="Display">
    <MenuCheckboxItem checked={showArchived} onCheckedChange={setShowArchived}>
      Show archived plans
    </MenuCheckboxItem>
    <MenuItem icon={<Search />} shortcut="Ctrl+P" onClick={openQuickOpen}>
      Quick open
    </MenuItem>
  </MenuGroup>
</Menu>;
```

| Name                                       | Contract                                                                                                       |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| MenuItem description                       | A second, muted line; announced as the item’s description                                                      |
| MenuItem shortcut                          | Key hint at the end, such as <kbd>Ctrl</kbd>+<kbd>P</kbd>, also exposed as aria-keyshortcuts; the app binds it |
| MenuItem trailing                          | End content such as a Badge or CounterBadge                                                                    |
| MenuGroup label                            | A labelled group with a small heading; its rows keep large outer corners                                       |
| MenuRadioGroup value / onValueChange       | One checked choice among its MenuRadioItems; optional label like MenuGroup                                     |
| MenuRadioItem value / description / icon   | A choice with a check mark while checked; closeOnClick is true by default                                      |
| MenuCheckboxItem checked / onCheckedChange | An on/off option with a check mark; the menu stays open unless closeOnClick is set                             |

### Compact menus and submenus

```tsx
import {
  Button,
  Menu,
  MenuItem,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSubmenu,
} from '@envsemble/envui';
import { History } from '@envsemble/envui/icons/History';

<Menu
  aria-label="Document"
  density="compact"
  align="start"
  trigger={<Button variant="secondary">Document</Button>}
>
  <MenuItem shortcut="Ctrl+N" onClick={createDocument}>
    New document
  </MenuItem>
  <MenuSubmenu
    label="Open recent"
    icon={<History />}
    onOpenChange={(open) => {
      if (open) loadRecentDocuments();
    }}
  >
    {recentDocuments.map((document) => (
      <MenuItem key={document.id} onClick={() => openDocument(document.id)}>
        {document.name}
      </MenuItem>
    ))}
    <MenuSeparator />
    <MenuItem onClick={clearRecentDocuments}>Clear recent</MenuItem>
  </MenuSubmenu>
  <MenuSeparator />
  <MenuSubmenu label="Theme">
    <MenuRadioGroup value={theme} onValueChange={setTheme}>
      <MenuRadioItem value="light">Light</MenuRadioItem>
      <MenuRadioItem value="dark">Dark</MenuRadioItem>
      <MenuRadioItem value="system">System</MenuRadioItem>
    </MenuRadioGroup>
  </MenuSubmenu>
</Menu>;
```

| Name                                          | Contract                                                                                                                                  |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| density="compact"                             | The desktop dropdown: the raised popup of Popover and Select with 1.75 rem rows, 16 px icons, shortcuts as small muted keys and hairlines |
| MenuSubmenu label / icon / description        | The row that opens the submenu, with a chevron at its end                                                                                 |
| MenuSubmenu children                          | The submenu's items: any menu part, including further submenus                                                                            |
| MenuSubmenu disabled                          | The row stays in place but cannot open its submenu                                                                                        |
| MenuSubmenu open / defaultOpen / onOpenChange | Optional control; onOpenChange can load the items as the submenu opens                                                                    |
| MenuSubmenu aria-label / className            | Name of the submenu, the label by default when it is text, and the class of its popup                                                     |

### Context menu

```tsx
import { ContextMenu, MenuItem, MenuSeparator } from '@envsemble/envui';

<ContextMenu
  aria-label="Document actions"
  content={(target) => {
    const id = target?.closest<HTMLElement>('[data-document-id]')?.dataset.documentId;
    return id ? (
      <>
        <MenuItem shortcut="F2" onClick={() => rename(id)}>
          Rename
        </MenuItem>
        <MenuSeparator />
        <MenuItem onClick={() => remove(id)}>Delete</MenuItem>
      </>
    ) : (
      <MenuItem onClick={createDocument}>New document</MenuItem>
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

### Organization menu

Every product shows the active organization in the application shell's context area with the same menu. Its trigger is a secondary Button with the organization name and up and down arrows; long names truncate.

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
- envUI provides two menus: OrganizationMenu, and the account menu composed from AvatarButton, MenuHeader and items. Every other menu is the application's own, built from MenuItem, MenuGroup, MenuRadioGroup, MenuCheckboxItem, MenuSubmenu and MenuSeparator, in standard or compact density.
- Use compact density in dense desktop interfaces, such as a menubar, a compact tree's context menu or a toolbar. The popup is as wide as its content, between 12 and 22 rem, and descriptions wrap. Labels line up across rows: once a row has a check mark or an icon, the others keep its place. On coarse pointers, rows keep the touch height.
- A submenu opens beside its row on hover, after a short delay, and with <kbd>→</kbd>, <kbd>Enter</kbd> or <kbd>Space</kbd>, with focus on its first item; <kbd>←</kbd> and <kbd>Esc</kbd> close it and return to the row. It opens at the inline end, lines its first row up with the row that opened it and flips to the other side near the edge of the window. It takes the density and theme of its menu, and the row stays highlighted while it is open.
- Keep submenus shallow, one level in most menus, for groups of related choices such as recent documents or a theme. Frequent commands belong in the menu itself.
- A context menu opens on right click and long press at the pointer, and with the <kbd>Menu</kbd> key or <kbd>Shift</kbd>+<kbd>F10</kbd> below the focused element. For a widget with aria-activedescendant, such as Tree, the target is its active descendant. Focus returns to where it was when the menu closes.
- A context menu supplements visible controls: offer the same actions elsewhere, for people who cannot right click.
- Shortcut hints show as Kbd keys and describe keys the application already handles; the menu does not bind them. Write arrows as ←, →, ↑ and ↓, such as Alt+←; aria-keyshortcuts names them ArrowLeft, ArrowRight, ArrowUp and ArrowDown.
- <kbd>↑</kbd> and <kbd>↓</kbd> move between items, typing jumps to a matching item, <kbd>Enter</kbd> or <kbd>Space</kbd> activates, and <kbd>Esc</kbd> closes and returns focus to the trigger.
- The menu is a pane of grouped rows. Keep labels short; one icon per item at most.
- Organizations are radio items: the active one is checked, and choosing it again does nothing.
- Use an organization's detail for a short fact that matters before switching, such as the person's role there.

TypeScript declarations provide the complete public API.

## Related topics

- [Menubar](../components/menubar.md)
- [Navigation items](../components/navigation.md)
- [Tooltips](../components/tooltip.md)
- [Avatars](../components/avatar.md)
- [Application shell](../components/app-shell.md)
