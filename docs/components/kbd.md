---
title: Kbd
summary: Key caps that show a key, or keys pressed together.
status: stable
since: 1.0.0
category: Text & content
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
examples:
  ShortcutsInText: overview
  KeyHints:
    role: overview
    caption: Key hints under a list.
  KbdAnatomy: anatomy
  PlatformKeys: example
  Sequences: example
---

# Kbd

## Anatomy

```tsx figure=KbdAnatomy

```

1. **Combination** (`env-kbd-combination`, `keys`)
2. **Key cap** (`env-kbd`)
3. **Separator** (`env-kbd-separator`)

## Behaviour

### Keys of each operating system

```tsx figure=PlatformKeys

```

### Sequences and joined keys

```tsx figure=Sequences

```
