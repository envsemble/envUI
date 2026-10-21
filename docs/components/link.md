---
title: Link
summary: A destination inside running text, underlined by default, routed by the application.
status: beta
since: 0.1.0
category: Actions
aliases:
  - anchor
  - hyperlink
  - text link
  - inline link
useWhen:
  - A destination inside a sentence or a paragraph, such as a guide or a related page.
  - A short list of destinations where buttons would be too heavy, with the underline turned off.
avoidWhen:
  - text: An action, such as saving or deleting, even when it looks like text.
    use: Button
  - text: The next step of a flow, which should read as an action.
    use: Button
  - text: Destinations in an application's navigation, such as a sidebar.
    use: NavigationDrawer
  - text: Previous and next pages of a sequence.
    use: Pager
related:
  - button
  - navigation-drawer
  - pager
  - setup
components:
  - Link
---

# Link

## Overview

Link is a native `<a>` for a destination inside running text. It takes the font of the text around it, the link color and, by default, an underline, so it stands out from the words beside it. Links render through the `LinkProvider`'s link component, so the application's router handles them.

```tsx example=InRunningText

```

## States and behaviour

- Hover and pressed change only the text color, by the shared rule in [colors and themes](../foundations/colors.md); keyboard focus shows the shared focus ring.
- A `disabled` link has no destination: it cannot be focused or followed and reports `aria-disabled`.
- Link is Button's text variant with an underline by default. For a link that should look like a button, use Button with `href`.

## Content guidelines

- Make the link text say where it goes, such as "project guide", not "click here" or a bare address.
- Link the words that name the destination, not a whole sentence.
- Keep the underline in running text; turn it off only where the context already marks the words as links, such as a short list of destinations.

## Accessibility

### Keyboard

| Key                                             | Action                                    |
| ----------------------------------------------- | ----------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves focus to the next or previous link. |
| <kbd>Enter</kbd>                                | Follows the link.                         |

### envUI provides

- A native `<a>` with the link role, rendered through `LinkProvider` so modifier clicks and middle clicks behave as the browser's.
- An underline by default, so the link is not told apart by color alone.
- The shared focus ring, and `aria-disabled` with no destination while disabled.

### You provide

- Link text that names the destination.
- The router link through `LinkProvider`, described in [setup](../setup.md).

## Examples

### Without an underline

Where the context already marks the words as links, `underline={false}` leaves the link color alone.

```tsx example=WithoutUnderline

```

## Changelog

- **1.0.0**: Link has a page of its own, split from the button page.
- **0.1.0**: Link, an inline link built on Button.
