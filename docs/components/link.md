---
title: Link
summary: A destination inside running text, underlined by default, routed by the application.
status: beta
since: 1.0.0
category: Actions
aliases:
  - anchor
  - hyperlink
  - text link
  - inline link
useWhen:
  - A destination inside a sentence or a paragraph, such as a guide or a related page.
avoidWhen:
  - text: An action, such as saving or deleting, even when it looks like text, or the next step of a flow.
    use: Button
  - text: Destinations in an application's navigation, such as a sidebar.
    use: NavigationDrawer
  - text: Previous and next pages of a sequence.
    use: Pager
components:
  - Link
examples:
  InRunningText: overview
  WithoutUnderline:
    role: example
    caption: Without the underline, in a short list of destinations.
  LinkAnatomy: anatomy
  UnderlinedInText:
    role: do
    caption: The underline in running text.
  NoUnderlineInText:
    role: dont
    caption: 'No underline in a sentence: only its color tells it apart.'
---

# Link

## Variants

| Underline | Use for                                                                                    |
| --------- | ------------------------------------------------------------------------------------------ |
| On        | Running text. The default.                                                                 |
| Off       | A short list of destinations, where buttons would be too heavy and the context marks them. |

```tsx figure=WithoutUnderline

```

### Looks like a button

A destination that should look like a button is a [Button](button.md) that goes somewhere: the same link, in a button's shape.

## Anatomy

```tsx figure=LinkAnatomy

```

1. **Link** (`env-link`, `href`)
2. **Label** (`env-link::text`, `children`)

## Rules

A link names its destination, and is underlined in running text.

```tsx figure=UnderlinedInText

```

```tsx figure=NoUnderlineInText

```

### Labels

Link the few words that name the destination, not a whole sentence.

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

## Compose

### Usage

Link is a native `<a>` with its `href`, rendered through the link component of `LinkProvider`, so the application's router handles it, as [Connect your router](../setup.md#connect-your-router) describes.

- Its `children` are the label.
- `disabled` removes the destination: the link can't be focused or followed, and reports `aria-disabled`.

```tsx source=InRunningText

```

#### Without the underline

`underline` is `true` by default; `underline={false}` leaves it off, in a list of destinations whose context marks them, as the WithoutUnderline example does.

```tsx
<Link href="/settings/profile" underline={false}>
  Profile
</Link>
```

#### Looks like a button

A Button with `href` is the same native link, through the same `LinkProvider`, in a button's shape.

```tsx
<Button href="/projects/new">New project</Button>
```

### Customize

Link is a text Button with the class `env-link`, whose `data-underline` says whether it is underlined; CSS may target both. It takes the text button's colors. At rest its underline is a lighter line of its color; under the pointer and while pressed the underline takes the full color and the label darkens a step, then another.

## Changelog

- **1.0.0**: Link has a page of its own, split from the button page.
- **1.0.0-prerelease.6**: An underlined link rests on a lighter line, its color at 40 %, and draws the underline in its full color under the pointer and while pressed, so rest, hover and press read apart.
