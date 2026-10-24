---
title: CommandPalette
summary: A quick-open dialog near the top of the window, with a search field over a list the application filters and ranks.
status: stable
since: 0.5.0
category: Feedback & overlays
aliases:
  - quick open
  - command menu
  - command bar
  - command launcher
  - cmdk
  - Ctrl+K
  - spotlight
  - go to anything
  - jump to
  - omnibox
useWhen:
  - Jumping to a document, a page or a person by name, from anywhere
  - Running a command by name, such as one without a visible control
avoidWhen:
  - text: Choosing a value for a form field from a long list.
    use: Combobox
  - text: A short list of actions behind one control.
    use: Menu
  - text: Searching or filtering the content on the page.
    use: SearchField
  - text: The button that opens the palette, with its shortcut.
    see: search-trigger
components:
  - CommandPalette
---

# CommandPalette

## Overview

The application owns the items and what choosing one does.

```tsx example=GoToDocument

```

### Run a command

An item can end with its shortcut or a badge, and hints below the list say what keys do.

```tsx example=RunCommand

```

## When to use

```tsx do=ShowRecent open caption="Show recent items while the query is empty."

```

```tsx dont=EmptyUntilTyped open caption="An empty list until people type."

```

### One way among others

Keep another way to reach every command, such as a menu or a button: the palette is a shortcut, not the only path.

### Results

Rank the best matches first, and clear the query as the palette closes.

### Content

Name commands with a verb and what they act on, such as Invite people, and tell similar items apart with a line under the label, such as a folder. Show key hints only for keys the application handles.

## Anatomy

```tsx anatomy=CommandPaletteAnatomy open

```

1. **Palette** (`env-command-palette`)
2. **Search field** (`env-command-palette-input`, `placeholder`)
3. **Group heading** (`env-command-palette-heading`)
4. **Item** (`env-command-palette-item`, `items`)
5. **Key hints** (`env-command-palette-footer`, `hints`)

Not shown: the message for no matches.

## Accessibility

### Keyboard

| Key                                                                       | Action                                                               |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| <kbd>↓</kbd>, <kbd>↑</kbd>                                                | Moves the highlight, wrapping at the ends.                           |
| <kbd>Home</kbd>, <kbd>End</kbd>, <kbd>Page Up</kbd>, <kbd>Page Down</kbd> | Moves to the first or last option, or by a page.                     |
| <kbd>Enter</kbd>                                                          | Chooses the highlighted option.                                      |
| <kbd>Ctrl</kbd>+<kbd>Enter</kbd> or <kbd>Cmd</kbd>+<kbd>Enter</kbd>       | Chooses it another way the application sets, such as to open beside. |
| <kbd>Esc</kbd>                                                            | Closes the palette and returns focus.                                |

### envUI provides

- A modal dialog named by `aria-label`, with focus in its search field, kept inside and returned on close.
- The field as a `combobox` over a `listbox`, with the highlighted option as its active descendant.
- A polite count of results as they change.

### You provide

- The shortcut that opens the palette, and a visible control that opens it too.
- An `aria-label`, and the items, filtered and ranked.
- `textValue` for labels that aren't plain text.

## In code

### Usage

The application opens the palette with `open`, such as from a shortcut and from a visible control, and closes it from `onOpenChange`, which receives false when <kbd>Esc</kbd>, a press on the backdrop or a choice closes it. It filters and ranks the `items` itself, from the text in `inputValue` and `onInputValueChange`, and clears that text as the palette closes. `onAction` runs the chosen item, and `closeOnAction`, true by default, closes the palette after it. `aria-label` names the dialog, its search field and its list; `placeholder` shows in the empty field, and `emptyLabel` in place of the list when there are no items.

```tsx source=GoToDocument

```

#### Items

Each CommandPaletteItem has an `id` and a `label`, with `textValue` for a label that isn't plain text. `description` is muted text under the label, such as a folder; `icon` a decorative icon before it; `end` content at the end, such as a Kbd shortcut or a Badge; and `disabled` shows an item that can't be chosen. `group` names its group, whose heading shows where the group changes between items, such as Recently opened while the query is empty.

#### Commands and key hints

`onAction` receives the item and `{ modifier }`, true while <kbd>Ctrl</kbd> or <kbd>Cmd</kbd> was held, such as to open beside. `hints` show keys below the list as Kbd, such as `{ keys: ['Enter'], label: 'Open' }`, and `footer` holds other content after them.

```tsx source=RunCommand

```

### Composition

The [search trigger](../patterns/search-trigger.md) pattern is the button that opens it, with its shortcut's keys. The palette is `env-command-palette`: its search field, `env-command-palette-input`, the group headings, `env-command-palette-heading`, the items, `env-command-palette-item`, the key hints in `env-command-palette-footer`, and the message for no matches, `env-command-palette-status`. `className`, `style`, `ref` and data attributes reach the surface.

## Changelog

- **1.0.0**: Opens from the search trigger pattern, a Button with the shortcut's keys. Rebuilt on Base UI's autocomplete: `inputValue`, `onInputValueChange`, `onAction` and `closeOnAction` for `query`, `onQueryChange`, `onSelect` and `closeOnSelect`, and `CommandPaletteActionOptions`; items take `description`, `end` and `disabled`; options are list rows; the number of results is announced; `className`, `style`, `ref` and data attributes reach the surface.
- **0.5.0**: CommandPalette, with grouped options, keyboard highlight, modifier selection and key `hints` shown as Kbd keys.
