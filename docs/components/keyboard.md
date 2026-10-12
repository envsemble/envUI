# Keyboard keys

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
| children     | One key, such as F2 or Esc                                           |
| keys         | A combination such as `['Ctrl', 'P']`, shown as key caps joined by + |
| Native props | className, title, ref and other kbd attributes                       |

## Guidelines

- Use Kbd in text, tooltips, menus and palette footers to show the keys of a shortcut the application handles. Kbd only displays keys.
- A combination renders nested kbd elements, so assistive technology reads each key and the plus between them.
- Write keys as people see them on their keyboard, and show the platform's own names, such as Cmd on macOS.
- Menu items show shortcuts through their shortcut prop instead.

TypeScript declarations provide the complete public API.

## Related topics

- [Menus](../components/menu.md)
- [Command palette](../components/command-palette.md)
- [Accessibility](../foundations/accessibility.md)
