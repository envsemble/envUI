# Accessibility

## React usage

```tsx
import { Column, IconButton, TextField } from '@envsemble/envui';
import { ChevronRight } from '@envsemble/envui/icons/ChevronRight';

<Column gap={4}>
  <TextField label="Project name" description="Visible labels stay while people type." />
  <IconButton icon={<ChevronRight />} aria-label="Next project" />
</Column>;
```

### Props & contracts

| Name           | Contract                                                                                                                                   |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| envUI provides | Native control semantics, connected field guidance, keyboard behaviour, modal focus and announcements; each component's page lists its own |
| You provide    | Labels and icon action names, headings, reading order, validation messages and recovery actions                                            |
| Focus          | Text fields recolor their border or underline; other controls take the shared 0.125 rem ring                                               |
| Reduced motion | `prefers-reduced-motion` keeps only opacity changes; spinners turn slowly                                                                  |
| Forced colors  | States a fill or shadow carried take system colors, such as Highlight and GrayText; swatches and heatmaps keep theirs                      |

## Guidelines

- Keep the focus indicator visible, and the keyboard order the same as the visible layout.
- Respect reduced motion in the application's own animations, with the `--env-motion-*` tokens.
- Check the application's own content and contrast in both themes.

TypeScript declarations provide the complete public API.

## Related topics

- [TextField](../components/text-field.md)
- [Select](../components/select.md)
- [Tabs](../components/tabs.md)
- [Dialog](../components/dialog.md)
- [Toast](../components/toast.md)
