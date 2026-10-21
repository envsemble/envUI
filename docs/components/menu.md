---
title: Menu
summary: Actions, destinations and the shared organization switcher, opened from a trigger or a right click.
status: stable
since: 0.3.0
category: Feedback & overlays
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
  - organization switcher
  - theme menu
  - theme choice
useWhen:
  - A short list of actions behind one control, such as a row's or a toolbar's More actions.
  - A few destinations that share a trigger, such as the account pages behind the avatar.
  - Options that change a view, such as a sort order or whether hidden files show, as radio and checkbox items.
  - Actions for an area or its rows on right click, beside the visible controls that offer them too (ContextMenu).
  - Switching between the organizations a person belongs to, in the application shell (OrganizationSwitcher).
avoidWhen:
  - text: The signed-in person's menu, with its header and theme submenu.
    see: account-menu
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
  - text: Switching between views of the same content.
    use: Tabs
  - text: One or two actions that fit beside the content they act on.
    use: Button
related:
  - menubar
  - command-palette
  - select
  - popover
  - drawer
  - tree
  - kbd
  - tooltip
  - avatar
  - scaffold
components:
  - Menu
  - ContextMenu
  - OrganizationSwitcher
  - ThemeRadioGroup
---

# Menu

## Overview

A menu shows a short list of actions or destinations from one control, on a temporary surface. **Menu.Root** opens **Menu.Item** rows from its `trigger`, and the other parts build the rest.

```tsx example=IconsAndShortcuts

```

### Context menu

**ContextMenu** opens a menu for an area on right click, long press, the <kbd>Menu</kbd> key or <kbd>Shift</kbd>+<kbd>F10</kbd>. Offer the same actions in a visible button too.

```tsx example=ContextMenuForRows

```

### Account menu

An AvatarButton trigger and a **Menu.Header** with the account. The full menu, with the theme and the organizations, is the [account menu](../patterns/account-menu.md) pattern.

```tsx example=AccountMenu

```

### Organization switcher

**OrganizationSwitcher** shows the active organization and switches between the person's organizations; `onCreate` adds the create action. It fits a navigation [Drawer](../components/drawer.md)'s `header`.

```tsx example=SwitchOrganization

```

### Before the first organization

Without organizations, the switcher is only the create action.

```tsx example=FirstOrganization

```

## Variants

### Groups and separators

**Menu.Group** puts items under a heading; **Menu.Separator** splits sets without one.

```tsx example=GroupsAndSeparators

```

### Radio and checkbox items

A **Menu.RadioItem** checks one choice and closes the menu; a **Menu.CheckboxItem** toggles and keeps it open. **ThemeRadioGroup** is the theme choice as radio items.

```tsx example=Choices

```

### Submenus

A **Menu.Submenu** row opens a nested menu beside it, on hover or with <kbd>→</kbd>.

```tsx example=Submenus

```

### Destinations

With `href`, an item is a link, through the `LinkProvider`.

```tsx example=Destinations

```

## When to use

```tsx do=FrequentFirst caption="Frequent actions first, and a destructive one last, apart."

```

```tsx dont=DeleteFirst caption="Delete first, where the keyboard lands."

```

```tsx do=DisabledWithReason caption="Keep an unavailable item, disabled, with a description of why."

```

```tsx dont=HiddenItem caption="An item that disappears, so people wonder where it went."

```

- Keep submenus to one level, and frequent commands out of them.
- No fields or other controls inside a menu.

### Content

```tsx do=ConsistentIcons caption="An icon on every item of a set, or on none."

```

```tsx dont=MixedIcons caption="An icon on one item only: it stands out for no reason."

```

- Start an action with a verb, such as Rename, and name a destination after its page.
- Show a `shortcut` only where the application handles its keys.

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

## Changelog

- **1.0.0**: ThemeRadioGroup, the theme choice for any menu. The parts are members of the `Menu` namespace: `Menu` is `Menu.Root`, and `MenuItem`, `MenuHeader`, `MenuSeparator`, `MenuGroup`, `MenuRadioGroup`, `MenuRadioItem`, `MenuCheckboxItem` and `MenuSubmenu` are `Menu.Item`, `Menu.Header`, `Menu.Separator`, `Menu.Group`, `Menu.RadioGroup`, `Menu.RadioItem`, `Menu.CheckboxItem` and `Menu.Submenu`. Menus have one anatomy at the scale's row height: `density` and the `MenuDensity` type are gone. `OrganizationMenu` is `OrganizationSwitcher`, with the `env-organization-switcher-*` classes. ContextMenu keeps its name, and a `content` function that returns `null` leaves the menu closed on that element. Menu.Item's `trailing` is `end`. A Menu.Item with `href` closes the menu as it is followed and takes an `onClick`, which runs as it is followed, and a disabled one renders no link. Every menu's popup is the shared popup surface, which takes the direction at its trigger, and Menu.Root takes `side="inline-start"` and `"inline-end"` and passes `ref`, `style` and native props to its popup. OrganizationSwitcher takes `items`, `value` and `onValueChange` (were `organizations`, `currentOrganizationId` and `onSelect`), its items are `OrganizationSwitcherItem`s with a `label` and a `description` (were `name` and `detail`), `className` styles its popup, as `ref` and `style` do, and `triggerClassName` its trigger, its rows are Menu.RadioItems in a group its heading names, and its strings come from `messages.organizationSwitcher`.
- **0.5.0**: ContextMenu; `description`, `shortcut` and `trailing` on items; MenuGroup, MenuRadioGroup, MenuRadioItem and MenuCheckboxItem; `density="compact"` on Menu and ContextMenu; MenuSubmenu.
- **0.4.0**: OrganizationMenu's `detail` for each organization, and its trigger is a secondary Button with up and down arrows. Menu items keep 1.5 rem inline padding, and hover and press shift 6 and 10 points of lightness.
- **0.3.0**: Menu, MenuHeader, MenuItem for actions and destinations, MenuSeparator, and OrganizationMenu; menus grow from their trigger.
