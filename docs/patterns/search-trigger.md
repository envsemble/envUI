---
title: Search trigger
summary: The button that opens search or a command palette, with its ⌘K or Ctrl+K shortcut, built from a Button with the search icon, its label and the keys, or an IconButton in a narrow header.
status: beta
since: 1.0.0
intent: Find and navigate
aliases:
  - SearchTrigger
  - SearchButton
  - search trigger
  - quick open button
  - search button
  - command palette button
  - search shortcut
useWhen:
  - Search or a command palette opens from a button at the top of a sidebar or in a header.
  - The application opens search with a keyboard shortcut and shows it where people look for search.
  - A narrow header or a rail needs search as an icon.
avoidWhen:
  - text: People type the search on the page itself and the results filter in place.
    use: SearchField
  - text: The search itself, with its field and results.
    use: CommandPalette
composes:
  - Button
  - IconButton
  - Kbd
  - Tooltip
  - CommandPalette
  - Drawer
  - AvatarButton
  - Box
  - Row
  - Column
  - Text
---

# Search trigger

## Overview

A search trigger is the button that opens an application's search: a secondary [Button](../components/button.md) with the Search icon, its label and the shortcut's keys in a [Kbd](../components/kbd.md) at its `end`, which reads like a search field. Pressing it, or the shortcut, opens a [CommandPalette](../components/command-palette.md).

```tsx example=InSidebar

```

### The shortcut

The application listens for the shortcut once, at its root, and opens the same search the button does: <kbd>⌘</kbd>+<kbd>K</kbd> on Apple platforms and <kbd>Ctrl</kbd>+<kbd>K</kbd> elsewhere, from anywhere in the window, text fields included. A key press that something else already handled, such as an editor's own shortcut, is left alone. The button shows the keys and announces them with `aria-keyshortcuts`.

```tsx
const apple = /mac|iphone|ipad/i.test(navigator.platform);

useEffect(() => {
  const onKeyDown = (event: KeyboardEvent) => {
    const modifier = apple ? event.metaKey && !event.ctrlKey : event.ctrlKey && !event.metaKey;
    if (event.defaultPrevented || !modifier || event.altKey || event.shiftKey) return;
    if (event.key.toLowerCase() !== 'k') return;
    event.preventDefault();
    setSearchOpen((open) => !open);
  };
  addEventListener('keydown', onKeyDown);
  return () => removeEventListener('keydown', onKeyDown);
}, []);
```

## Variants

### Icon only

In a phone's top bar, a crowded header or a [Rail](../components/rail.md), search is a ghost [IconButton](../components/button.md) named Search, with the label and the keys in a [Tooltip](../components/tooltip.md) that opens below it, clear of the bar.

```tsx example=IconOnly

```

## When to use

- One listener for the shortcut, however many triggers show it: two would open search twice.

### Labels

```tsx do=ButtonLabel caption="Search, or what it searches where there are several."

```

```tsx dont=TypingLabel caption="A placeholder's words: people expect to type, but it is a button."

```

## Anatomy

```tsx anatomy=SearchTriggerAnatomy

```

1. **Trigger** (`env-button`, `variant="secondary"`)
2. **Icon** (`env-button > env-icon`, `startIcon`)
3. **Label** (`env-button::text`)
4. **Keys** (`env-button-end`, `end`)

The icon-only trigger is an `env-icon-button` with a tooltip.

## Adapting to width

With `fullWidth` it fills its container, such as the top of a navigation drawer, with the icon and label at the start and the keys at the end. Keep the label short in a narrow sidebar, and where even that doesn't fit, show the icon alone.

```tsx example=NarrowSidebar widths="11 18"

```

## Accessibility

### Keyboard

| Key                                                        | Action                                  |
| ---------------------------------------------------------- | --------------------------------------- |
| <kbd>Tab</kbd>                                             | Moves focus to the trigger.             |
| <kbd>Enter</kbd>, <kbd>Space</kbd>                         | Presses it.                             |
| <kbd>⌘</kbd>+<kbd>K</kbd>, or <kbd>Ctrl</kbd>+<kbd>K</kbd> | Opens search from anywhere in the page. |
| <kbd>Esc</kbd>                                             | Closes the icon-only trigger's tooltip. |

### envUI provides

- A native `button` named by its label, or by `aria-label` when it shows only its icon.
- The keys in the muted end slot, and the tooltip's keys, as Kbd.

### You provide

- `onClick`, which opens the search, and the shortcut's listener, which opens the same one.
- `aria-keyshortcuts` for the platform, `Meta+K` or `Control+K`, and `aria-hidden` on the keys it shows, so the shortcut is announced once.
- Focus on the search when it opens, and back on the trigger when it closes, which CommandPalette does.

## Changelog

- **1.0.0**: The search trigger is a pattern built from Button, with its new `end` slot for the keys, and IconButton, in place of the SearchTrigger component.
