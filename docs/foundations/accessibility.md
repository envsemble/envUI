---
title: Accessibility
summary: What every component does for keyboard, screen readers, contrast, motion and touch, and what an app still supplies.
aliases:
  - a11y
  - keyboard
  - screen reader
  - focus
  - contrast
  - high contrast
  - reduced motion
  - forced colors
  - accessible name
avoidWhen:
  - text: A field with a visible label, its description and its error.
    use: TextField
  - text: One choice of many, moved through with the keyboard.
    use: Select
  - text: One of a few options side by side, such as a list or a grid view.
    use: SegmentedControl
  - text: A task that holds focus until people finish it.
    use: Dialog
  - text: A message announced without moving focus.
    use: ToastProvider
  - text: Colors and their contrast in every theme.
    see: colors
examples:
  Keyboard: example
---

# Accessibility

## Behaviour

Every component works from the keyboard in the order it shows, with a visible focus ring and names and states for screen readers. Its contrast is checked in all four [themes](colors.md).

Under reduced motion things fade instead of moving, under forced colors they take the system's colors, and on touch they grow to a finger's size.

```tsx figure=Keyboard

```

## Rules

envUI can't know the application's words: give every field a visible label, every icon-only button a name and every meaningful image a description.

Keep headings in order, write errors that say how to put things right, and check the contrast of colors you choose.

## Compose

### Usage

```tsx
import { Column, IconButton, TextField } from '@envsemble/envui';
import { IconChevronRight } from '@envsemble/envui/icons/ChevronRight';

<Column gap={4}>
  <TextField label="Project name" />
  <IconButton icon={<IconChevronRight />} aria-label="Next project" />
</Column>;
```

Use the motion tokens in the application's own animations, keeping only fades under `prefers-reduced-motion: reduce`; durations of `0s` on `.env-theme` switch envUI's motion off.

### Customize

Values at the default 16 px root.

#### Motion

| Token                          | Comfortable                       | Compact                           | Use                                                                                                             |
| ------------------------------ | --------------------------------- | --------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `--env-motion-duration-fast`   | `0.12s`                           | `0.12s`                           | A small change, such as a state layer, a color under the pointer or a tooltip: 120 ms.                          |
| `--env-motion-duration-medium` | `0.16s`                           | `0.16s`                           | A part that opens, moves or fades in, such as a popup or a field's floating label: 160 ms.                      |
| `--env-motion-duration-slow`   | `0.24s`                           | `0.24s`                           | A larger movement, such as a sheet sliding in or a dialog's backdrop: 240 ms.                                   |
| `--env-motion-ease`            | `cubic-bezier(0.45, 0, 0.2, 1)`   | `cubic-bezier(0.45, 0, 0.2, 1)`   | The standard easing of a change on screen, which speeds up and then settles.                                    |
| `--env-motion-ease-enter`      | `cubic-bezier(0.05, 0.7, 0.1, 1)` | `cubic-bezier(0.05, 0.7, 0.1, 1)` | Elements entering, their fade included, and feedback under the pointer start at once and decelerate into place. |
| `--env-motion-ease-exit`       | `cubic-bezier(0.4, 0, 1, 1)`      | `cubic-bezier(0.4, 0, 1, 1)`      | Leaving elements accelerate away.                                                                               |
