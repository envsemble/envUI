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

A hover card shows supplementary details beside its trigger, usually a link, once the pointer rests on it or keyboard focus reaches it, like a preview of the page the link leads to. Focus stays on the trigger, and the card stays open while the pointer moves onto it.

```tsx example=DocumentPreview open stage=raised

```

### Text with more details

A trigger that is text rather than a link, such as a span or Text, takes a quiet dotted underline, `env-hover-detail`, that says it shows more on hover or focus; links, buttons and avatars keep their own look. Make the text focusable with `tabIndex={0}`, so keyboard focus opens the card too.

```tsx example=TextDetails

```

## Variants

| Width | Use for                                                         |
| ----- | --------------------------------------------------------------- |
| `md`  | A short summary, such as a document's last change. The default. |
| `lg`  | Richer details, such as a person with an avatar and a role.     |

```tsx example=PersonDetails open stage=raised caption="lg, with an avatar beside the name."

```

```tsx example=Placement open stage=raised caption="side top and align start, for a link near the bottom of a pane."

```

## When to use

```tsx do=NameAndFacts open stage=raised caption="The name, then one or two facts that help decide."

```

```tsx dont=RepeatsTrigger open stage=raised caption="A card that only repeats what the link says."

```

- Keep the details supplementary: the page the link leads to has them too, as touch screens have no hover.
- No links, buttons or fields in the card: the keyboard and touch can't reach them.
- No Tooltip around a HoverCard or as its trigger; put what it would say in the card.

## Anatomy

```tsx anatomy=HoverCardAnatomy open stage=raised

```

1. **Card** (`env-hover-card`, `children`)
2. **Trigger** (`env-link`, `trigger`); a text trigger takes `env-hover-detail`

## Accessibility

### Keyboard

| Key                                             | Action                                                            |
| ----------------------------------------------- | ----------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Focus on the trigger opens the card at once; moving on closes it. |
| <kbd>Esc</kbd>                                  | Closes the card and leaves focus on the trigger.                  |

### envUI provides

- A card that opens on keyboard focus as on hover, and closes with <kbd>Esc</kbd>.
- Focus that stays on the trigger: the card never takes it and isn't a dialog.
- The theme of its trigger, above dialogs.

### You provide

- A trigger that works on its own, such as a link to a page with the same details.
- Headings and emphasis inside the card, such as Text in the title type.

## Changelog

- **1.0.0**: A text trigger, such as a span or Text that holds text, takes a quiet dotted underline, `env-hover-detail`. `width` is `md` or `lg`, the widest the card grows as it sizes to its content; `className`, `style`, `ref` and data attributes reach the card, `env-hover-card`, which renders on PopupSurface in the trigger's text direction. A Tooltip around it, or as its `trigger`, shows no tooltip.
- **0.6.0**: HoverCard.
