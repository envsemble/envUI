# Badges & counters

## React usage

```tsx
import { Badge, Counter, NavigationItem } from '@envsemble/envui';
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
```

### Props & contracts

| Name                    | Contract                                                                                         |
| ----------------------- | ------------------------------------------------------------------------------------------------ |
| Badge tone              | neutral (default), accent, success, warning, danger or done (the purple of completed work)       |
| Badge variant           | subtle (default) tints the background, solid fills it with the tone, outline draws a tone border |
| Badge icon / children   | Optional leading icon and a short label; long labels truncate                                    |
| Counter value           | A number or short text such as 99+                                                               |
| Counter aria-label      | Full meaning for assistive technology, such as 12 unread; the value alone otherwise              |
| Counter tone            | neutral (default) quiet fill, or accent                                                          |
| NavigationItem trailing | End content such as a Counter; an icon-only item shows a small dot instead                       |
| Native props            | Badge and Counter accept span attributes, including title, className and ref                     |

## Guidelines

- Use a badge for a short state beside the content it describes: In progress, Blocked, Archived, or a repository name. Use InfoChip for neutral metadata and Button for actions; badges are not interactive.
- Choose the tone by meaning, not decoration: success for done or healthy, warning for attention, danger for failure, done for completed work, accent for the current or highlighted state, neutral otherwise. Keep the text meaningful without color.
- Subtle badges suit lists and tables; solid badges draw more attention, so use them sparingly. Outline badges suit names and categories.
- Tone colors are central tokens (see colors), so status icons and text can share them without copying badge styles.
- A counter is a compact count. Give it an aria-label when the number needs context, and keep the value short.

TypeScript declarations provide the complete public API.

## Related topics

- [Info chips](../components/chips.md)
- [Navigation items](../components/navigation.md)
- [Colors & themes](../foundations/colors.md)
