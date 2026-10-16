---
title: CommandPalette
summary: A quick-open dialog near the top of the window, with a search field over a list the application filters and ranks.
status: beta
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

A command palette is a modal dialog near the top of the window: a search field over a list of options. People type, move the highlight with the arrow keys and choose with <kbd>Enter</kbd> or a click, while focus stays in the field. The application owns everything else: the shortcut that opens it, the items, how they are filtered and ranked, and what choosing one does.

```tsx example=GoToDocument

```

## Anatomy

1. **Backdrop**: the dialog backdrop over the page; a press on it closes the palette.
2. **Surface**: the raised surface Dialog and Popover share, up to 40 rem wide, with 0.5 rem padding and 1.75 rem corners.
3. **Search field**: a pill with a search icon and the text input, named by `aria-label`, with the `placeholder` while empty.
4. **Group heading** (an item's `group`): a small heading where the group changes between consecutive items.
5. **Option** (each entry of `items`): an optional `icon`, the `label`, a muted `detail` and `trailing` content, such as a Kbd shortcut or a Badge, at its end.
6. **Empty message** (`emptyLabel`): shown in place of the list when there are no items; No results by default.
7. **Footer** (`hints`, `footer`): key hints as Kbd keys with what they do, then other content.

## Variants and sizes

- The palette is up to 40 rem wide and fills narrower windows less the window gutter; it sits up to 6 rem, or 12% of the window, below the top.
- The search field is as tall as a control. Options are at least 2.5 rem tall, and 2.75 rem on touch screens, with rounded corners inset by the surface's padding.
- The list scrolls beyond 60% of the window's height, keeping the highlighted option in view.

## States and behaviour

- **Opening and closing**: `open` and `onOpenChange` control the palette. It opens over a backdrop in the theme of the page around it, with focus in the search field; <kbd>Esc</kbd>, a press on the backdrop and, unless `closeOnSelect` is false, choosing an option call `onOpenChange(false)`, and focus returns to where it was.
- **Searching**: `query` and `onQueryChange` hold the text. A new query, and opening the palette, highlight the first item again.
- **Highlight**: the arrow keys move the highlight and wrap at the ends; <kbd>Home</kbd> and <kbd>End</kbd> reach the first and last option, and <kbd>Page Up</kbd> and <kbd>Page Down</kbd> move by a page of options. The pointer highlights the option it moves over.
- **Choosing**: <kbd>Enter</kbd> or a click calls `onSelect` with the item; with <kbd>Ctrl</kbd> or <kbd>Cmd</kbd> held, `modifier` is true, such as to open a document beside the current one. Pressing an option leaves focus in the field.
- **Groups**: items with the same `group` next to each other form a labelled group under one heading; keep a group's items together.
- **Input methods**: keys that belong to an input method's composition don't move the highlight or choose.

## Content guidelines

- Name the palette after what it finds or does, with `aria-label`: "Go to document", "Run a command".
- Write a placeholder that says what can be searched: "Search documents by name or folder".
- Name commands with a verb and what they act on: "Invite people", "Open settings".
- Use `detail` for what tells similar items apart, such as a folder, and `emptyLabel` for what to try next: "No matching documents".
- Show key hints only for keys the palette or the application handles.

## Do and don't

### Do

- Open the palette with a shortcut the application handles, such as <kbd>Ctrl</kbd>+<kbd>K</kbd>, and from a visible control too.
- Rank the best matches first, and show recent items while the query is empty.
- Clear the query as the palette closes, so it opens fresh.
- Use `textValue` where an item's label isn't plain text.

### Don't

- Don't put fields or buttons inside options; an option is chosen as a whole.
- Don't make the palette the only way to reach a command.
- Don't show more groups than people can scan; let the query narrow them.

## Accessibility

### Keyboard

| Key                                                                 | Action                                                                    |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Typing                                                              | Changes the query; the first item is highlighted again.                   |
| <kbd>↓</kbd>, <kbd>↑</kbd>                                          | Moves the highlight to the next or previous option, wrapping at the ends. |
| <kbd>Home</kbd>, <kbd>End</kbd>                                     | Moves the highlight to the first or last option.                          |
| <kbd>Page Down</kbd>, <kbd>Page Up</kbd>                            | Moves the highlight by a page of options.                                 |
| <kbd>Enter</kbd>                                                    | Chooses the highlighted option.                                           |
| <kbd>Ctrl</kbd>+<kbd>Enter</kbd> or <kbd>Cmd</kbd>+<kbd>Enter</kbd> | Chooses the highlighted option with `modifier`.                           |
| <kbd>Esc</kbd>                                                      | Closes the palette and returns focus to where it was.                     |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>                     | Stay in the dialog, which keeps focus while it is open.                   |

### envUI provides

- A modal dialog named by `aria-label`, which takes focus into its search field, keeps it inside and returns it on close.
- The search field as a `combobox` that controls the `listbox`, with `aria-expanded` while there are options and the highlighted option as its active descendant, so focus never leaves the field.
- Options with `aria-selected` on the highlighted one, named by their content or by `textValue`, in groups named by their headings; decorative icons hidden from assistive technology.
- The empty message as a status, and key hints as Kbd keys.

### You provide

- The shortcut that opens the palette, and a visible control that opens it too.
- An `aria-label` that names the palette, and the items, filtered and ranked.
- What choosing an item does, and `textValue` for labels that aren't plain text.

## Examples

### Run a command

Commands with shortcuts as Kbd keys and a Badge as trailing content, under one group, with a footer.

```tsx example=RunCommand

```

## Changelog

- **0.5.0**: CommandPalette, with grouped options, keyboard highlight, modifier selection and key `hints` shown as Kbd keys.
