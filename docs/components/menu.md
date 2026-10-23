---
title: Menu
summary: Actions and destinations, opened from a trigger or a right click.
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
  - theme menu
  - theme choice
useWhen:
  - A short list of actions behind one control, such as a row's or a toolbar's More actions.
  - A few destinations that share a trigger, such as the account pages behind the avatar.
  - Options that change a view, such as a sort order or whether hidden files show, as radio and checkbox items.
  - Actions for an area or its rows on right click, beside the visible controls that offer them too (ContextMenu).
  - Switching between the organizations a person belongs to, as the organization switcher pattern shows.
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
components:
  - Menu
  - ContextMenu
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

An AvatarButton trigger and a **Menu.Header** with the account. The full menu, with the theme and the organizations, is the [account menu](../patterns/account-menu.md) pattern, and a switch between organizations of its own the [organization switcher](../patterns/organization-switcher.md).

```tsx example=AccountMenu

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

```tsx do=FrequentFirst open stage=raised caption="Frequent actions first, and a destructive one last, apart."

```

```tsx dont=DeleteFirst open stage=raised caption="Delete first, where the keyboard lands."

```

```tsx do=DisabledWithReason open stage=raised caption="Keep an unavailable item, disabled, with a description of why."

```

```tsx dont=HiddenItem open stage=raised caption="An item that disappears, so people wonder where it went."

```

- Keep submenus to one level, and frequent commands out of them.
- No fields or other controls inside a menu.

### Content

```tsx do=ConsistentIcons open stage=raised caption="An icon on every item of a set, or on none."

```

```tsx dont=MixedIcons open stage=raised caption="An icon on one item only: it stands out for no reason."

```

- Start an action with a verb, such as Rename, and name a destination after its page.
- Show a `shortcut` only where the application handles its keys.

## Anatomy

```tsx anatomy=MenuAnatomy open stage=raised

```

1. **Menu** (`env-menu`)
2. **Group label** (`env-menu-group-label`, `label`)
3. **Item** (`env-menu-item`)
4. **Icon** (`env-menu-item env-icon`, `icon`)
5. **Shortcut** (`env-menu-item-shortcut`, `shortcut`)
6. **Description** (`env-menu-item-description`, `description`)
7. **Separator** (`env-menu-separator`)

Not shown: a submenu's row, `env-menu-submenu-trigger`, and the check of a choice, `env-menu-item-check`.

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

- **1.0.0**: ThemeRadioGroup, the theme choice for any menu. The parts are members of the `Menu` namespace: `Menu` is `Menu.Root`, and `MenuItem`, `MenuHeader`, `MenuSeparator`, `MenuGroup`, `MenuRadioGroup`, `MenuRadioItem`, `MenuCheckboxItem` and `MenuSubmenu` are `Menu.Item`, `Menu.Header`, `Menu.Separator`, `Menu.Group`, `Menu.RadioGroup`, `Menu.RadioItem`, `Menu.CheckboxItem` and `Menu.Submenu`. Menus have one anatomy at the scale's row height: `density` and the `MenuDensity` type are gone. `OrganizationMenu`, OrganizationSwitcher in 1.0.0-prerelease.0, is the organization switcher pattern, built from Menu.Root, Menu.RadioGroup and Menu.RadioItem. ContextMenu keeps its name, and a `content` function that returns `null` leaves the menu closed on that element. Menu.Item's `trailing` is `end`. A Menu.Item with `href` closes the menu as it is followed and takes an `onClick`, which runs as it is followed, and a disabled one renders no link. Every menu's popup is the shared popup surface, which takes the direction at its trigger, and Menu.Root takes `side="inline-start"` and `"inline-end"` and passes `ref`, `style` and native props to its popup.
- **0.5.0**: ContextMenu; `description`, `shortcut` and `trailing` on items; MenuGroup, MenuRadioGroup, MenuRadioItem and MenuCheckboxItem; `density="compact"` on Menu and ContextMenu; MenuSubmenu.
- **0.4.0**: OrganizationMenu's `detail` for each organization, and its trigger is a secondary Button with up and down arrows. Menu items keep 1.5 rem inline padding, and hover and press shift 6 and 10 points of lightness.
- **0.3.0**: Menu, MenuHeader, MenuItem for actions and destinations, MenuSeparator, and OrganizationMenu; menus grow from their trigger.
