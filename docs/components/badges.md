# Badges & counters

## React usage

```tsx
import { Badge, Button, Counter, DiffCount, NavigationItem } from '@envsemble/envui';
import { Inbox } from '@envsemble/envui/icons/Inbox';
import { TaskAlt } from '@envsemble/envui/icons/TaskAlt';

<Badge tone="warning">Blocked</Badge>
<Badge tone="done" icon={<TaskAlt />}>Completed</Badge>
<Badge variant="outline">Shared drafts</Badge>

<NavigationItem
  href="/inbox"
  icon={<Inbox />}
  trailing={<Counter value={unread} aria-label={`${unread} unread`} tone="accent" />}
>
  Inbox
</NavigationItem>

<Button variant="secondary">
  Diffs <DiffCount additions={12} deletions={3} />
</Button>
```

### Props & contracts

| Name                            | Contract                                                                                         |
| ------------------------------- | ------------------------------------------------------------------------------------------------ |
| Badge tone                      | neutral (default), accent, success, warning, danger or done (the purple of completed work)       |
| Badge variant                   | subtle (default) tints the background, solid fills it with the tone, outline draws a tone border |
| Badge icon / children           | Optional leading icon and a short label; long labels truncate                                    |
| Counter value                   | A number or short text such as 99+                                                               |
| Counter aria-label              | Full meaning for assistive technology, such as 12 unread; the value alone otherwise              |
| Counter tone                    | neutral (default) quiet fill, or accent                                                          |
| DiffCount additions / deletions | The size of a change, shown as +12 in the success tone and −3 in the danger tone                 |
| DiffCount formatLabel           | Full meaning for assistive technology; 12 added lines and 3 removed lines by default             |
| NavigationItem trailing         | End content such as a Counter; an icon-only item shows a small dot instead                       |
| Native props                    | Badge, Counter and DiffCount accept span attributes, including title, className and ref          |

## Guidelines

- Use a badge for a short state beside the content it describes: In progress, Blocked, Archived, or a repository name. Use InfoChip for neutral metadata and Button for actions; badges are not interactive.
- Choose the tone by meaning, not decoration: success for done or healthy, warning for attention, danger for failure, done for completed work, accent for the current or highlighted state, neutral otherwise. Keep the text meaningful without color.
- Subtle badges suit lists and tables; solid badges draw more attention, so use them sparingly. Outline badges suit names and categories.
- Tone colors are central tokens (see colors), so status icons and text can share them without copying badge styles.
- A counter is a compact count. Give it an aria-label when the number needs context, and keep the value short.
- A diff count shows the size of a change in one counter-sized pill: additions in the success tone, then deletions in the danger tone, such as +12 −3. Assistive technology reads its label instead of the signs, once; formatLabel words it for other units or languages.
- In a button, such as a tab with a count, a counter keeps its own filled pill, neutral or accent, and a diff count sits on a pill in the canvas color, where its tones keep their contrast. On the solid primary and important fills both take the button's text color as an outlined pill instead, as a badge does in every button, so the count keeps its contrast in both themes.

TypeScript declarations provide the complete public API.

## Related topics

- [Info chips](../components/chips.md)
- [Navigation items](../components/navigation.md)
- [Colors & themes](../foundations/colors.md)
