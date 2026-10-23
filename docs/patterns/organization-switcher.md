---
title: Organization switcher
summary: Show the active organization and switch between the person's organizations, from a Menu at the top of the navigation or in the top bar.
status: beta
since: 1.0.0
intent: Find and navigate
aliases:
  - OrganizationSwitcher
  - OrganizationMenu
  - organization switcher
  - organization menu
  - workspace switcher
  - team switcher
  - tenant switcher
  - switch organization
useWhen:
  - People belong to several organizations, and switch between them from a control of its own, such as at the top of the navigation drawer.
avoidWhen:
  - text: The person's own things, such as account settings and Sign out, where a submenu can hold the organizations too.
    see: account-menu
  - text: The application's places, such as Projects and Settings.
    see: navigation
composes:
  - Menu
  - Button
  - Column
  - Text
related:
  - menu
  - account-menu
  - navigation
  - drawer
---

# Organization switcher

## Overview

The organization switcher is a [Menu](../components/menu.md) opened from a secondary [Button](../components/button.md) that names the active organization: a radio group of the person's organizations, each with their role as its description, and an action that creates one. It fits the `header` of a navigation [Drawer](../components/drawer.md) or the start of the [TopBar](../components/top-bar.md).

```tsx example=SwitchOrganization

```

## Variants

### Before the first organization

Without organizations, the switcher is only the create action, a Button of its own.

```tsx example=FirstOrganization

```

## When to use

```tsx do=CurrentName caption="The trigger names the active organization."

```

```tsx dont=GenericLabel caption="A generic label: nothing says where people are."

```

- Switch at once on a choice, and report progress where the switch takes time.
- Keep the create action last, after a separator.

### Content

- Organization names as people wrote them; the person's role, such as Admin, as each row's description.
- Say "Create organization", in the words the application uses for one.

## Anatomy

```tsx anatomy=OrganizationSwitcherAnatomy open

```

1. **Trigger** (`env-button`, the active organization)
2. **Group label** (`env-menu-group-label`, `label`)
3. **Organization** (`env-menu-item`, Menu.RadioItem)
4. **Role** (`env-menu-item-description`, `description`)
5. **Create action** (`env-menu-separator + env-menu-item`)

## Accessibility

### Keyboard

| Key                                                               | Action                                            |
| ----------------------------------------------------------------- | ------------------------------------------------- |
| <kbd>Enter</kbd>, <kbd>Space</kbd> or <kbd>↓</kbd> on the trigger | Opens the menu, with focus on its first item.     |
| <kbd>↑</kbd>, <kbd>↓</kbd>                                        | Move between the organizations and the action.    |
| <kbd>Enter</kbd>, <kbd>Space</kbd>                                | Switches to the organization, or creates one.     |
| <kbd>Esc</kbd>                                                    | Closes the menu and returns focus to the trigger. |

### envUI provides

- The roles, states and focus handling of [Menu](../components/menu.md): the radio group, named by its `label`, and the active organization checked.
- The trigger's expanded state and the return of focus to it.

### You provide

- The menu's name, such as Organizations, and the group's `label`.
- The switch itself, and a status that reports it where it takes time.

## Changelog

- **1.0.0**: The organization switcher is a pattern built from Menu and Button, in place of the OrganizationSwitcher component.
