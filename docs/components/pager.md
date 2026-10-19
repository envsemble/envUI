---
title: Pager
summary: Previous and next links between the pages of an ordered sequence, such as a guide, centered at the end of the content.
status: beta
since: 0.1.0
category: Navigation
aliases:
  - DirectionLinks
  - DirectionLink
  - Pager.Previous
  - Pager.Next
  - previous and next links
  - previous and next
  - prev/next
  - up next
  - next page link
useWhen:
  - The pages of an ordered sequence, such as a guide, a handbook or release notes, link to their neighbours after the content.
  - A reader moves on to the next page of reading content, and may go back a page.
avoidWhen:
  - text: Moving through the pages of a long list or table.
    use: Pagination
  - text: The next step of a form or a task, such as Continue in a checkout.
    use: Button
  - text: An application's main destinations, such as the pages in a sidebar.
    use: NavList
  - text: The path from the top of a hierarchy down to the current page.
    use: Breadcrumbs
related:
  - pagination
  - nav-list
  - breadcrumbs
  - button
components:
  - Pager
---

# Pager

## Overview

A pager links a page of an ordered sequence, such as a guide, to the pages before and after it. It sits after the page's content: a navigation landmark that centers its two links, each a native link with its direction, Previous or Up next, above the destination's title.

The `Pager` namespace has three parts:

- **Pager.Root** is the landmark and its layout. It takes the destinations as its `previous` and `next` props, or the two links as children, and renders nothing without either.
- **Pager.Previous** is the link to the page before, with `rel="prev"` and an optional icon before its text.
- **Pager.Next** is the link to the page after, with `rel="next"` and an optional icon after its text.

Pager.Previous and Pager.Next also stand alone, where the application places a single link itself.

```tsx example=PreviousAndNext

```

## Anatomy

1. **Landmark** (Pager.Root): a `nav` as wide as its container, which centers its links 1 rem apart and wraps them onto rows of their own where they don't fit side by side.
2. **Link** (Pager.Previous, Pager.Next): an outlined rectangle on the raised background with a 0.0625 rem border and 0.5 rem corners, 0.75 rem by 1 rem padding and at least 2.75 rem tall, as wide as its text.
3. **Direction label**: Previous or Up next, in 0.875 rem muted text.
4. **Title** (children): the destination's title in 1 rem medium-weight text, 0.25 rem below the label.
5. **Icon** (optional, `icon`): decorative, 1.25 rem in the accent color, 1 rem from the text: before it on the previous link and after it on the next.
6. **Focus ring**: the shared ring, 0.125 rem outside the link, shown for keyboard focus.

## Variants and sizes

| Destinations    | Use for                                    |
| --------------- | ------------------------------------------ |
| Both            | A page in the middle of a sequence.        |
| `next` only     | The first page, which has no page before.  |
| `previous` only | The last page, which has no page after it. |

<!-- specimen: SingleDestinations -->

- A link is as wide as its text, up to the width of the pager. A single link stays centered, with no placeholder for the missing one.
- The pair sits side by side while it fits; in a narrow container each link takes a centered row of its own. Titles wrap between words, and only a word longer than the link breaks.
- The link's background, border, label, title and icon have colors of their own in both themes: the raised background with a muted border, the label in muted text, the title in the default text color and the icon in the accent color.

## States and behaviour

- **Hover and pressed**: the link takes the raised background's hover and pressed fills and its border's hover and pressed colors, over 0.12 s; pressed, it also settles to 99 percent of its size. With reduced motion, the colors change at once and the link doesn't move.
- **Focus**: keyboard focus shows the shared ring outside the link.
- **Links**: each link is a native link, rendered through the `LinkProvider`'s link component so routing stays with the application. `rel` is `prev` or `next` unless set; `target`, `onClick` and the other link props work as on any link.
- **Missing destinations**: a `previous` or `next` left out, or `null`, renders no link; a pager without either, and without children, renders nothing.
- **Order**: the previous link comes before the next one, in reading and keyboard order. Children render between the `previous` prop's link and the `next` prop's, so a pager can take one link as a prop and the other as a part.
- **Labels**: the direction labels are Previous and Up next, and the landmark's name Previous and next content; EnvUIProvider's `messages.pager` sets them in another language, and `aria-label` names one pager.

## Content guidelines

- Use the destination's title as the link's text, as its page heading reads, such as "Install the app".
- Leave the direction to the label: don't start the title with "Next:" or "Back to".
- Give both links an icon or neither, and choose arrows that point the way the sequence runs, such as ArrowBack and ArrowForward.
- Name a pager after the sequence it moves through, such as "Setup guide", where the page has more than one navigation landmark.

## Do and don't

### Do

- Place the pager after the page's content, where a reader finishes it; the page sets the space around it.
- Link both neighbours, and leave out a destination only at either end of the sequence.
- Keep the order of the sequence the same as in the navigation that lists its pages.

### Don't

- Don't use a pager to move through the pages of a list or table; use [Pagination](../components/pagination.md).
- Don't use a pager for the steps of a form or a task; use a [Button](../components/button.md) for the next step.
- Don't mix the `previous` and `next` props with Pager.Previous and Pager.Next children in one pager.
- Don't put a pager above the content, or between paragraphs.

## Accessibility

### Keyboard

| Key                                             | Action                                                   |
| ----------------------------------------------- | -------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves focus to the previous link, then to the next link. |
| <kbd>Enter</kbd>                                | Follows the focused link.                                |

### envUI provides

- A `nav` landmark, named "Previous and next content" unless `aria-label` names it.
- Native links with `rel="prev"` and `rel="next"`, whose names start with their direction, such as "Previous Install the app" and "Up next Invite your team".
- Decorative icons hidden from assistive technology.
- The shared focus ring, and links at least 2.75 rem tall.

### You provide

- An `aria-label` that tells the pager apart where the page has several navigation landmarks, such as "Setup guide", in the page's language.
- The destinations' titles and the routing behind `href`, through `LinkProvider`.

## Examples

### Step through a guide

On the first page only the next link shows; the previous link joins it from the second page on.

```tsx example=StepThroughAGuide

```

### Compose the parts

Pager.Previous and Pager.Next as children of Pager.Root make the same pair, here without icons.

```tsx example=ComposedParts

```

### Long titles in a narrow column

Where the pair doesn't fit side by side, each link takes a row of its own, and titles wrap between words.

```tsx example=LongTitles

```

## Changelog

- **1.0.0**: `DirectionLinks` is `Pager.Root`, and `DirectionLink` is `Pager.Previous` or `Pager.Next`, which no longer take `direction`. Pager.Root also accepts the two parts as children. `DirectionLinkProps` and `DirectionLinksDestination` are `Pager.LinkProps`, the classes are `env-pager` and `env-pager-link-*`, and the page is `pager`. The direction labels and the landmark's name come from `messages.pager`, and children render between the `previous` and `next` props' links instead of after both.
- **0.4.0**: Links settle slightly while pressed.
- **0.2.0**: Destinations render through the `LinkProvider`'s link component.
- **0.1.0**: DirectionLink and DirectionLinks: previous and next destinations that wrap on narrow screens.
