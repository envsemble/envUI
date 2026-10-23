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
  - Text names a key or a shortcut, such as "Press <kbd>Ctrl</kbd>+<kbd>P</kbd> to open a document".
  - A hint lists the keys a list or a popup handles, such as a footer that says which keys move, open and close.
avoidWhen:
  - text: The shortcut of a menu item, which also needs to reach assistive technology.
    use: Menu
  - text: Key hints in the footer of a quick-open dialog.
    use: CommandPalette
  - text: Code, a command or a file name in text.
    use: Code
  - text: A status or a count beside a label.
    use: Badge
components:
  - Kbd
---

# Kbd

## Overview

Kbd shows a key as a key cap, or with `keys`, keys pressed together. It only shows them: the application handles the shortcut.

```tsx example=ShortcutsInText

```

```tsx example=KeyHints caption="Key hints under a list."

```

## When to use

```tsx do=ShortcutSequence caption="A sequence as one Kbd per step, with then between them."

```

```tsx dont=SequenceAsOne caption="A sequence in one keys list: it reads as four keys pressed at once."

```

- Show only shortcuts the application handles.
- In a menu, use Menu.Item's `shortcut`, which also sets `aria-keyshortcuts`.

### Content

Write keys as the keyboard names them: <kbd>Ctrl</kbd>, <kbd>Shift</kbd>, <kbd>Esc</kbd>, <kbd>F2</kbd>, capital letters, and <kbd>←</kbd>, <kbd>→</kbd>, <kbd>↑</kbd>, <kbd>↓</kbd>. Pass the names of the reader's platform, such as <kbd>⌘</kbd> on Apple keyboards.

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

## Changelog

- **1.0.0**: The page is `kbd`, after the component.
- **0.5.0**: Kbd, for a key or, with `keys`, keys pressed together; Markdown renders `<kbd>` as Kbd.
