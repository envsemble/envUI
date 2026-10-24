---
title: Menubar
summary: A desktop-style menubar of menus, such as File, Edit and View, with shortcuts, submenus and access keys.
status: stable
since: 0.5.0
category: Feedback & overlays
aliases:
  - menu bar
  - application menu
  - app menu
  - main menu
  - top menu
  - File Edit View
  - MenubarMenu
  - access keys
useWhen:
  - A document-centred application has many commands, grouped as a desktop application groups them, such as File, Edit, View and Help.
  - A window draws its own title bar and holds the application's menus at its start (with TopBar's `titleBar`).
avoidWhen:
  - text: A short list of actions behind one control.
    use: Menu
  - text: Running a command by name.
    use: CommandPalette
  - text: A row of commands that stay visible, such as an editor’s formatting.
    use: Toolbar
components:
  - Menubar
---

# Menubar

## Overview

After a command, Menubar returns focus to where it was, so Copy acts on the field people were in.

```tsx example=NotesMenubar

```

### In a title bar

The [window frame](../patterns/window-frame.md) pattern shows the whole title bar.

```tsx example=InTitleBar

```

### Access keys

With `accessKeys`, holding <kbd>Alt</kbd> underlines each menu's `accessKey`, and <kbd>Alt</kbd> with the letter opens it. Turn it on for one menubar per window.

## When to use

```tsx do=StandardOrder caption="Menus in the order people expect: File, Edit, View, your own, then Help."

```

```tsx dont=UnusualOrder caption="Help first and File in the middle."

```

- Offer the most frequent commands in visible controls too.

### Content

- Name items as in [Menu](../components/menu.md), with an ellipsis for a command that asks for more, such as Export… in File.

## Anatomy

```tsx anatomy=MenubarAnatomy open

```

1. **Menubar** (`env-menubar`)
2. **Trigger** (`env-menubar-trigger`, `label`)
3. **Access key** (`env-menubar-access-key`, `accessKey`)
4. **Menu** (`env-menu`, the children, open with `open` or `defaultOpen`)

## Accessibility

### Keyboard

| Key                                                             | Action                                                        |
| --------------------------------------------------------------- | ------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>                 | Moves to the menubar, one tab stop, and out of it.            |
| <kbd>←</kbd>, <kbd>→</kbd>                                      | Moves between triggers, or between open menus.                |
| <kbd>↓</kbd>, <kbd>Enter</kbd> or <kbd>Space</kbd> on a trigger | Opens its menu with the first item highlighted.               |
| <kbd>Esc</kbd>                                                  | Closes the menu and leaves focus on its trigger.              |
| <kbd>Alt</kbd>                                                  | With `accessKeys`, moves focus to the first trigger and back. |
| <kbd>Alt</kbd> with an access key                               | Opens that menu.                                              |

### envUI provides

- A `menubar` whose triggers are `menuitem`s with `aria-haspopup` and `aria-expanded`.
- `aria-keyshortcuts` on triggers with access keys, such as <kbd>Alt</kbd>+<kbd>F</kbd>.
- Focus that roves between triggers and returns to the earlier element after a command.

### You provide

- An `aria-label`, such as Application menu.
- The keys behind every shortcut, and commands that act on `previousFocus` where they edit a field.

## Changelog

- **1.0.0**: The parts are members of the `Menubar` namespace: `Menubar` is `Menubar.Root`, `MenubarMenu` is `Menubar.Menu`, and `MenubarMenuOpenChangeDetails` is `Menubar.MenuOpenChangeDetails`. Menubar.Menu's popup is the shared popup surface and takes `ref` and `style`; the arrow keys between menus follow the text direction.
- **0.5.0**: Menubar and MenubarMenu, with compact menus, switching on hover and with the arrow keys, focus returning to where it was with `previousFocus`, and `accessKeys`.
