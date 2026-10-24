---
title: Account menu
summary: Show who is signed in and give them their own things, such as account settings, the theme and Sign out, from their avatar.
status: beta
since: 1.0.0
intent: Frame the application
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
  - Account settings, the theme and Sign out on every page
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

The account menu is a [Menu](../components/menu.md) opened from the person's [AvatarButton](../components/avatar.md) at the end of the [TopBar](../components/top-bar.md): a larger first row with their avatar centered above their name and email, then the items, with Sign out last.

```tsx example=AvatarMenu

```

### The theme

A [ThemeRadioGroup](../components/menu.md) in a Theme submenu applies the choice at once and keeps the menu open, so people see the result, and the application remembers it.

## Variants

### Organizations

A submenu switches between the person's organizations; the header names the current one.

```tsx example=WithOrganizations

```

### A row at the foot of the navigation

A ghost button with the avatar and the name, as wide as the drawer, and the menu opens above it.

```tsx example=RowTrigger

```

## When to use

```tsx do=AvatarTrigger caption="The person's own avatar, named by their name, at the end of the top bar."

```

```tsx dont=GenericTrigger caption="The same icon for everyone: nothing says who is signed in."

```

### On a press

Open the menu on a press, never on hover.

### Content

The person's own name and email in the header, never "My account", and "Sign out", never "Log out", as the [content guidelines](../foundations/content.md) say.

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

## In code

### Usage

A `Menu.Root` named `aria-label="Account"`, with `align="end"`, takes as its `trigger` an AvatarButton with the person's `name` and, for its tooltip, their email as `description`. A `Menu.Header` holds a large Avatar, `size="lg"`, centred above the name and email; it is not an item, so focus starts on the first item. Then come the items, such as a `Menu.Item` with `href="/account"`, a `Menu.Submenu` labelled Theme, and Sign out after a `Menu.Separator`.

```tsx source=AvatarMenu

```

#### The theme

A ThemeRadioGroup inside the Theme `Menu.Submenu` applies the choice at once and keeps the menu open; the nearest ThemePreferenceProvider stores it.

#### Organizations

A `Menu.Submenu` labelled Organization, with the current one as its `description`, holds a `Menu.RadioGroup` with `value` and `onValueChange` and a `Menu.RadioItem` for each organization.

```tsx source=WithOrganizations

```

#### A row at the foot of the navigation

The trigger is a Button with `variant="ghost"`, `fullWidth` and an `endIcon`, holding a small Avatar, `size="sm"`, and the name in a Row. The menu opens above it with `side="top"` and `align="start"`.

```tsx source=RowTrigger

```

## Changelog

- **1.0.0**: The account menu is a pattern built from Menu and Avatar, in place of the AccountMenu component. The page is on the figure template.
