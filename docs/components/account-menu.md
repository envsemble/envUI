---
title: AccountMenu
summary: The signed-in person's menu, opened from their avatar or a row with their name, with a header, a theme submenu and an optional organization submenu.
status: beta
since: 1.0.0
category: Navigation
aliases:
  - account menu
  - user menu
  - profile menu
  - avatar menu
  - sign out menu
useWhen:
  - The signed-in person's settings, theme and sign out, behind their avatar in a header or their name at the foot of a sidebar.
  - The theme choice, System, Light or Dark, in the account's menu rather than a toggle of its own.
  - Switching organizations from the account's menu, where the frame has no switcher of its own.
avoidWhen:
  - text: A switch between organizations at the top of a sidebar, on its own.
    use: OrganizationSwitcher
  - text: Switching between the light and dark themes with one button.
    use: ThemeToggle
  - text: Actions on an item or a view rather than on the account.
    use: Menu
related:
  - menu
  - avatar
  - app-shell
  - navigation-drawer
  - setup
components:
  - AccountMenu
---

# AccountMenu

## Overview

AccountMenu is the menu of the person who is signed in. Their avatar, or a row with their avatar, name and e-mail address, opens a [Menu](../components/menu.md) whose header shows who is signed in, followed by the application's items. Two submenus come with it: **AccountMenu.ThemeSubmenu**, the theme choice, which stores itself through a ThemePreferenceProvider, and **AccountMenu.OrganizationSubmenu**, the switch between the person's organizations. The other items are Menu's own parts.

```tsx example=ThemeAndOrganizations

```

## Anatomy

1. **Trigger** (`trigger`): the avatar, an [AvatarButton](../components/avatar.md) that names the person and shows the description in its tooltip; or a row as wide as its container with a small avatar, the name over the description, and an unfold icon at the end.
2. **Menu** (AccountMenu.Root): a Menu named "Account", which takes `side`, `align`, `open`, `defaultOpen` and `onOpenChange`; `className`, `style`, `ref` and data attributes go to its popup.
3. **Header**: the avatar, the name (`name`) and the description (`description`), such as the e-mail address. It is no item, so focus skips it.
4. **Items** (`children`): Menu.Item, Menu.Separator, Menu.Group and the other Menu parts, such as Account settings and Sign out.
5. **Theme submenu** (AccountMenu.ThemeSubmenu): a row named "Theme" that opens System, Light and Dark as radio items, a ThemeRadioGroup.
6. **Organization submenu** (AccountMenu.OrganizationSubmenu): a row named "Organization", with the active organization under its label, that opens the organizations as radio items, with OrganizationSwitcher's rows, and the create action.

## Variants and sizes

| Trigger          | Use for                                                                                          |
| ---------------- | ------------------------------------------------------------------------------------------------ |
| `auto` (default) | A row in an expanded sidebar, the avatar elsewhere: in a header or a sidebar showing icons only. |
| `avatar`         | The end of a header or a title bar, always the avatar.                                           |
| `row`            | The foot of a sidebar or a settings panel, always the row.                                       |

- The avatar trigger is 2 rem, or 1.5 rem in a sidebar; the row is at least the control height, and the touch height under a coarse pointer.
- The menu opens below the avatar, lined up with its end, above the row, lined up with its start, and at the inline end of an avatar in a sidebar. It flips where the window has no room.

## States and behaviour

- **Theme**: inside a ThemePreferenceProvider the theme submenu shows the stored preference and stores a choice, which the provider applies at once and keeps across visits. An application that stores the theme itself, such as in its account settings, passes `value` and `onValueChange`. The menu stays open after a choice, so people see the theme change; `closeOnClick` closes it.
- **Organizations**: choosing an organization calls `onValueChange` with its id, unless it is the active one, and closes the menu. The application switches and reports progress.
- **Opening**: the trigger opens the menu on a press, <kbd>Enter</kbd>, <kbd>Space</kbd> or <kbd>↓</kbd>; a submenu opens on hover, <kbd>→</kbd> or <kbd>Enter</kbd>, at the inline end of its row. In right-to-left text it opens to the left, with <kbd>←</kbd>.
- **Closing**: choosing an item, <kbd>Esc</kbd> or a press outside closes the menu, and focus returns to the trigger.

## Content guidelines

- Use the name people know the account by, and their e-mail address as the description, where they may have several accounts.
- Order the items from the account to the application: account settings, then preferences such as the theme, then sign out, last, after a separator.
- Name items with what they open or do, such as "Account settings" and "Sign out".

## Do and don't

### Do

- Put the theme in the account's menu, or a ThemeToggle in the header, not both.
- Use the `row` trigger at the foot of a sidebar, where the name helps tell accounts apart.
- Keep one organization switch: AccountMenu.OrganizationSubmenu or an [OrganizationSwitcher](../components/menu.md#organization-switcher), whichever the frame has room for.

### Don't

- Don't put the application's navigation in the account's menu; it belongs in a [NavigationDrawer](../components/navigation-drawer.md).
- Don't hide sign out in a submenu.
- Don't rename the theme choices; System, Light and Dark come from the provider's messages, translated with the rest.

## Accessibility

### Keyboard

| Key                                                               | Action                                                                            |
| ----------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| <kbd>Enter</kbd>, <kbd>Space</kbd> or <kbd>↓</kbd> on the trigger | Opens the menu and focuses its first item.                                        |
| <kbd>↓</kbd>, <kbd>↑</kbd>                                        | Moves between the items, skipping the header.                                     |
| <kbd>→</kbd> or <kbd>Enter</kbd> on a submenu row                 | Opens the submenu and focuses its first item; <kbd>←</kbd> in right-to-left text. |
| <kbd>←</kbd> in a submenu                                         | Closes the submenu and returns to its row; <kbd>→</kbd> in right-to-left text.    |
| <kbd>Enter</kbd> or <kbd>Space</kbd> on an item                   | Runs the item, or chooses the theme or organization.                              |
| <kbd>Esc</kbd>                                                    | Closes the menu, or first the submenu, and returns focus.                         |

### envUI provides

- The menu button pattern: `aria-haspopup`, `aria-expanded` and `aria-controls` on the trigger, and a `menu` named "Account" in the provider's language, or by `aria-label`.
- The avatar trigger named by the person's name.
- The theme and organization choices as `menuitemradio` items with `aria-checked`, and submenu rows that report their submenu.
- The theme labels and the submenu rows' labels from the provider's messages.

### You provide

- `name`, and a `description` where it tells accounts apart.
- An `aria-label` where the page has another menu named Account.
- A ThemePreferenceProvider around the application, or `value` and `onValueChange` on the theme submenu.

## Examples

### A row at the foot of a sidebar

The row shows the name and the e-mail address, and opens the menu above it. The theme submenu here sets a theme the application stores itself, and closes the menu after the choice.

```tsx example=RowTrigger

```

## Changelog

- **1.0.0**: AccountMenu, with the avatar or row trigger, a header, AccountMenu.ThemeSubmenu and AccountMenu.OrganizationSubmenu.
