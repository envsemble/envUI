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
  - People jump to a document, a page or a person by name, from anywhere in the application.
  - People run a command by name, such as one that has no visible control or a shortcut they don't remember.
avoidWhen:
  - text: Choosing a value for a form field from a long list.
    use: Combobox
  - text: A short list of actions behind one control.
    use: Menu
  - text: Searching or filtering the content on the page.
    use: SearchField
  - text: A task with fields and a decision.
    use: Dialog
related:
  - search-trigger
  - dialog
  - menu
  - combobox
  - kbd
  - text-field
  - accessibility
components:
  - CommandPalette
---

# CommandPalette

## Overview

A command palette is a search field over a list, near the top of the window, for jumping to anything by name. The application owns the items, how they are filtered and ranked, and what choosing one does.

```tsx example=GoToDocument

```

Open it from a [SearchTrigger](../components/search-trigger.md), which shows the shortcut, such as <kbd>Ctrl</kbd>+<kbd>K</kbd>, and handles it.

### Run a command

`end` holds a shortcut or a Badge; `hints` show the keys in the footer.

```tsx example=RunCommand

```

## When to use

```tsx do=ShowRecent open caption="Show recent items while the query is empty."

```

```tsx dont=EmptyUntilTyped open caption="An empty list until people type."

```

- Don't make the palette the only way to reach a command.
- Rank the best matches first, and clear the query as the palette closes.

### Content

- Name commands with a verb and what they act on, such as Invite people.
- Use `description` for what tells similar items apart, such as a folder.
- Show key hints only for keys the application handles.

## Anatomy

```tsx anatomy=CommandPaletteAnatomy open

```

1. **Palette** (`env-command-palette`)
2. **Search field** (`env-command-palette-input`, `placeholder`)
3. **Group heading** (`env-command-palette-heading`)
4. **Item** (`env-command-palette-item`, `items`)
5. **Key hints** (`env-command-palette-footer`, `hints`)

Not shown: the message for no matches, `env-command-palette-status`.

## Accessibility

### Keyboard

| Key                                                                       | Action                                              |
| ------------------------------------------------------------------------- | --------------------------------------------------- |
| <kbd>↓</kbd>, <kbd>↑</kbd>                                                | Moves the highlight, wrapping at the ends.          |
| <kbd>Home</kbd>, <kbd>End</kbd>, <kbd>Page Up</kbd>, <kbd>Page Down</kbd> | Moves to the first or last option, or by a page.    |
| <kbd>Enter</kbd>                                                          | Chooses the highlighted option.                     |
| <kbd>Ctrl</kbd>+<kbd>Enter</kbd> or <kbd>Cmd</kbd>+<kbd>Enter</kbd>       | Chooses it with `modifier`, such as to open beside. |
| <kbd>Esc</kbd>                                                            | Closes the palette and returns focus.               |

### envUI provides

- A modal dialog named by `aria-label`, with focus in its search field, kept inside and returned on close.
- The field as a `combobox` over a `listbox`, with the highlighted option as its active descendant.
- A polite count of results as they change.

### You provide

- The shortcut that opens the palette, and a visible control that opens it too.
- An `aria-label`, and the items, filtered and ranked.
- `textValue` for labels that aren't plain text.

## Changelog

- **1.0.0**: Opens from SearchTrigger, which handles the shortcut. Rebuilt on Base UI's autocomplete: `inputValue`, `onInputValueChange`, `onAction` and `closeOnAction` for `query`, `onQueryChange`, `onSelect` and `closeOnSelect`, and `CommandPaletteActionOptions`; items take `description`, `end` and `disabled`; options are list rows; the number of results is announced; `className`, `style`, `ref` and data attributes reach the surface.
- **0.5.0**: CommandPalette, with grouped options, keyboard highlight, modifier selection and key `hints` shown as Kbd keys.
