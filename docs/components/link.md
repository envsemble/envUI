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
  - text: An action, such as saving or deleting, even when it looks like text, or the next step of a flow.
    use: Button
  - text: Destinations in an application's navigation, such as a sidebar.
    use: Drawer
  - text: Previous and next pages of a sequence.
    use: Pager
components:
  - Link
---

# Link

## Overview

Link is a native `<a>` for a destination inside running text. It renders through the `LinkProvider`'s link component, so the application's router handles it.

```tsx example=InRunningText

```

### Disabled

A `disabled` link has no destination: it can't be focused or followed.

## Variants

```tsx example=WithoutUnderline caption="underline={false}, for a short list that already reads as links."

```

| Underline           | Use for                                               |
| ------------------- | ----------------------------------------------------- |
| On                  | Running text. The default.                            |
| `underline={false}` | A list of destinations, where the context marks them. |

For a link that should look like a button, use Button with `href`.

## When to use

```tsx do=UnderlinedInText caption="The underline in running text."

```

```tsx dont=NoUnderlineInText caption="No underline in a sentence: only its color tells it apart."

```

### Labels

```tsx do=NamesDestination caption="Words that name the destination."

```

```tsx dont=ClickHere caption="Click here: it says nothing out of context."

```

- Link a few words, not a whole sentence.

## Anatomy

```tsx anatomy=LinkAnatomy

```

1. **Link** (`env-link`, `href`)
2. **Label** (`env-link::text`, `children`)

## Accessibility

### Keyboard

| Key                                             | Action                                    |
| ----------------------------------------------- | ----------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves focus to the next or previous link. |
| <kbd>Enter</kbd>                                | Follows the link.                         |

### envUI provides

- A native `<a>`, so modifier and middle clicks behave as the browser's.
- An underline by default, so color isn't the only cue.
- The shared focus ring, and `aria-disabled` while disabled.

### You provide

- Link text that names the destination.
- The router link through `LinkProvider`, as [setup](../setup.md) describes.

## Changelog

- **1.0.0**: Link has a page of its own, split from the button page.
- **0.1.0**: Link, an inline link built on Button.
