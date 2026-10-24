---
title: Account and organizations
summary: Show who is signed in and where, and give people their own things and their organizations from a menu in the frame.
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
  - OrganizationSwitcher
  - OrganizationMenu
  - organization switcher
  - organization menu
  - workspace switcher
  - team switcher
  - tenant switcher
  - switch organization
useWhen:
  - Account settings, the theme and Sign out on every page
  - People who belong to several organizations
avoidWhen:
  - text: The application's places, such as Projects and Settings.
    see: navigation
  - text: The frame the menus sit in, with its top bar and navigation.
    see: app-frame
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

# Account and organizations

## Overview

Both are a [Menu](../components/menu.md) behind a trigger in the frame. The account menu opens from the person's [AvatarButton](../components/avatar.md) at the end of the [TopBar](../components/top-bar.md): their avatar, name and email first, then their own things, with Sign out last.

```tsx example=AvatarMenu

```

### The theme

A Theme submenu applies the choice at once and keeps the menu open, so people see the result, and the application remembers it.

## Variants

### Organizations in the account menu

A submenu switches between the person's organizations, and names the current one.

```tsx example=WithOrganizations

```

### A switcher of its own

Where people switch often, a button at the top of the navigation [Drawer](../components/drawer.md), or at the start of the top bar, names the active organization and opens them all, with the person's role under each and an action that creates one. Before the first organization, that action is a button of its own.

```tsx example=SwitchOrganization

```

### A row at the foot of the navigation

The account menu's trigger can be a row with the avatar and the name, as wide as the drawer; the menu opens above it.

```tsx example=RowTrigger

```

## When to use

```tsx do=AvatarTrigger caption="The person's own avatar, named by their name, at the end of the top bar."

```

```tsx dont=GenericTrigger caption="The same icon for everyone: nothing says who is signed in."

```

```tsx do=CurrentName caption="The switcher names the active organization."

```

```tsx dont=GenericLabel caption="A generic label: nothing says where people are."

```

### Switching

Switch at once on a choice, and say so where the switch takes time.

### Content

Put the person's own name and email at the top, never "My account", and end with "Sign out", never "Log out". Write organization names as people wrote them, with the person's role, such as Admin, and say "Create organization" in the words the application uses for one.

## Anatomy

```tsx anatomy=OrganizationSwitcherAnatomy open

```

1. **Trigger** (`env-button`)
2. **Heading** (`env-menu-header`)
3. **Organization** (`env-menu-item`)
4. **Role** (`env-menu-item-description`, `description`)
5. **Create action** (`env-menu-separator + env-menu-item`)

## Accessibility

Both menus take the keys of a [Menu](../components/menu.md), and give focus back to their trigger as they close.

### envUI provides

- The roles, states and focus handling of Menu, its submenus and radio items: the organizations as a radio group named by the heading, the active one checked.
- An AvatarButton named by the person's name, with their description in its tooltip.
- A Menu.Header that is not an item: arrow keys skip it, focus starts on the first item, and the menu keeps its own name.

### You provide

- Each menu's name, Account or Organizations, and the person's name and email.
- What Sign out does, the account settings page, and the switch itself, with a status where it takes time.

## In code

### Usage

A `Menu.Root` named `aria-label="Account"`, with `align="end"`, takes as its `trigger` an AvatarButton with the person's `name` and, for its tooltip, their email as `description`. A `Menu.Header` holds a large Avatar, `size="lg"`, centred above the name and email; it is not an item, so focus starts on the first item. Then come the items, such as a `Menu.Item` with `href="/account"`, a `Menu.Submenu` labelled Theme, and Sign out after a `Menu.Separator`.

```tsx source=AvatarMenu

```

#### The theme

A ThemeRadioGroup inside the Theme `Menu.Submenu` applies the choice at once and keeps the menu open; the nearest ThemePreferenceProvider stores it.

#### Organizations in the account menu

A `Menu.Submenu` labelled Organization, with the current one as its `description`, holds a `Menu.RadioGroup` with `value` and `onValueChange` and a `Menu.RadioItem` for each organization.

```tsx source=WithOrganizations

```

#### A switcher of its own

A `Menu.Root` named by `aria-label="Organizations"`, with `align="start"`, takes a secondary Button as its `trigger`, whose label is the active organization's name and whose `endIcon` is UnfoldMore. Its organizations are a `Menu.RadioGroup` whose `value` is the active one; `onValueChange` switches, and a `role="status"` message reports a switch that takes time. With no organizations, render a secondary Button with the Add `startIcon` that creates one, in place of the Menu.

```tsx source=SwitchOrganization

```

#### A row at the foot of the navigation

The trigger is a Button with `variant="ghost"`, `fullWidth` and an `endIcon`, holding a small Avatar, `size="sm"`, and the name in a Row. The menu opens above it with `side="top"` and `align="start"`.

```tsx source=RowTrigger

```

### Composition

The switcher's first row is a `Menu.Header`, not an item: a centred Column with the Groups3 icon above a headline Text, whose `id` names the radio group through `aria-labelledby`. Each organization is a `Menu.RadioItem` with the person's role as its `description`. A `Menu.Separator` and a `Menu.Item` with the Add icon end the menu with the create action. In a navigation Drawer the switcher goes in its `header`.

The parts are the trigger, `env-button`, the heading row, `env-menu-header`, each organization, `env-menu-item`, its role, `env-menu-item-description`, and the create action, `env-menu-separator + env-menu-item`.

## Changelog

- **1.0.0**: The account menu and the organization switcher are one pattern, built from Menu, Avatar and Button, in place of the AccountMenu and OrganizationSwitcher components. The page is on the figure template.
