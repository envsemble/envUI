# Segmented controls

## React usage

```tsx
import { SegmentedControl } from '@envsemble/envui';

<SegmentedControl
  aria-label="Work items"
  value={view}
  onValueChange={setView}
  options={[
    { value: 'open', label: 'Open', count: openCount },
    { value: 'blocked', label: 'Blocked', count: blockedCount },
    { value: 'done', label: 'Done' },
  ]}
/>;
```

### Props & contracts

| Name                  | Contract                                                                        |
| --------------------- | ------------------------------------------------------------------------------- |
| options               | Two to five `{ value, label, count?, icon?, disabled? }` in display order       |
| value / onValueChange | Controlled choice; receives the chosen option's value                           |
| aria-label            | Required accessible name of the group                                           |
| size                  | standard (default) matches buttons; compact matches compact fields and toolbars |
| disabled              | Disables every option; an option's own disabled skips just that one             |
| count                 | A small muted number after the label, part of the option's accessible name      |

## Guidelines

- Use a segmented control to switch between a few views or filters of the same content, such as open, blocked and done items. Use Tabs when each option has its own panel, RadioGroup for a form choice, and Select for longer lists.
- It is a radio group: one tab stop, and Arrow keys move to the next option and choose it, skipping disabled options.
- The rail is the translucent fill, like the tab rail, and the chosen option takes the primary button colors, so it stays clear on the canvas, panes and rows in both themes.
- Keep labels short. A long set of options scrolls within its rail on narrow screens.

TypeScript declarations provide the complete public API.

## Related topics

- [Tabs](../components/tabs.md)
- [Radio groups](../components/radio.md)
- [Buttons](../components/buttons.md)
