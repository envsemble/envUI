---
title: Organization switcher
summary: Show the active organization and switch between the person's organizations, from a Menu at the top of the navigation or in the top bar.
status: beta
since: 1.0.0
intent: Frame the application
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
  - People who belong to several organizations
  - Switching from a control of its own, such as at the top of the navigation
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
---

# Organization switcher

## Overview

A button names the active organization and opens a [Menu](../components/menu.md) of the person's organizations, under a heading, with an action that creates one. It fits the top of a navigation [Drawer](../components/drawer.md) or the start of the [TopBar](../components/top-bar.md).

```tsx example=SwitchOrganization

```

## Variants

### Before the first organization

Without organizations, the switcher is only the create action, a button of its own.

```tsx example=FirstOrganization

```

## When to use

```tsx do=CurrentName caption="The trigger names the active organization."

```

```tsx dont=GenericLabel caption="A generic label: nothing says where people are."

```

### Switching

Switch at once on a choice, and report progress where the switch takes time. Keep the create action last, after a separator.

### Content

Write organization names as people wrote them, with the person's role, such as Admin, under each. Say "Create organization", in the words the application uses for one.

## Anatomy

```tsx anatomy=OrganizationSwitcherAnatomy open

```

1. **Trigger** (`env-button`)
2. **Heading** (`env-menu-header`)
3. **Organization** (`env-menu-item`)
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

- The roles, states and focus handling of [Menu](../components/menu.md): the radio group, named by the heading, and the active organization checked; the heading row is not an item.
- The trigger's expanded state and the return of focus to it.

### You provide

- The menu's name, such as Organizations, and the heading that names the group.
- The switch itself, and a status that reports it where it takes time.

## In code

### Usage

A `Menu.Root` named by `aria-label="Organizations"`, with `align="start"`, takes a secondary Button as its `trigger`, whose label is the active organization's name and whose `endIcon` is UnfoldMore. Its organizations are a `Menu.RadioGroup` whose `value` is the active one; `onValueChange` switches, and a `role="status"` message reports a switch that takes time.

```tsx source=SwitchOrganization

```

#### Before the first organization

With no organizations, render a secondary Button with the Add `startIcon` that creates one, in place of the Menu.

```tsx source=FirstOrganization

```

### Composition

The first row is a `Menu.Header`, not an item: a centred Column with the Groups3 icon above a headline Text, whose `id` names the radio group through `aria-labelledby`. Each organization is a `Menu.RadioItem` with the person's role as its `description`. A `Menu.Separator` and a `Menu.Item` with the Add icon end the menu with the create action. In a navigation Drawer the switcher goes in its `header`.

The parts are the trigger, `env-button`, the heading row, `env-menu-header`, each organization, `env-menu-item`, its role, `env-menu-item-description`, and the create action, `env-menu-separator + env-menu-item`.

## Changelog

- **1.0.0**: The organization switcher is a pattern built from Menu and Button, in place of the OrganizationSwitcher component.
