---
title: Account menu
summary: Show who is signed in and give them their own things, such as account settings, the theme and Sign out, from their avatar.
status: beta
since: 1.0.0
intent: Find and navigate
aliases:
  - AccountMenu
  - account menu
  - user menu
  - profile menu
  - avatar menu
  - sign out
  - theme submenu
  - organization switcher in a menu
useWhen:
  - People sign in, and need their account settings, the theme and Sign out within reach on every page.
avoidWhen:
  - text: The application's places, such as Projects and Settings.
    see: navigation
  - text: Switching organizations from a control of its own, such as at the top of the navigation.
    see: organization-switcher
composes:
  - Menu
  - AvatarButton
  - Avatar
  - Button
  - IconButton
  - Row
  - Column
  - Text
  - ThemeRadioGroup
  - TopBar
---

# Account menu

## Overview

The account menu is a [Menu](../components/menu.md) opened from the person's [AvatarButton](../components/avatar.md) at the end of the [TopBar](../components/top-bar.md): a larger first row with who is signed in, their avatar centered above their name and email, then their own things, ending with Sign out.

```tsx example=AvatarMenu

```

### The theme

A [ThemeRadioGroup](../components/menu.md) in a Theme submenu applies the choice at once and keeps the menu open, so people see the result; the nearest ThemePreferenceProvider stores it.

## Variants

### Organizations

A submenu switches between the person's organizations; the header names the current one.

```tsx example=WithOrganizations

```

### A row at the foot of the navigation

A ghost Button `fullWidth` with the avatar and the name, as wide as the drawer; the menu opens above it with `side="top"`.

```tsx example=RowTrigger

```

## When to use

```tsx do=AvatarTrigger caption="The person's own avatar, named by their name, at the end of the top bar."

```

```tsx dont=GenericTrigger caption="The same icon for everyone: nothing says who is signed in."

```

- Keep it to the person's own things; the application's places belong in its navigation.
- Open it on a press, never on hover.

### Content

- The person's own name and email in the header, never "My account".
- Say "Sign out", never "Log out" ([content](../foundations/content.md#buttons-and-actions)).

## Accessibility

### Keyboard

| Key                                                              | Action                                           |
| ---------------------------------------------------------------- | ------------------------------------------------ |
| <kbd>Enter</kbd>, <kbd>Space</kbd> or <kbd>↓</kbd> on the avatar | Opens the menu, with focus on its first item.    |
| <kbd>↑</kbd>, <kbd>↓</kbd>                                       | Move between items.                              |
| <kbd>→</kbd>, <kbd>←</kbd>                                       | Open a submenu, and close it.                    |
| <kbd>Esc</kbd>                                                   | Closes the menu and returns focus to the avatar. |

### envUI provides

- The roles, states and focus handling of [Menu](../components/menu.md), its submenus and radio items.
- An AvatarButton named by the person's name, with their description in its tooltip.
- A Menu.Header that is not an item: arrow keys skip it, focus starts on the first item, and the menu keeps its own name.

### You provide

- The menu's name, Account, and the person's name and email.
- What Sign out does, and the account settings page.

## Changelog

- **1.0.0**: The account menu is a pattern built from Menu and Avatar, in place of the AccountMenu component. The page is on the figure template.
