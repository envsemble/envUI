---
title: Kbd
summary: Key caps for shortcuts in text, menus and hints.
status: beta
since: 0.5.0
category: Content & guidance
aliases:
  - keyboard
  - keyboard key
  - key
  - shortcut
  - keycap
  - hotkey
related:
  - menu
  - command-palette
  - accessibility
components:
  - Kbd
---

# Kbd

## React usage

```tsx
import { Kbd, Text } from '@envsemble/envui';

<Text>
  Press <Kbd keys={['Ctrl', 'P']} /> to open a document, or <Kbd>F2</Kbd> to rename it.
</Text>;
```

### Props & contracts

| Name         | Contract                                                             |
| ------------ | -------------------------------------------------------------------- |
| children     | One key, such as <kbd>F2</kbd> or <kbd>Esc</kbd>                     |
| keys         | A combination such as `['Ctrl', 'P']`, shown as key caps joined by + |
| Native props | className, title, ref and other kbd attributes                       |

## Guidelines

- Use Kbd in text, tooltips, menus and palette footers to show the keys of a shortcut the application handles. Kbd only displays keys.
- A combination renders nested kbd elements, so assistive technology reads each key and the plus between them.
- Write keys as people see them on their keyboard, and show the system's own names, such as the Command key <kbd>⌘</kbd> on systems that use it.
- Menu items show shortcuts through their shortcut prop instead.
- In Markdown, write keys as `<kbd>Ctrl</kbd>`; Markdown renders them as Kbd.

TypeScript declarations provide the complete public API.

## Related topics

- [Menu](../components/menu.md)
- [CommandPalette](../components/command-palette.md)
- [Accessibility](../foundations/accessibility.md)
