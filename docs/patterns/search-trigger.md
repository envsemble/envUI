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
  - Opening search or a command palette from a sidebar or a header
  - Showing search's keyboard shortcut where people look for it
  - Search as an icon, in a narrow header or a rail
avoidWhen:
  - text: People type the search on the page itself and the results filter in place.
    use: SearchField
  - text: The search itself, with its field and results.
    use: CommandPalette
composes:
  - Button
  - IconButton
  - Kbd
  - useModifierKey
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

A secondary [Button](../components/button.md) with the shortcut's keys at its far end reads like a search field. Pressing it, or the shortcut, opens a [CommandPalette](../components/command-palette.md).

```tsx example=InSidebar

```

### The shortcut

<kbd>⌘</kbd>+<kbd>K</kbd> on Apple platforms and <kbd>Ctrl</kbd>+<kbd>K</kbd> elsewhere opens the same search as the button, from anywhere in the window, text fields included. A key press that something else already handled, such as an editor's own shortcut, is left alone.

## Variants

### Icon only

Search is a ghost [IconButton](../components/button.md) named Search, with the label and the keys in a [Tooltip](../components/tooltip.md) that opens below it, clear of the header.

```tsx example=IconOnly

```

## When to use

### Labels

```tsx do=ButtonLabel caption="Search, or what it searches where there are several."

```

```tsx dont=TypingLabel caption="A placeholder's words: people expect to type, but it is a button."

```

## Anatomy

```tsx anatomy=SearchTriggerAnatomy

```

1. **Trigger** (`env-button`)
2. **Icon** (`env-button > env-icon`, `startIcon`)
3. **Label** (`env-button::text`)
4. **Keys** (`env-button-end`, `end`)

Not shown: the icon-only trigger, an icon button with a tooltip.

## Adapting to width

It fills its container, such as the top of a navigation drawer, with the icon and label at the start and the keys at the end. Keep the label short in a narrow sidebar, and where even that doesn't fit, show the icon alone.

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
- The keys in the end slot, in the button's content color on every variant, and the tooltip's keys, as Kbd.

### You provide

- `onClick`, which opens the search, and the shortcut's listener, which opens the same one.
- `aria-keyshortcuts` for the platform, `` `${modifier.key}+K` `` from `useModifierKey()`, and `aria-hidden` on the keys it shows, so the shortcut is announced once.
- Focus on the search when it opens, and back on the trigger when it closes, which CommandPalette does.

## In code

### Usage

The trigger is a Button with `variant="secondary"`, the Search icon as its `startIcon`, and a Kbd of the keys in its `end` slot, with `aria-hidden` on the Kbd and `aria-keyshortcuts` on the button, so the shortcut is announced once. Its `onClick` opens the CommandPalette. With `fullWidth` it fills its container, such as a Drawer's `header`.

```tsx source=InSidebar

```

#### The shortcut

The application listens for the shortcut once, at its root, however many triggers show it, and opens the same search the button does. It skips an event whose `defaultPrevented` is set, so an editor's own shortcut is left alone.

`useModifierKey()` gives the platform's modifier: its `key`, `Meta` or `Control`, for `aria-keyshortcuts` and the listener, and its `label`, ⌘ or Ctrl, for Kbd. It is Ctrl on the server and while the page hydrates, so server-rendered markup matches, and becomes ⌘ on Apple platforms right after. Don't read `navigator` while rendering: it doesn't exist on the server, and markup that differs from the server's fails to hydrate.

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

In a narrow header, the trigger is an IconButton with `variant="ghost"`, `aria-label="Search"` and the same `aria-keyshortcuts`, inside a Tooltip with `side="bottom"` whose `content` holds the label and the Kbd.

```tsx source=IconOnly

```

### Composition

The parts are the button, `env-button`, its icon, `env-button > env-icon`, its label, `env-button::text`, and the keys in its end slot, `env-button-end`. The icon-only trigger is an `env-icon-button` with a tooltip.

## Changelog

- **1.0.0**: The search trigger is a pattern built from Button, with its new `end` slot for the keys, and IconButton, in place of the SearchTrigger component.
