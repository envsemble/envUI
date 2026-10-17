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

SearchTrigger is the button that opens an application's search or command palette. It looks like a search field, with the search icon, its label and the shortcut's keys at the end, but it is a button: the application opens the search from `onClick`. It listens for its shortcut across the window, `mod+k` by default, which is ⌘K on Apple platforms and Ctrl+K elsewhere, and presses itself.

Here a trigger fills the width at the top of a sidebar and opens a [CommandPalette](../components/command-palette.md).

```tsx example=InSidebar

```

## Anatomy

1. **Trigger**: a secondary [Button](../components/button.md), `fullWidth` where it fills its container, with its content at the start.
2. **Icon**: Search, before the label.
3. **Label** (`label`): "Search" by default; it truncates in a narrow container.
4. **Keys** (`shortcut`): the shortcut as [Kbd](../components/kbd.md) keys at the inline end, quieter than the label.

The icon-only trigger is a ghost IconButton with a [Tooltip](../components/tooltip.md) that shows the label and the keys.

## Variants and sizes

| Form                   | Use for                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------- |
| Labelled (the default) | The top of a sidebar or a header with room: it reads as search and shows the shortcut.      |
| Icon only (`iconOnly`) | A phone's top bar, a crowded header or a sidebar showing icons only, where it is automatic. |

- It takes the control height of its container, md unless the container sets another, or `size`.
- Inside a sidebar that shows icons only, the trigger shows only its icon and its tooltip opens at the inline end, as the navigation's do; `iconOnly` and `tooltipSide` override them.

## States and behaviour

- **Shortcut**: the trigger presses itself when its shortcut is pressed anywhere in the window, also in a text field, so `onClick` is the one place the application opens search. `shortcut={false}` shows and handles no shortcut.
- **Keys shown**: on Apple platforms ⌘ and K, elsewhere Ctrl and K. The server and the first render show the Ctrl form, and the browser's platform replaces it after hydration, so the markup matches.
- **One trigger per shortcut**: several triggers can listen for the same shortcut, such as one in a sidebar and one in a phone's top bar. The most recently mounted trigger that is visible takes the key, so a hidden one never does. `listen={false}` keeps a trigger from listening while it still shows the keys, for a second trigger whose search another one opens.
- **Keys handled elsewhere**: a key press that something already handled, which called `preventDefault()`, such as an editor's own ⌘K for a link, is left alone. Held keys don't repeat the press.
- **Disabled**: a disabled trigger can't be pressed, by pointer or by its shortcut.

## Content guidelines

- Keep the default "Search", or name what it searches where the application has several, such as "Search documents".
- Use one shortcut for search across the application, and the platform's usual one, ⌘K or Ctrl+K.

## Do and don't

### Do

- Open search from `onClick` alone, and let the trigger handle its shortcut.
- Pass `listen={false}` to a second trigger for the same search, such as the icon in a phone's top bar.
- Pair it with [CommandPalette](../components/command-palette.md), and return focus to the trigger when the palette closes.

### Don't

- Don't add a window keydown listener for the same shortcut beside the trigger; two handlers would open search twice.
- Don't use it as a field people type into; use [SearchField](../components/text-field.md).
- Don't choose a shortcut that a focused editor or field needs, such as ⌘B for bold.

## Accessibility

### Keyboard

| Key                                  | Action                                                               |
| ------------------------------------ | -------------------------------------------------------------------- |
| <kbd>Tab</kbd>                       | Moves focus to the trigger, in the page's order.                     |
| <kbd>Enter</kbd> or <kbd>Space</kbd> | Presses the trigger.                                                 |
| <kbd>⌘</kbd>+<kbd>K</kbd>            | On Apple platforms, presses the trigger from anywhere in the window. |
| <kbd>Ctrl</kbd>+<kbd>K</kbd>         | On other platforms, presses the trigger from anywhere in the window. |
| <kbd>Esc</kbd>                       | Closes the icon-only trigger's tooltip while it has focus.           |

### envUI provides

- A native `button`, named by its label, also when it shows only its icon.
- `aria-keyshortcuts` with the shortcut for the platform, such as `Meta+K` or `Control+K`; the keys it shows are hidden from assistive technology, which reads the attribute.
- One handler per shortcut across the window, which skips keys something else handled.

### You provide

- `onClick`, which opens the search.
- Focus on the search when it opens, and back on the trigger when it closes, which CommandPalette and Dialog do.

## Examples

### Icon only

In a narrow header, the trigger shows only its icon, with the label and the keys in its tooltip. It doesn't listen, since the sidebar's trigger already opens the same search.

```tsx example=IconOnly

```

## Changelog

- **1.0.0**: SearchTrigger, with the platform's shortcut keys, a shortcut that presses it from anywhere in the window, and an icon-only form.
