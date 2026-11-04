---
title: HoverCard
summary: A card of supplementary details that opens beside a link on hover and keyboard focus, like a link preview.
status: stable
since: 1.0.0
category: Overlays
aliases:
  - PreviewCard
  - preview card
  - link preview
  - hover preview
  - profile card
  - person card
  - peek
useWhen:
  - A glance at what a link or a name refers to, such as a document's summary or a person's role
avoidWhen:
  - text: A short hint that names a control.
    use: Tooltip
  - text: Details or a small form that people open on purpose and work in.
    use: Popover
components:
  - HoverCard
examples:
  DocumentPreview:
    role: overview
    open: true
  PersonDetails:
    role: example
    caption: Large, with an avatar beside the name.
  Placement: example
  HoverCardAnatomy: anatomy
  TextDetails: example
---

# HoverCard

## Variants

### Widths

The card is as wide as its content, up to its width, and narrows to fit the window.

| Width  | Use for                                                         |
| ------ | --------------------------------------------------------------- |
| Medium | A short summary, such as a document's last change. The default. |
| Large  | Richer details, such as a person with an avatar and a role.     |

```tsx figure=PersonDetails open

```

### Placement

The card opens below its trigger, centred on it, or on another side or lined up with one end, such as above a link near the bottom of a pane.

```tsx figure=Placement open

```

## Anatomy

```tsx figure=HoverCardAnatomy open

```

1. **Card** (`env-hover-card`, `children`)
2. **Trigger** (`env-link`, `trigger`)

## Behaviour

### Hover and focus

The pointer can move from the trigger onto the card without closing it, and focus stays on the trigger.

<!-- specimen: HoverAndFocus -->

### Text with more details

Text that isn't a link can open a card too, with the dotted underline and the focus a [tooltip on text](tooltip.md#text) takes.

```tsx figure=TextDetails motion

```

## Rules

### Details that are also elsewhere

Keep the details supplementary: the page the link leads to has them too.

### Nothing to press

No links, buttons or fields in the card: the keyboard and touch can't reach them.

### No tooltip as well

No [Tooltip](tooltip.md) around a hover card or as its trigger; put what it would say in the card.

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
- `tabIndex={0}` on a text trigger, so keyboard focus reaches it.
- Headings and emphasis inside the card, such as Text in the title type.

## Compose

### Usage

A HoverCard opens its details, `children`, beside its `trigger`, which receives the ref.

- It opens on hover after `delay`, 600 ms by default, and at once on keyboard focus.
- It closes `closeDelay`, 300 ms, after the pointer leaves the trigger and the card.
- Leave it uncontrolled, or control it with `open` and `onOpenChange`; `defaultOpen` opens it on the first render.

```tsx source=DocumentPreview

```

#### Text triggers

A trigger that is text rather than a link, such as a span or Text that holds text, takes a quiet dotted underline, `env-hover-detail`. Make it focusable with `tabIndex={0}`, so keyboard focus opens the card too; envUI warns in the console while developing when it isn't. A link or another control keeps its own look.

```tsx
<HoverCard trigger={<span tabIndex={0}>28 h 9 min</span>}>
  <Text emphasis="muted">Reviews 11 h 40 min, drafting 9 h 5 min, meetings 7 h 24 min.</Text>
</HoverCard>
```

#### Width and placement

`width` is the widest the card grows: `md`, 20 rem and the default, or `lg`, 28 rem. It is as wide as its content from 12 rem up, and narrows to fit the window. `side` is `bottom`, the default, `top`, `left`, `right`, or `inline-start` and `inline-end`, which follow the text direction; `align` is `center`, the default, `start` or `end`.

```tsx
<HoverCard
  side="top"
  align="start"
  trigger={<Link href="/plans/sync-conflicts">sync conflicts</Link>}
>
  …
</HoverCard>
```

### Composition

Put a heading in it as Text in the title type, and keep links, buttons and fields out of it. A Tooltip around a HoverCard, or as its `trigger`, shows no tooltip.

### Customize

The card, `env-hover-card`, renders on PopupSurface in its trigger's theme and text direction, above dialogs, and takes `className`, `style`, `ref` and data attributes.

Its popup is frosted, as every popup is: `--env-popup-opacity`, `--env-popup-blur` and `--env-popup-shadow`, set on a theme, change it, as [Popover](popover.md#customize) describes.

## Changelog

- **1.0.0-prerelease.5**: Hover cards are frosted: the popup's color lets a little of what is behind through, blurred, with a soft shadow and no outline edge, and is solid with its edge at high contrast and with reduced transparency. Its inset is a panel's, as wide as a popup row's corner: 14 px, 11.2 px at the compact scale.
- **1.0.0**: A text trigger, such as a span or Text that holds text, takes a quiet dotted underline, `env-hover-detail`, and one without `tabIndex` gets a warning while developing. `width` is `md` or `lg`, the widest the card grows as it sizes to its content; `className`, `style`, `ref` and data attributes reach the card, `env-hover-card`, which renders on PopupSurface in the trigger's text direction. A Tooltip around it, or as its `trigger`, shows no tooltip.
