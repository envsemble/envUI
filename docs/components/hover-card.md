---
title: HoverCard
summary: Supplementary details beside a link on hover and keyboard focus, like a link preview.
status: beta
since: 0.6.0
category: Feedback & overlays
aliases:
  - PreviewCard
  - preview card
  - link preview
related:
  - popover
  - tooltip
  - accessibility
components:
  - HoverCard
---

# HoverCard

## React usage

```tsx
import { HoverCard, Link, Stack, Text } from '@envsemble/envui';

<HoverCard trigger={<Link href="/documents/roadmap">Roadmap.md</Link>}>
  <Stack gap={2}>
    <Text>
      <strong>Roadmap.md</strong>
    </Text>
    <Text tone="muted">Changed today by Alex. 3 open decisions, 1 blocked.</Text>
  </Stack>
</HoverCard>;
```

### Props & contracts

| Name                              | Contract                                                                                                             |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| trigger                           | The element that opens the card on hover and keyboard focus, usually a link; it receives the ref                     |
| children                          | Supplementary details, never the only place essential information appears                                            |
| side / align                      | bottom (default), top, left, right, or inline-start and inline-end, which follow the text direction; flips to fit    |
| delay                             | Milliseconds the pointer rests on the trigger before the card opens, 600 by default; keyboard focus opens it at once |
| closeDelay                        | Milliseconds before it closes once the pointer leaves the trigger and the card, 300 by default                       |
| width                             | standard (default, about 20 rem) or wide (about 28 rem)                                                              |
| open / defaultOpen / onOpenChange | Controlled or uncontrolled visibility                                                                                |
| className                         | Extra class on the card                                                                                              |

## Guidelines

- Use a hover card for a preview of what a link or name refers to, such as a document's summary or a person's details. Use Tooltip for a short hint and Popover for details or a form that someone opens on purpose.
- The card stays open while the pointer moves from the trigger onto it, so its text can be read and selected. <kbd>Esc</kbd> closes it, and so does moving the pointer off both the trigger and the card.
- Focus stays on the trigger: the card never takes or traps focus and is not announced as a dialog. Keep links and buttons out of it, or repeat them where keyboard and touch users can reach them, since neither can move into the card.
- The card uses the popover's raised surface, padding and type, keeps the originating theme in its portal and sits above dialogs. The application styles any heading inside it.

TypeScript declarations provide the complete public API.

## Related topics

- [Popover](../components/popover.md)
- [Tooltip](../components/tooltip.md)
- [Accessibility](../foundations/accessibility.md)
