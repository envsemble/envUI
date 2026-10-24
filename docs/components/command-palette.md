---
title: CommandPalette
summary: A quick-open dialog near the top of the window that finds a document, a page, a person or a command by name.
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
  - ⌘K
  - spotlight
  - go to anything
  - jump to
  - omnibox
  - SearchTrigger
  - SearchButton
  - search trigger
  - search button
  - quick open button
  - command palette button
  - search shortcut
useWhen:
  - Jumping to a document, a page or a person by name, from anywhere
  - Running a command by name, such as one without a visible control
  - A search button at the top of the navigation or in the top bar, with its shortcut
avoidWhen:
  - text: Choosing a value for a form field from a long list.
    use: Combobox
  - text: A short list of actions behind one control.
    use: Menu
  - text: Searching or filtering the content on the page.
    use: SearchField
components:
  - CommandPalette
---

# CommandPalette

## Overview

```tsx example=GoToDocument

```

### Run a command

An item can end with its shortcut or a badge, and hints below the list say what keys do.

```tsx example=RunCommand

```

### Opening it: the button and the shortcut

A secondary [Button](button.md) with the search icon, its label and the shortcut's keys at its far end reads like a search field. Pressing it, or <kbd>⌘</kbd>+<kbd>K</kbd> on Apple platforms and <kbd>Ctrl</kbd>+<kbd>K</kbd> elsewhere, opens the palette from anywhere in the window, text fields included.

```tsx example=InSidebar

```

### In a narrow header

Search is an icon button named Search, with its label and keys in a [Tooltip](tooltip.md) that opens below it.

```tsx example=IconOnly

```

## When to use

```tsx do=ShowRecent open caption="Show recent items while the query is empty."

```

```tsx dont=EmptyUntilTyped open caption="An empty list until people type."

```

```tsx do=ButtonLabel caption="Label the button Search, or what it searches where there are several."

```

```tsx dont=TypingLabel caption="A placeholder's words on the button: people expect to type in it."

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

## Adapting to width

The button that opens it fills its container, such as the top of a drawer. Keep its label short in a narrow sidebar, and where even that doesn't fit, show the icon alone.

```tsx example=NarrowSidebar widths="11 18"

```

## Accessibility

### Keyboard

| Key                                                                       | Action                                                               |
| ------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| <kbd>⌘</kbd>+<kbd>K</kbd>, or <kbd>Ctrl</kbd>+<kbd>K</kbd>                | Opens the palette from anywhere in the window.                       |
| <kbd>↓</kbd>, <kbd>↑</kbd>                                                | Moves the highlight, wrapping at the ends.                           |
| <kbd>Home</kbd>, <kbd>End</kbd>, <kbd>Page Up</kbd>, <kbd>Page Down</kbd> | Moves to the first or last option, or by a page.                     |
| <kbd>Enter</kbd>                                                          | Chooses the highlighted option.                                      |
| <kbd>Ctrl</kbd>+<kbd>Enter</kbd> or <kbd>Cmd</kbd>+<kbd>Enter</kbd>       | Chooses it another way the application sets, such as to open beside. |
| <kbd>Esc</kbd>                                                            | Closes the palette and returns focus.                                |

### envUI provides

- A modal dialog named by `aria-label`, with focus in its search field, kept inside and returned on close.
- The field as a `combobox` over a `listbox`, with the highlighted option as its active descendant.
- A polite count of results as they change.
- For the button that opens it, a native `button` named by its label, or by `aria-label` when it shows only its icon, and the keys as Kbd, in the button's content color on every variant.

### You provide

- The shortcut that opens the palette, and a visible control that opens it too.
- `aria-keyshortcuts` on that control for the platform, `` `${modifier.key}+K` `` from `useModifierKey()`, and `aria-hidden` on the keys it shows, so the shortcut is announced once.
- An `aria-label`, and the items, filtered and ranked.
- `textValue` for labels that aren't plain text.

## In code

### Usage

The application owns the items and what choosing one does. It opens the palette with `open`, such as from a shortcut and from a visible control, and closes it from `onOpenChange`, which receives false when <kbd>Esc</kbd>, a press on the backdrop or a choice closes it. It filters and ranks the `items` itself, from the text in `inputValue` and `onInputValueChange`, and clears that text as the palette closes. `onAction` runs the chosen item, and `closeOnAction`, true by default, closes the palette after it. `aria-label` names the dialog, its search field and its list; `placeholder` shows in the empty field, and `emptyLabel` in place of the list when there are no items.

```tsx source=GoToDocument

```

#### Items

Each CommandPaletteItem has an `id` and a `label`, with `textValue` for a label that isn't plain text. `description` is muted text under the label, such as a folder; `icon` a decorative icon before it; `end` content at the end, such as a Kbd shortcut or a Badge; and `disabled` shows an item that can't be chosen. `group` names its group, whose heading shows where the group changes between items, such as Recently opened while the query is empty.

#### Commands and key hints

`onAction` receives the item and `{ modifier }`, true while <kbd>Ctrl</kbd> or <kbd>Cmd</kbd> was held, such as to open beside. `hints` show keys below the list as Kbd, such as `{ keys: ['Enter'], label: 'Open' }`, and `footer` holds other content after them.

```tsx source=RunCommand

```

#### The button that opens it

The button is a Button with `variant="secondary"`, the Search icon as its `startIcon`, and a Kbd of the keys in its `end` slot, with `aria-hidden` on the Kbd and `aria-keyshortcuts` on the button, so the shortcut is announced once. Its `onClick` opens the palette. With `fullWidth` it fills its container, such as a Drawer's `header`.

```tsx source=InSidebar

```

#### The shortcut

The application listens for the shortcut once, at its root, however many buttons show it, and opens the same palette the button does. It skips an event whose `defaultPrevented` is set, so a key press that something else already handled, such as an editor's own shortcut, is left alone.

`useModifierKey()`, on [Kbd's page](kbd.md), gives the platform's modifier: its `key`, `Meta` or `Control`, for `aria-keyshortcuts` and the listener, and its `label`, ⌘ or Ctrl, for Kbd. It is Ctrl on the server and while the page hydrates, so server-rendered markup matches, and becomes ⌘ on Apple platforms right after. Don't read `navigator` while rendering: it doesn't exist on the server, and markup that differs from the server's fails to hydrate.

```tsx
const modifier = useModifierKey();

useEffect(() => {
  const onKeyDown = (event: KeyboardEvent) => {
    const pressed =
      modifier.key === 'Meta' ? event.metaKey && !event.ctrlKey : event.ctrlKey && !event.metaKey;
    if (event.defaultPrevented || !pressed || event.altKey || event.shiftKey) return;
    if (event.key.toLowerCase() !== 'k') return;
    event.preventDefault();
    setSearchOpen((open) => !open);
  };
  addEventListener('keydown', onKeyDown);
  return () => removeEventListener('keydown', onKeyDown);
}, [modifier.key]);
```

#### Icon only

In a narrow header, the button is an IconButton with `variant="ghost"`, `aria-label="Search"` and the same `aria-keyshortcuts`, inside a Tooltip with `side="bottom"` whose `content` holds the label and the Kbd.

```tsx source=IconOnly

```

### Composition

The palette is `env-command-palette`: its search field, `env-command-palette-input`, the group headings, `env-command-palette-heading`, the items, `env-command-palette-item`, the key hints in `env-command-palette-footer`, and the message for no matches, `env-command-palette-status`. `className`, `style`, `ref` and data attributes reach the surface.

The button that opens it is Button's: `env-button`, its icon, `env-button > env-icon`, its label, and the keys in its end slot, `env-button-end`. The icon-only button is an `env-icon-button` in a tooltip.

## Changelog

- **1.0.0-prerelease.3**: The search trigger pattern is part of this page, as the button and the shortcut that open the palette; the pattern's address opens it.
- **1.0.0**: Opens from a Button with the shortcut's keys in its new `end` slot, in place of the SearchTrigger component. Rebuilt on Base UI's autocomplete: `inputValue`, `onInputValueChange`, `onAction` and `closeOnAction` for `query`, `onQueryChange`, `onSelect` and `closeOnSelect`, and `CommandPaletteActionOptions`; items take `description`, `end` and `disabled`; options are list rows; the number of results is announced; `className`, `style`, `ref` and data attributes reach the surface.
- **0.5.0**: CommandPalette, with grouped options, keyboard highlight, modifier selection and key `hints` shown as Kbd keys.
