---
title: Menu
summary: Actions and destinations, opened from a trigger or a right click.
status: stable
since: 0.3.0
category: Actions
aliases:
  - dropdown menu
  - context menu
  - right-click menu
  - action menu
  - overflow menu
  - more actions
  - kebab menu
  - submenu
  - MenuItem
  - OrganizationMenu
  - theme menu
  - theme choice
useWhen:
  - A short list of actions behind one control, such as More actions
  - A few destinations behind one control, such as the account's pages
  - Options that change a view, such as a sort order
  - Actions for an area on right click (ContextMenu)
avoidWhen:
  - text: The signed-in person's menu, with its header and theme submenu, or an organization switcher.
    see: account-and-organizations
  - text: Choosing a value for a form field.
    use: Select
  - text: An application menubar, such as File, Edit and View.
    use: Menubar
  - text: Searching for and running one of many commands.
    use: CommandPalette
  - text: An application's navigation, such as the pages in a sidebar.
    use: Drawer
  - text: Content people work in beside a trigger, such as a small form or a color picker.
    use: Popover
  - text: One or two actions that fit beside the content they act on.
    use: Button
components:
  - Menu
  - ContextMenu
  - ThemeRadioGroup
examples:
  IconsAndShortcuts:
    role: overview
    motion: true
  ContextMenuForRows: example
  GroupsAndSeparators: example
  Choices: example
  Submenus: example
  Destinations: example
  MenuAnatomy: anatomy
  FrequentFirst:
    role: do
    caption: Frequent actions first, and a destructive one last, apart.
  DeleteFirst:
    role: dont
    caption: Delete first, where the keyboard lands.
  DisabledWithReason:
    role: do
    caption: Keep an unavailable item, disabled, with a description of why.
---

# Menu

## Variants

### Context menu

ContextMenu opens a menu for an area on right click, long press, the <kbd>Menu</kbd> key or <kbd>Shift</kbd>+<kbd>F10</kbd>.

```tsx figure=ContextMenuForRows motion

```

### Groups and separators

Groups put items under a heading, and separators split sets without one.

```tsx figure=GroupsAndSeparators open

```

### Radio and checkbox items

Items can be choices, checked in place.

- A radio item checks one choice and closes the menu.
- A checkbox item toggles and keeps it open.

```tsx figure=Choices motion

```

### Submenus

A submenu's row opens a nested menu beside it, on hover or with <kbd>→</kbd>.

```tsx figure=Submenus motion

```

### Destinations

An item can go to a page, as a link the application's router follows.

```tsx figure=Destinations open

```

## Anatomy

```tsx figure=MenuAnatomy open

```

1. **Menu** (`env-menu`)
2. **Group label** (`env-menu-group-label`, `label`)
3. **Item** (`env-menu-item`)
4. **Icon** (`env-menu-item env-icon`, `icon`)
5. **Shortcut** (`env-menu-item-shortcut`, `shortcut`)
6. **Description** (`env-menu-item-description`, `description`)
7. **Separator** (`env-menu-separator`)

## Rules

A menu puts what people use most first, and keeps every item in its place.

```tsx figure=FrequentFirst motion

```

```tsx figure=DeleteFirst motion

```

```tsx figure=DisabledWithReason open

```

### Submenus and controls

A menu holds items only, one level deep.

- Keep submenus to one level, with frequent commands out of them.
- Put no fields or other controls inside a menu.

### Content

Start an action with a verb, such as Rename, and name a destination after its page. Show a shortcut only where the application handles its keys.

## Accessibility

### Keyboard

| Key                                                               | Action                                                                    |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------- |
| <kbd>Enter</kbd>, <kbd>Space</kbd> or <kbd>↓</kbd> on the trigger | Opens the menu with its first item highlighted.                           |
| <kbd>↓</kbd>, <kbd>↑</kbd>, <kbd>Home</kbd>, <kbd>End</kbd>       | Moves the highlight; a letter jumps to the next item that starts with it. |
| <kbd>Enter</kbd>, <kbd>Space</kbd>                                | Chooses the highlighted item.                                             |
| <kbd>→</kbd>, <kbd>←</kbd>                                        | Opens a submenu, or closes it.                                            |
| <kbd>Esc</kbd>                                                    | Closes the menu and returns focus to the trigger.                         |
| <kbd>Shift</kbd>+<kbd>F10</kbd> or <kbd>Menu</kbd>                | Opens a ContextMenu at the focused element.                               |

### envUI provides

- The menu button pattern: `aria-haspopup` and `aria-expanded` on the trigger, and `menuitem`, `menuitemradio` and `menuitemcheckbox` rows.
- Descriptions read as descriptions, and shortcuts as `aria-keyshortcuts`.
- Focus that moves into the menu, roves between items and returns on close.

### You provide

- An `aria-label` for every Menu.Root and ContextMenu, and for an icon-only trigger.
- A visible control for every action of a context menu.
- Focus for after an action removes the trigger, such as on the next row.

## Compose

### Usage

Menu.Root opens from its `trigger`, such as a Button, an IconButton or an AvatarButton, which receives the menu button semantics and must accept native props and a ref; `aria-label` names the menu. Its children are Menu.Header, Menu.Item, Menu.Group, Menu.RadioGroup, Menu.CheckboxItem, Menu.Submenu and Menu.Separator.

A Menu.Item runs its `onClick` and takes:

- its label as `children`;
- a decorative `icon`;
- a muted `description`, read as its description;
- a `shortcut`, such as `Ctrl+D`, shown as Kbd keys and announced as `aria-keyshortcuts`;
- `end` content, such as a Badge, which is part of its name;
- `disabled`, which keeps it in place, dimmed, with `aria-disabled`.

```tsx source=IconsAndShortcuts

```

#### Opening

- `side` is `bottom`, the default, `top`, `left`, `right`, or `inline-start` and `inline-end`, which follow the text direction, and it flips where the window has no room.
- `align` is `start`, `center` or `end`, the default.
- Leave the menu uncontrolled, with `defaultOpen` to start open, or control it with `open` and `onOpenChange`.
- `className`, `ref`, `style` and the other native props reach the popup.

#### Context menu

ContextMenu makes its one child the region, which must accept native props and a ref, and takes the menu's parts as `content`, as the ContextMenuForRows example does.

- `content` can be a function that receives the element the menu opened on and returns them; one that returns `null` leaves the menu closed there.
- `disabled` keeps the browser's own context menu.
- `open`, `onOpenChange` and `anchorPoint` open it from another control at a point.
- Offer every action as a visible control too.

```tsx
<ContextMenu
  aria-label="Document actions"
  content={(target) => {
    const id = target?.closest<HTMLElement>('[data-entry]')?.dataset.entry;
    return id ? <Menu.Item onClick={() => remove(id)}>Delete</Menu.Item> : null;
  }}
>
  <List.Root aria-label="Documents">{rows}</List.Root>
</ContextMenu>
```

#### Account menu

Menu.Header holds the context at the top, such as the signed-in person's avatar, name and e-mail address, under an AvatarButton trigger, as the [account and organizations](../patterns/account-and-organizations.md) pattern builds it. The avatar sits at the end of a top bar, so the menu lines up with the trigger's end.

```tsx
<Menu.Root
  aria-label="Account"
  trigger={<AvatarButton name="Alex Morgan" aria-label="Open account menu" />}
>
  <Menu.Header>
    <Column align="center" gap={1} padding={2}>
      <Avatar name="Alex Morgan" size="lg" />
      <Text>Alex Morgan</Text>
      <Text variant="body-sm" emphasis="muted">
        alex@example.com
      </Text>
    </Column>
  </Menu.Header>
  <Menu.Item href="/account" icon={<ManageAccounts />}>
    Account settings
  </Menu.Item>
  <Menu.Separator />
  <Menu.Item icon={<Logout />}>Sign out</Menu.Item>
</Menu.Root>
```

#### Groups, choices and submenus

- Menu.Group puts items under its `label`; Menu.Separator splits sets without one.
- Menu.RadioGroup holds Menu.RadioItems, each with a `value`, and takes `value`, `onValueChange` and a `label`, or `aria-labelledby`; a radio item closes the menu unless `closeOnClick={false}`.
- Menu.CheckboxItem takes `checked` and `onCheckedChange`, and keeps the menu open unless `closeOnClick`.
- ThemeRadioGroup is the theme choice as radio items, from the nearest ThemePreferenceProvider, or from `value` and `onValueChange`; it keeps the menu open so people see the theme change.
- Menu.Submenu is a row with its `label` that opens its children beside it; `open`, `defaultOpen` and `onOpenChange` suit loading its items as it opens.

```tsx
<Menu.Root aria-label="View options" trigger={<Button variant="secondary">View</Button>}>
  <Menu.RadioGroup label="Sort by" value={sort} onValueChange={setSort}>
    <Menu.RadioItem value="name">Name</Menu.RadioItem>
    <Menu.RadioItem value="size">Size</Menu.RadioItem>
  </Menu.RadioGroup>
  <Menu.Group label="Show">
    <Menu.CheckboxItem checked={hiddenFiles} onCheckedChange={setHiddenFiles}>
      Hidden files
    </Menu.CheckboxItem>
  </Menu.Group>
  <Menu.Submenu label="Theme">
    <ThemeRadioGroup />
  </Menu.Submenu>
</Menu.Root>
```

#### Destinations

With `href`, a Menu.Item is a link, through the link component of `LinkProvider`, and the menu closes as it is followed.

- Its `onClick` runs as it is followed.
- `target` and `rel` are a native link's.
- A disabled one renders no link.
- `aria-current="page"` marks the page shown now.

```tsx
<Menu.Item href="/help/guide" icon={<MenuBook />}>
  User guide
</Menu.Item>
```

### Composition

The parts are the popup, `env-menu`, and its positioner, `env-menu-positioner`; the header, `env-menu-header`; a group, `env-menu-group`, with its label, `env-menu-group-label`; each item, `env-menu-item`, with `data-highlighted` and `data-disabled`, its label and description in `env-menu-item-text`, `env-menu-item-label` and `env-menu-item-description`, and its end, `env-menu-item-end`, with the shortcut, `env-menu-item-shortcut`; a radio or checkbox item, `env-menu-choice`, with `data-checked` and its check in `env-menu-item-check` and `env-menu-item-check-mark`; a submenu's row, `env-menu-submenu-trigger`, with its chevron, `env-menu-submenu-chevron`; and the separator, `env-menu-separator`.

### Customize

`--env-menu-item-container`, `--env-menu-item-content` and `--env-menu-item-icon` set the colors of one Menu's items, through `style` or CSS: their fill, their labels and their leading icons. The highlight and press then follow them, as state layers; with none set, it keeps its own colors.

## Changelog

- **1.0.0**: ThemeRadioGroup, the theme choice for any menu. The parts are members of the `Menu` namespace: `Menu` is `Menu.Root`, and `MenuItem`, `MenuHeader`, `MenuSeparator`, `MenuGroup`, `MenuRadioGroup`, `MenuRadioItem`, `MenuCheckboxItem` and `MenuSubmenu` are `Menu.Item`, `Menu.Header`, `Menu.Separator`, `Menu.Group`, `Menu.RadioGroup`, `Menu.RadioItem`, `Menu.CheckboxItem` and `Menu.Submenu`. Menus have one anatomy at the scale's row height: `density` and the `MenuDensity` type are gone. `OrganizationMenu`, OrganizationSwitcher in 1.0.0-prerelease.0, is the organization switcher pattern, built from Menu.Root, Menu.RadioGroup and Menu.RadioItem. ContextMenu keeps its name, and a `content` function that returns `null` leaves the menu closed on that element. Menu.Item's `trailing` is `end`. A Menu.Item with `href` closes the menu as it is followed and takes an `onClick`, which runs as it is followed, and a disabled one renders no link. Every menu's popup is the shared popup surface, which takes the direction at its trigger, and Menu.Root takes `side="inline-start"` and `"inline-end"` and passes `ref`, `style` and native props to its popup.
- **0.5.0**: ContextMenu; `description`, `shortcut` and `trailing` on items; MenuGroup, MenuRadioGroup, MenuRadioItem and MenuCheckboxItem; `density="compact"` on Menu and ContextMenu; MenuSubmenu.
- **0.4.0**: OrganizationMenu's `detail` for each organization, and its trigger is a secondary Button with up and down arrows. Menu items keep 1.5 rem inline padding, and hover and press shift 6 and 10 points of lightness.
- **0.3.0**: Menu, MenuHeader, MenuItem for actions and destinations, MenuSeparator, and OrganizationMenu; menus grow from their trigger.
