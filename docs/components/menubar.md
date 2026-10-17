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
  - A window draws its own title bar and holds the application's menus at its start (with WindowFrame.TitleBar, or AppShell.Root's `titleBar`).
avoidWhen:
  - text: A short list of actions behind one control.
    use: Menu
  - text: Destinations in an application's navigation.
    use: NavList
  - text: Running a command by name.
    use: CommandPalette
  - text: A row of actions that stay visible, such as a toolbar.
    use: ButtonGroup
related:
  - menu
  - app-shell
  - command-palette
  - kbd
  - accessibility
components:
  - Menubar
---

# Menubar

## Overview

A menubar holds an application's commands as a desktop window does: a row of small text triggers, each opening a menu below it. Once a menu is open, moving the pointer over another trigger, or <kbd>←</kbd> and <kbd>→</kbd>, switch to its menu. After a command, focus returns to where it was before the menubar took it, so commands such as Copy act on the field people were in. With `accessKeys`, <kbd>Alt</kbd> works as on a desktop. The menus are built from the Menu parts.

- **Menubar.Root** is the row, named by `aria-label`.
- **Menubar.Menu** is one trigger and its menu, holding Menu.Item, Menu.Submenu, Menu.Group, Menu.RadioGroup, Menu.CheckboxItem and Menu.Separator.

```tsx example=NotesMenubar

```

## Anatomy

1. **Menubar** (Menubar.Root): a row of triggers 0.125 rem apart.
2. **Trigger** (Menubar.Menu's `label`): a small text button in the label type, with its access key underlined while <kbd>Alt</kbd> is held.
3. **Menu** (Menubar.Menu's `children`): a menu 0.25 rem below its trigger, lined up with its start; the open menu's trigger keeps a fill.
4. **Items**: the Menu parts, with shortcuts as Kbd keys at the end of their rows and submenus beside them.

## Variants and sizes

- Triggers are as tall as a small control, 2 rem, or 1.625 rem in the compact scale, with 0.5 rem inline padding and 0.5 rem corners; their labels don't wrap. On touch screens they grow to 2.75 rem, tall and wide, as buttons do.
- Menus take the sizes of every [Menu](../components/menu.md), in the app's [scale](../foundations/scale.md).

## States and behaviour

- **Opening and switching**: a press on a trigger, or <kbd>↓</kbd>, <kbd>Enter</kbd> or <kbd>Space</kbd> on it, opens its menu below it. While a menu is open, hovering another trigger opens that menu instead, and <kbd>←</kbd> and <kbd>→</kbd> switch to the previous or next menu.
- **Closing and focus**: <kbd>Esc</kbd> closes the menu and leaves focus on its trigger. When a menu closes after a command, or after a press on its trigger or elsewhere, focus returns to where it was before the menubar took it, such as a document field; focus that has moved on, such as into a dialog a command opened, stays there. With nothing to return to, a press elsewhere lets focus go.
- **The earlier element**: Menubar.Menu's `onOpenChange` reports that element as `previousFocus`; keep it when the menu opens, and let commands such as Copy, Paste or Select all act on it.
- **The page stays put**: opening a menu neither locks scrolling nor shifts the page.
- **Shortcuts**: shortcuts show as Kbd keys at the end of each row; they describe keys the application already handles, also while the menus are closed.
- **Access keys** (`accessKeys`): holding <kbd>Alt</kbd> underlines each menu's `accessKey` until another key is pressed or the window loses focus, and <kbd>Alt</kbd> with that letter opens the menu with its first item highlighted. Pressing and releasing <kbd>Alt</kbd> alone moves focus to the first trigger, and <kbd>Alt</kbd> again or <kbd>Esc</kbd> returns it to where it was; while a trigger has focus, a menu's letter alone opens it. <kbd>Alt</kbd> with <kbd>Ctrl</kbd>, <kbd>Shift</kbd> or the meta key, and letters no menu claims, stay with the page.
- **Disabled**: a disabled Menubar.Menu keeps its trigger in place, dimmed, but doesn't open; `disabled` on Menubar.Root disables every menu.
- **Control**: Menubar.Menu's `open`, `defaultOpen` and `onOpenChange` control a menu.

## Content guidelines

- Name menus with one word in the order people expect: File, Edit, View, then the application's own, then Help.
- Name items as in [Menu](../components/menu.md): a verb for a command, an ellipsis for one that asks for more, such as "Save as…".
- Choose access keys that are letters of their labels and unique in the menubar, such as F, E, V and H.
- Write shortcuts as the keys read on the keyboard, joined with +, such as Ctrl+Shift+S.

## Do and don't

### Do

- Put the menubar at the start of the window's title bar or top bar.
- Offer the most frequent commands in visible controls too, and the rest in the menubar.
- Turn `accessKeys` on for one menubar per window.

### Don't

- Don't use a menubar in an application with few commands; a single [Menu](../components/menu.md) suits them.
- Don't turn `accessKeys` on where <kbd>Alt</kbd> types characters, or on systems whose menus have no access keys.
- Don't show shortcuts the application doesn't handle.
- Don't put navigation between pages in a menubar.

## Accessibility

### Keyboard

| Key                                                             | Action                                                                                             |
| --------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>                 | Moves focus to the menubar, one tab stop, and out of it.                                           |
| <kbd>←</kbd>, <kbd>→</kbd> on a trigger                         | Moves focus to the previous or next trigger.                                                       |
| <kbd>↓</kbd>, <kbd>Enter</kbd> or <kbd>Space</kbd> on a trigger | Opens its menu with the first item highlighted.                                                    |
| <kbd>←</kbd>, <kbd>→</kbd> in an open menu                      | Opens the previous or next menu; on a submenu row, <kbd>→</kbd> opens the submenu.                 |
| The Menu keys in an open menu                                   | Move the highlight, choose and open submenus, as on the Menu page.                                 |
| <kbd>Esc</kbd>                                                  | Closes the menu and leaves focus on its trigger.                                                   |
| <kbd>Alt</kbd> (with `accessKeys`)                              | Pressed alone, moves focus to the first trigger, and back again; held, underlines the access keys. |
| <kbd>Alt</kbd> with an access key                               | Opens that menu with its first item highlighted.                                                   |
| An access key on a focused trigger                              | Opens that menu.                                                                                   |

### envUI provides

- The menubar pattern: a `menubar` named by `aria-label`, whose triggers are its `menuitem`s with `aria-haspopup` and `aria-expanded`, and menus named after their trigger's label.
- `aria-keyshortcuts` on triggers with access keys, such as Alt+F, and the access key underlined inside the word, so the label reads as one word.
- Focus that roves between triggers, moves into a menu as it opens, and returns to the earlier element, or the trigger, as it closes.
- The Menu parts' semantics, shortcuts and focus ring.

### You provide

- An `aria-label` for the menubar, such as "Application menu".
- The keys behind every shortcut, and the commands, acting on `previousFocus` where they act on a field.
- Access keys that don't clash with each other or the page.

## Examples

### In a title bar

A window that draws its own title bar holds the menubar at the start of `WindowFrame.TitleBar`, beside the document's name and its actions.

```tsx example=InTitleBar

```

## Changelog

- **1.0.0**: The parts are members of the `Menubar` namespace: `Menubar` is `Menubar.Root`, `MenubarMenu` is `Menubar.Menu`, and `MenubarMenuOpenChangeDetails` is `Menubar.MenuOpenChangeDetails`. Menubar.Menu's popup is the shared popup surface and takes `ref` and `style`; the arrow keys between menus follow the text direction.
- **0.5.0**: Menubar and MenubarMenu, with compact menus, switching on hover and with the arrow keys, focus returning to where it was with `previousFocus`, and `accessKeys`.
