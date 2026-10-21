---
title: SearchTrigger
summary: The button that opens search or a command palette, with its ⌘K or Ctrl+K shortcut, as a field-like row or an icon.
status: beta
since: 1.0.0
category: Actions
aliases:
  - SearchButton
  - quick open button
  - search button
  - command palette button
  - search shortcut
useWhen:
  - Search or a command palette opens from a button at the top of a sidebar or in a header.
  - The application opens search with a keyboard shortcut and shows it where people look for search.
  - A narrow header or a sidebar showing icons only needs search as an icon.
avoidWhen:
  - text: People type the search on the page itself and the results filter in place.
    use: SearchField
  - text: The search itself, with its field and results.
    use: CommandPalette
related:
  - command-palette
  - text-field
  - kbd
  - button
  - app-shell
components:
  - SearchTrigger
---

# SearchTrigger

## Overview

SearchTrigger is the button that opens an application's search. It looks like a search field and presses itself on its shortcut, ⌘K on Apple platforms and Ctrl+K elsewhere, so `onClick` is the one place search opens.

```tsx example=InSidebar

```

### One trigger per shortcut

The most recently mounted trigger that is visible takes the key, never one behind a modal dialog. `listen={false}` keeps a second trigger for the same search quiet, and a key something else handled is left alone.

## Variants

```tsx example=IconOnly

```

| Form                   | Use for                                                      |
| ---------------------- | ------------------------------------------------------------ |
| Labelled               | A sidebar or a header with room. The default.                |
| Icon only (`iconOnly`) | A phone's top bar, a crowded header or an icon-only sidebar. |

It takes its container's control height unless `size` sets one.

## When to use

```tsx do=UsualShortcut caption="The platform's usual shortcut for search."

```

```tsx dont=EditorShortcut caption="A shortcut that editors need, such as Ctrl+B for bold."

```

- Don't add a keydown listener of your own for the same shortcut: search would open twice.

### Labels

```tsx do=ButtonLabel caption="Search, or what it searches where there are several."

```

```tsx dont=TypingLabel caption="A placeholder's words: people expect to type, but it is a button."

```

## Anatomy

```tsx anatomy=SearchTriggerAnatomy

```

1. **Trigger** (`env-search-trigger`)
2. **Icon** (`env-search-trigger > env-icon`)
3. **Label** (`env-search-trigger-label`, `label`)
4. **Keys** (`env-search-trigger-shortcut`, `shortcut`)

The icon-only trigger adds a tooltip, `env-search-trigger-tooltip`.

## Adapting to width

With `fullWidth` it fills its container, and the label ends with an ellipsis where it doesn't fit.

```tsx example=NarrowSidebar widths="11 18"

```

## Accessibility

### Keyboard

| Key                                                        | Action                                  |
| ---------------------------------------------------------- | --------------------------------------- |
| <kbd>Tab</kbd>                                             | Moves focus to the trigger.             |
| <kbd>Enter</kbd>, <kbd>Space</kbd>                         | Presses it.                             |
| <kbd>⌘</kbd>+<kbd>K</kbd>, or <kbd>Ctrl</kbd>+<kbd>K</kbd> | Presses it from anywhere in the window. |
| <kbd>Esc</kbd>                                             | Closes the icon-only trigger's tooltip. |

### envUI provides

- A native `button` named by its label, also when it shows only its icon.
- `aria-keyshortcuts` for the platform; the keys it shows are hidden.

### You provide

- `onClick`, which opens the search.
- Focus on the search when it opens, and back on the trigger when it closes, which CommandPalette does.

## Changelog

- **1.0.0**: SearchTrigger, with the platform's shortcut keys, a shortcut that presses it from anywhere in the window, and an icon-only form.
