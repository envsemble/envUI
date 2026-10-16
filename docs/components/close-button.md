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

CloseButton is an icon-only button with a cross, ghost by default, named "Close" in the language the [EnvUIProvider](../setup.md#locale-strings-and-direction) sets. It closes, dismisses or removes what it sits in, such as a tip, a panel or an item in a list. Under a coarse pointer, its hit area reaches the 2.75 rem touch size, also where its container draws it smaller.

```tsx example=DismissTip

```

## Variants and sizes

| Variant     | Use for                                                                                  |
| ----------- | ---------------------------------------------------------------------------------------- |
| `ghost`     | Chrome and surfaces: the quiet icon, with a state layer on hover and press. The default. |
| `secondary` | Where the button should read as a control of its own, such as over an image.             |

- **Size**: `sm`, `md` or `lg`, as on every button: 2, 2.5 or 3 rem square in the comfortable scale; without it, the control height of its container.
- **Icon**: a Close cross by default; `icon` takes another, such as a smaller cross.

## States and behaviour

- Hover, pressed, focus and disabled are Button's; `pending` replaces the icon with a spinner.
- The name is `aria-label`, then EnvUIProvider's `messages.common.close`, then "Close".
- Under a coarse pointer, the hit area grows to the touch size around the button without changing how it looks.

## Content guidelines

- Keep the default name where one thing closes; name what it removes where several sit side by side, such as "Remove Alex Morgan".

## Do and don't

### Do

- Put it at the end of the header of what it closes, where people look for it.
- Move focus somewhere sensible after the button disappears with what it closed.

### Don't

- Don't use it for an action that cannot be undone; name the consequence with a ConfirmButton.
- Don't put two close buttons on the same thing.

## Accessibility

### Keyboard

| Key                                             | Action                              |
| ----------------------------------------------- | ----------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves focus to the button and away. |
| <kbd>Enter</kbd>, <kbd>Space</kbd>              | Presses it.                         |

### envUI provides

- A native `<button>` named Close, or the provider's word for it, with the cross hidden from assistive technology.
- The touch-size hit area under a coarse pointer.

### You provide

- What closing does, and where focus goes once the button is gone.
- A specific `aria-label` where several close buttons sit together.

## Examples

### Remove items

Beside others like it, each button names what it removes.

```tsx example=RemovePeople

```

### Translated name

An EnvUIProvider's `messages` name every CloseButton inside it.

```tsx example=TranslatedLabel

```

## Changelog

- **1.0.0**: CloseButton.
