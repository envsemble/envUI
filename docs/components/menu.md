---
title: Menu
summary: A list of actions and links, opened from a button or a right click.
status: stable
since: 1.0.0
category: Actions
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
  - A short list of actions behind one control, such as More actions
  - Options that change a view, such as a sort order
  - Actions for an area on right click (ContextMenu)
avoidWhen:
  - text: Choosing a value for a form field.
    use: Select
  - text: An application menubar, such as File, Edit and View.
    use: Menubar
  - text: Searching for and running one of many commands.
    use: CommandPalette
components:
  - Menu
  - ContextMenu
  - ThemeMenuRadioGroup
examples:
  IconsAndShortcuts:
    role: overview
    open: true
  ContextMenuForRows: example
  GroupsAndSeparators: example
  Choices: example
  Submenus: example
  AccountSwitcher: example
  Destinations: example
  MenuAnatomy: anatomy
---

# Menu

## Variants

### Context menu

```tsx figure=ContextMenuForRows motion

```

### Groups and separators

```tsx figure=GroupsAndSeparators open

```

### Radio and checkbox items

```tsx figure=Choices motion

```

### Submenus

```tsx figure=Submenus motion

```

### Pictures before the label

```tsx figure=AccountSwitcher open

```

### Destinations

```tsx figure=Destinations open

```

## Anatomy

```tsx figure=MenuAnatomy open

```

1. **Menu** (`env-menu`)
2. **Group label** (`env-menu-group-label`, `label`)
3. **Item** (`env-menu-item`)
4. **Start** (`env-menu-item-start`, `start`)
5. **Shortcut** (`env-menu-item-shortcut`, `shortcut`)
6. **Description** (`env-menu-item-description`, `description`)
7. **Separator** (`env-menu-separator`)

## Accessibility

### Keyboard

| Key                                                               | Action                                                                    |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------- |
| <kbd>Enter</kbd>, <kbd>Space</kbd> or <kbd>↓</kbd> on the trigger | Opens the menu with its first item highlighted.                           |
| <kbd>↓</kbd>, <kbd>↑</kbd>, <kbd>Home</kbd>, <kbd>End</kbd>       | Moves the highlight; a letter jumps to the next item that starts with it. |
| <kbd>→</kbd>, <kbd>←</kbd>                                        | Opens a submenu, or closes it.                                            |
| <kbd>Shift</kbd>+<kbd>F10</kbd> or <kbd>Menu</kbd>                | Opens a ContextMenu at the focused element.                               |
