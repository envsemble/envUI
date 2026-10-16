# Accessibility

## React usage

```tsx
import { Stack, TextField, IconButton } from '@envsemble/envui';
import { ChevronRight } from '@envsemble/envui/icons/ChevronRight';

<Stack>
  <TextField label="Project name" hint="Visible labels stay available while typing." />
  <IconButton icon={<ChevronRight />} aria-label="Next project" />
</Stack>;
```

### Props & contracts

| Name                  | Contract                                                                                                                                            |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Library ownership     | Native control semantics, connected field guidance, keyboard behavior, modal focus and toast announcements                                          |
| Application ownership | Labels, heading structure, reading order, product validation and recovery actions                                                                   |
| Keyboard              | <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> move focus; <kbd>Enter</kbd> activates links; <kbd>Enter</kbd> / <kbd>Space</kbd> activate buttons |
| Focus                 | Text fields recolor their thin border or underline; other controls use the shared 0.125 rem focus ring                                              |
| Motion                | Presses, popups, dialogs, toasts and new content use brief transitions under a quarter second                                                       |
| Reduced motion        | prefers-reduced-motion removes movement and keeps only opacity changes; spinners turn slowly without morphing                                       |
| Transition tokens     | --motion-duration-fast (0.12 s), --motion-duration-medium (0.16 s), --motion-duration-slow (0.24 s)                                                 |
| Shared easing         | --motion-ease for state changes; --motion-ease-enter and --motion-ease-exit for elements entering/leaving                                           |

## Guidelines

- Use <kbd>Tab</kbd> and <kbd>Shift</kbd>+<kbd>Tab</kbd> to move focus. Keep a visible focus indicator and a keyboard order matching the layout. Specific behavior for <kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd> and <kbd>Esc</kbd> belongs to each component.
- Keep motion brief and tied to a state change. Respect reduced motion in application animations too.
- Give controls visible labels and icon actions accessible names. Preserve native form behavior and disabled states.
- Use semantic headings, meaningful links and a keyboard order that follows the visible layout.
- Library components handle their focus, keyboard and announcement behavior. Their own pages document those contracts.
- Validate product content and contrast in both supported themes.

TypeScript declarations provide the complete public API.

## Related topics

- [TextField](../components/text-field.md)
- [Select](../components/select.md)
- [Tabs](../components/tabs.md)
- [Dialog](../components/dialog.md)
- [Toast](../components/toast.md)
