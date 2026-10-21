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
    use: OrganizationSwitcher
composes:
  - Menu
  - AvatarButton
  - Avatar
  - Button
  - Row
  - Column
  - Text
  - ThemeRadioGroup
  - TopBar
related:
  - navigation
  - menu
  - avatar
  - top-bar
---

# Account menu

## Overview

Use this pattern to show who is signed in and give them their own things from one place: their avatar, at the end of the top bar, opens a [Menu](../components/menu.md) whose header shows their avatar, name and email, then account settings, the theme and Sign out. It is a pattern rather than a component because applications arrange it differently: what the header shows, which items follow, and whether the trigger is the avatar or a row with the name.

```tsx example=AvatarMenu

```

## Anatomy

1. **Trigger:** an [AvatarButton](../components/avatar.md) with the person's `name` and `description`, at the end of a [TopBar](../components/top-bar.md)'s `actions`; or, at the foot of a navigation drawer, a ghost [Button](../components/button.md) `fullWidth` with a small Avatar and the name.
2. **Menu:** a `Menu.Root` named Account, with `align="end"` under the avatar, or `side="top"` above a row at the foot of the navigation.
3. **Header:** a `Menu.Header` with a Row of an Avatar `size="lg"` and a Column of the name and, in muted small text, the email or the organization.
4. **Items:** Account settings, a `Menu.Submenu` "Theme" with a [ThemeRadioGroup](../components/menu.md), which stores the choice through the nearest ThemePreferenceProvider, and, after a `Menu.Separator`, Sign out.
5. **Organizations** (optional): a `Menu.Submenu` "Organization" whose `description` names the current one, with a `Menu.RadioGroup` of the person's organizations.

## States and behaviour

- **Opening:** a press, <kbd>Enter</kbd>, <kbd>Space</kbd> or <kbd>↓</kbd> on the trigger opens the menu with focus on its first item; <kbd>Esc</kbd> closes it and returns focus to the trigger.
- **Theme:** choosing System, Light or Dark applies at once and keeps the menu open, so people see the result; the provider stores it.
- **Sign out:** end the session with your authentication service, then go to the sign-in page.
- **Narrow windows:** the avatar stays at the end of the top bar at every width.

## Content guidelines

- Use the person's own name and email in the header, never "My account".
- Say "Sign out", never "Log out" ([Buttons and actions](../foundations/content.md#buttons-and-actions)).
- Keep the menu to the person's own things; the application's places belong in its navigation.

## Do and don't

### Do

- Put the account menu in one place on every page, at the end of the top bar.
- Name the menu Account, and give an icon-only trigger the person's name.

### Don't

- Don't put the application's destinations in the account menu.
- Don't open the account menu on hover.

## Accessibility

### Focus and keyboard

<kbd>Tab</kbd> reaches the trigger; <kbd>Enter</kbd> opens the menu and moves focus to its first item, the arrow keys move between items, <kbd>→</kbd> opens a submenu and <kbd>←</kbd> closes it, and <kbd>Esc</kbd> closes the menu and returns focus to the trigger.

### envUI provides

- The menu, its items, its submenus and its radio items with their roles and states, and the focus handling of [Menu](../components/menu.md).
- An AvatarButton named by the person's name, with their description in its tooltip.

### You provide

- The menu's name, Account, and the person's name and email.
- What Sign out does, and the account settings page.

## Examples

### Organizations

A submenu switches between the person's organizations; the header and the row name the current one.

```tsx example=WithOrganizations

```

### A row at the foot of the navigation

The trigger is a row with the avatar and the name, as wide as the navigation drawer, and the menu opens above it.

```tsx example=RowTrigger

```

## Changelog

- **1.0.0**: The account menu is a pattern built from Menu and Avatar, in place of the AccountMenu component.
