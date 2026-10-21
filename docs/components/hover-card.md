---
title: HoverCard
summary: A card of supplementary details that opens beside a link on hover and keyboard focus, like a link preview.
status: stable
since: 0.6.0
category: Feedback & overlays
aliases:
  - PreviewCard
  - preview card
  - link preview
  - hover preview
  - profile card
  - person card
  - peek
useWhen:
  - A link or a name refers to something people may want a glance at before following it, such as a document's summary or a person's role.
avoidWhen:
  - text: A short hint that names a control.
    use: Tooltip
  - text: Details or a small form that people open on purpose and work in.
    use: Popover
  - text: A task that needs people's attention before they go on.
    use: Dialog
  - text: Information people need to complete a task, which must stay visible.
    use: Alert
related:
  - popover
  - tooltip
  - link
  - avatar
  - accessibility
components:
  - HoverCard
---

# HoverCard

## Overview

A hover card shows supplementary details beside its trigger, usually a link, once the pointer rests on it or keyboard focus reaches it, like a preview of the page the link leads to. It stays open while the pointer moves onto it, so its text can be read and selected. Focus stays on the trigger, and the card is not a dialog. HoverCard is built on Base UI's preview card.

```tsx example=DocumentPreview

```

## Anatomy

1. **Trigger** (`trigger`): the element that opens the card, usually a Link; it receives the ref and the hover and focus handlers.
2. **Card** (`children`): the raised surface Popover uses: the popup fill with a hairline border, 1.75 rem corners, 1.5 rem padding and a level-two shadow, 0.5 rem from the trigger. Its content is body text, 0.75 rem apart.

## Variants and sizes

| Width | Use for                                                                       |
| ----- | ----------------------------------------------------------------------------- |
| `md`  | A short summary, such as a document's last change. Up to 20 rem. The default. |
| `lg`  | Richer details, such as a person with an avatar and a role. Up to 28 rem.     |

- The card is as wide as its content, from 12 rem up to its width, at most the room the window leaves it, and as tall as the room beside the trigger allows; longer content scrolls.
- `side` places it below the trigger by default, or above, beside it, or at the inline start or end, which follow the text direction; `align` lines it up with the trigger's centre by default, or its start or end. It flips and shifts to stay 0.5 rem inside the window.

## States and behaviour

- **Opening**: the card opens once the pointer rests on the trigger for `delay` (600 ms), and at once when the trigger takes keyboard focus. A focus that isn't from the keyboard, such as a click, waits for the delay.
- **Staying open**: it stays open while the pointer is on the trigger or on the card, so people can move onto it and select its text.
- **Closing**: it closes `closeDelay` (300 ms) after the pointer leaves both the trigger and the card, when the trigger loses focus, and with <kbd>Esc</kbd>, which leaves focus on the trigger.
- **Control**: `open`, `defaultOpen` and `onOpenChange` control it; `onOpenChange` reports each change and its `reason`, such as `trigger-hover` or `trigger-focus`.
- **Theme and layers**: the card keeps the theme of the page around its trigger in its portal, and sits above dialogs.

## Content guidelines

- Start with the name of what the link leads to, then one or two facts that help decide whether to follow it: "Roadmap — Changed today by Alex Morgan."
- Keep it short enough to read at a glance.
- Repeat nothing the trigger's text already says.

## Do and don't

### Do

- Use a hover card for a preview of what a link or a name refers to.
- Keep the details supplementary: the page the link leads to has them too.
- Use the `lg` card for content with an avatar or several lines.

### Don't

- Don't put links, buttons or fields in a hover card; keyboard and touch users can't move into it.
- Don't put information people need in a hover card alone; touch screens have no hover.
- Don't use a hover card for a control's name; use [Tooltip](../components/tooltip.md).
- Don't put a Tooltip around a HoverCard or give one as its `trigger`: it shows no tooltip, and says so in the console while developing, as the card opens on the same hover and focus. Put what the tooltip would say in the card.
- Don't open a hover card from a button that does something else; use [Popover](../components/popover.md) for details people open on purpose.

## Accessibility

### Keyboard

| Key                                             | Action                                                                                                             |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moving focus to the trigger opens the card at once; moving it on closes the card. Focus never moves into the card. |
| <kbd>Esc</kbd>                                  | Closes the card and leaves focus on the trigger.                                                                   |

### envUI provides

- A card that opens on keyboard focus as it does on hover, and closes with <kbd>Esc</kbd>.
- Focus that stays on the trigger: the card never takes or traps it and isn't announced as a dialog.
- The card in the theme of its trigger, above dialogs, on a surface with contrast for its text.

### You provide

- A trigger that works on its own, such as a link to a page with the same details.
- The details somewhere people can reach without a pointer or a keyboard, since touch screens have no hover.
- Headings and emphasis inside the card, such as Text in the section heading type.

## Examples

### A person's details

The `lg` card has room for an avatar beside the name and a role, and a line about the person.

```tsx example=PersonDetails

```

### Above the trigger

`side="top"` and `align="start"` open the card above the link, lined up with its start, such as for a link near the bottom of a pane.

```tsx example=Placement

```

## Changelog

- **1.0.0**: `width` is `md` or `lg`; `className`, `style`, `ref` and data attributes reach the card, `env-hover-card`, which renders on PopupSurface in the trigger's text direction. A Tooltip around it, or as its `trigger`, shows no tooltip.
- **0.6.0**: HoverCard.
