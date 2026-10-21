---
title: CloseButton
summary: The icon-only button that closes, dismisses or removes what it sits in, named Close in the application's language.
status: beta
since: 1.0.0
category: Actions
aliases:
  - close button
  - dismiss button
  - remove button
  - x button
  - close icon
useWhen:
  - A panel, a notification or a tip closes or is dismissed in place.
  - A list of items, such as people or files, lets each be removed.
avoidWhen:
  - text: A dialog's own close, which Dialog renders itself.
    use: Dialog
  - text: An action that deletes something for good, which needs its consequence named.
    use: ConfirmButton
  - text: Any other icon-only action.
    use: IconButton
related:
  - button
  - dialog
  - alert
components:
  - CloseButton
---

# CloseButton

## Overview

CloseButton is an icon-only button with a cross that closes, dismisses or removes what it sits in. Under a coarse pointer, its hit area reaches the 2.75 rem touch size.

```tsx example=DismissTip

```

```tsx example=RemovePeople caption="Beside others like it, each button names what it removes."

```

### Its name

`aria-label`, else EnvUIProvider's `messages.common.close`, else Close, in the language the [provider](../setup.md#locale-strings-and-direction) sets.

```tsx example=ApplicationLabel

```

## Variants

```tsx example=CloseVariants

```

| Variant     | Use for                                            |
| ----------- | -------------------------------------------------- |
| `ghost`     | An application's chrome and surfaces. The default. |
| `secondary` | A control of its own, such as over an image.       |

Sizes are a button's, `sm`, `md` and `lg`; without one, the container's.

## When to use

```tsx do=CloseAtEnd caption="At the end of the header of what it closes, where people look for it."

```

```tsx dont=CloseAtStart caption="At the start: it reads as part of the content."

```

```tsx do=OneClose caption="One way to close, beside the actions."

```

```tsx dont=TwoCloses caption="A cross and a Close button: two ways to do one thing."

```

- Name what it removes where several sit together, such as Remove Alex Morgan.

## Anatomy

```tsx anatomy=CloseButtonAnatomy

```

1. **Button** (`env-close-button`)
2. **Icon** (`env-close-button > env-icon`, `icon`)

## Accessibility

### Keyboard

| Key                                             | Action                              |
| ----------------------------------------------- | ----------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves focus to the button and away. |
| <kbd>Enter</kbd>, <kbd>Space</kbd>              | Presses it.                         |

### envUI provides

- A native `<button>` named Close, or the provider's word, with the cross hidden.
- The touch-size hit area under a coarse pointer.

### You provide

- Where focus goes once the button is gone.
- A specific `aria-label` where several sit together.

## Changelog

- **1.0.0**: CloseButton.
