---
title: Menubar
summary: A desktop-style bar of menus, such as File, Edit and View.
status: stable
since: 1.0.0
category: Actions
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
  - Many commands of a document-centred application, such as File and Edit
  - The application's menus at the start of a title bar the window draws itself
avoidWhen:
  - text: A short list of actions behind one control.
    use: Menu
  - text: Running a command by name.
    use: CommandPalette
  - text: A row of commands that stay visible, such as an editor’s formatting.
    use: Toolbar
components:
  - Menubar
examples:
  NotesMenubar:
    role: overview
    motion: true
  InTitleBar: example
  MenubarAnatomy: anatomy
---

# Menubar

## Variants

### In a title bar

```tsx figure=InTitleBar

```

## Anatomy

```tsx figure=MenubarAnatomy open width="20"

```

1. **Menubar** (`env-menubar`)
2. **Trigger** (`env-menubar-trigger`, `label`)
3. **Access key** (`env-menubar-access-key`, `accessKey`)
4. **Menu** (`env-menu`, the children, open with `open` or `defaultOpen`)

## Behaviour

### After a command

<!-- specimen: AfterACommand -->

### Access keys

<!-- specimen: AccessKeys -->

## Accessibility

### Keyboard

| Key                                                             | Action                                                       |
| --------------------------------------------------------------- | ------------------------------------------------------------ |
| <kbd>←</kbd>, <kbd>→</kbd>                                      | Moves between triggers, or between open menus.               |
| <kbd>↓</kbd>, <kbd>Enter</kbd> or <kbd>Space</kbd> on a trigger | Opens its menu with the first item highlighted.              |
| <kbd>Alt</kbd>                                                  | With access keys, moves focus to the first trigger and back. |
| <kbd>Alt</kbd> with an access key                               | Opens that menu.                                             |
