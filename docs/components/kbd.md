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
  - Text names a key or a shortcut, such as "Press Ctrl+P to open a document".
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
related:
  - menu
  - command-palette
  - code
  - markdown
  - accessibility
components:
  - Kbd
---

# Kbd

## Overview

Kbd shows a keyboard key as a key cap: a small, bordered label with a heavier bottom edge that sits on the baseline of the text around it. With `keys` it shows keys pressed together, such as Ctrl+P, as one key cap each, joined by a plus. Kbd only shows keys; the application handles the shortcut.

```tsx example=ShortcutsInText

```

## Anatomy

1. **Key cap** (`children`, or each entry of `keys`): a native `<kbd>` with a hairline border in the strong border color, a 0.125 rem bottom edge, 0.3125 rem corners and the neutral fill.
2. **Separator** (with `keys`): a muted + between two keys, in the small body type.
3. **Combination** (with `keys`): an outer `<kbd>` around the keys and their separators, which keeps them on one line.

## Variants and sizes

- A key cap is 1.375 rem tall and at least 1.375 rem wide, with 0.3125 rem inline padding and a 0.75 rem label in medium weight; a longer label, such as Shift, widens it. Labels don't wrap.
- The label sits on the baseline of the surrounding text, so keys line up in a sentence whatever glyphs they show, and a combination lines up the same way.
- In the shortcut of a menu item, keys are 1.125 rem tall with 0.6875 rem labels in the muted text color.
- A container whose fill the key caps don't suit sets custom properties on its own element: `--env-kbd-fg` for the label and the separator, `--env-kbd-bg` for the fill and `--env-kbd-border` for the edge. A tooltip uses them for key caps on its dark fill.

## States and behaviour

- Kbd has no states of its own: it is not focusable and doesn't respond to the pointer or the keyboard.
- `keys` renders the keys in their order, with a + before each key but the first. Without `keys`, the children are one key.
- Other components show their keys with Kbd: Menu.Item's `shortcut`, CommandPalette's `hints` and Markdown, where `<kbd>Ctrl</kbd>` around plain text renders as a key cap.

## Content guidelines

- Write each key as it reads on the keyboard: Ctrl, Shift, Alt, Esc, Enter, Tab, F2, and letters as capitals, such as P.
- Write arrows as ←, →, ↑ and ↓, and keep the order of modifiers people know, such as Ctrl+Shift+P.
- Use the names of the reader's platform where they differ, such as ⌘ instead of Ctrl on Apple keyboards; Kbd shows what it is given.
- Say what the shortcut does in the text around it: "Press F2 to rename it", not "F2: rename".

## Do and don't

### Do

- Show only shortcuts the application handles.
- Use `keys` for keys pressed together, so each key is its own cap.
- Show a sequence of shortcuts as one Kbd per step, with "then" between them.

### Don't

- Don't put a sequence in one `keys` list: Ctrl+K+W reads as three keys pressed at once.
- Don't add a shortcut to a menu item with Kbd; use Menu.Item's `shortcut`, which also sets `aria-keyshortcuts`.
- Don't use Kbd for code, commands or file names; use [Code](../components/code.md).
- Don't make a key hint the only way to learn that an action exists.

## Accessibility

### envUI provides

- Native `<kbd>` elements: one for each key, and an outer `<kbd>` around the keys of a combination, as HTML marks up keys pressed together.
- The + between keys as text, so assistive technology reads a combination as it is written, such as "Ctrl+P".
- Key caps that are not focusable and add no role, so they read as part of the sentence around them.
- Labels in the primary text color on the neutral fill, with a border in the strong border color.

### You provide

- The shortcut itself: Kbd doesn't bind keys.
- `aria-keyshortcuts` on a control that has a shortcut, where envUI doesn't set it, as Menu.Item's `shortcut` does.
- Text around the keys that says what they do.

## Examples

### Key hints

A footer that names the keys a list handles, one hint after another.

```tsx example=KeyHints

```

### A sequence of shortcuts

Each step of a sequence is a Kbd of its own, with "then" between them; `keys` is only for keys pressed together.

```tsx example=ShortcutSequence

```

### The reader's platform

Apple keyboards name the Command key where others use Ctrl. Pass the keys of the reader's platform; Kbd shows what it is given.

```tsx example=PlatformKeys

```

## Changelog

- **1.0.0**: The page is `kbd`, after the component.
- **0.5.0**: Kbd, for a key or, with `keys`, keys pressed together; Markdown renders `<kbd>` as Kbd.
