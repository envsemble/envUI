---
title: Kbd
summary: Key caps that show a key, or keys pressed together joined by plus, in text, hints and menus.
status: stable
since: 0.5.0
category: Content & guidance
aliases:
  - keyboard
  - keyboard key
  - key
  - key cap
  - keycap
  - shortcut
  - keyboard shortcut
  - hotkey
  - key combination
useWhen:
  - A key or a shortcut named in text
  - Hints of the keys a list or a popup handles
avoidWhen:
  - text: The shortcut of a menu item, which also needs to reach assistive technology.
    use: Menu
  - text: Key hints in the footer of a quick-open dialog.
    use: CommandPalette
  - text: Code, a command or a file name in text.
    use: Code
components:
  - Kbd
  - useModifierKey
statuses:
  useModifierKey: beta
---

# Kbd

## Overview

```tsx example=ShortcutsInText

```

```tsx example=KeyHints caption="Key hints under a list."

```

## When to use

```tsx do=ShortcutSequence caption="A sequence as one Kbd per step, with then between them."

```

```tsx dont=SequenceAsOne caption="A sequence as one combination: it reads as four keys pressed at once."

```

### Real shortcuts only

Show only shortcuts the application handles.

### Content

Write keys as the keyboard names them: <kbd>Ctrl</kbd>, <kbd>Shift</kbd>, <kbd>Esc</kbd>, <kbd>F2</kbd>, capital letters, and <kbd>←</kbd>, <kbd>→</kbd>, <kbd>↑</kbd>, <kbd>↓</kbd>. Use the names of the reader's platform, such as <kbd>⌘</kbd> on Apple keyboards.

```tsx example=PlatformKeys

```

## Anatomy

```tsx anatomy=KbdAnatomy

```

1. **Combination** (`env-kbd-combination`, `keys`)
2. **Key cap** (`env-kbd`)
3. **Separator** (`env-kbd-separator`)

## Accessibility

### envUI provides

- Native `<kbd>`: one per key, and one around a combination.
- The + as text, so a combination reads as written, such as <kbd>Ctrl</kbd>+<kbd>P</kbd>.
- No focus and no role: keys read as part of their sentence.

### You provide

- The shortcut itself.
- `aria-keyshortcuts` on the control it triggers, where envUI doesn't set it.

## In code

### Usage

A Kbd's children are one key. `keys` shows keys pressed together, such as `['Ctrl', 'P']`: one key cap each, joined by +, inside an outer `<kbd>`. A sequence is one Kbd per step, with words such as then between them. Kbd only shows keys: the application handles the shortcut, and sets `aria-keyshortcuts` on the control it triggers where envUI doesn't. Markdown renders `<kbd>` as Kbd.

```tsx source=ShortcutSequence

```

#### The platform's modifier

`useModifierKey()` gives the shortcut modifier of the reader's platform: its `label`, ⌘ or Ctrl, and its `key`, `Meta` or `Control`, for `aria-keyshortcuts`. It is Ctrl on the server and while the page hydrates, then ⌘ on Apple platforms, so server-rendered markup hydrates; don't read `navigator` while rendering.

```tsx source=PlatformKeys

```

### Composition

The parts are the combination, `env-kbd-combination`, an outer `<kbd>` around the keys, each key cap, `env-kbd`, and the separator between them, `env-kbd-separator`, the + as text.

## Changelog

- **1.0.0**: `useModifierKey()`, the platform's shortcut modifier, safe to render on the server. The page is `kbd`, after the component.
- **0.5.0**: Kbd, for a key or, with `keys`, keys pressed together; Markdown renders `<kbd>` as Kbd.
