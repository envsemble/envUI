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
  - text: The path from the top of a hierarchy down to the current page.
    use: Breadcrumbs
components:
  - Pager
---

# Pager

## Overview

Each link shows its destination's title under the label Previous or Up next.

```tsx example=PreviousAndNext

```

### Step through a guide

At either end of the sequence, leave out the missing destination: a single link stays centred.

```tsx example=StepThroughAGuide

```

### Compose the parts

Pager.Previous and Pager.Next as children of Pager.Root make the same pair, and also stand alone.

```tsx example=ComposedParts

```

## When to use

```tsx do=TitlesOnly caption="The destination's title, as its page heading reads."

```

```tsx dont=DirectionInTitles caption="Next or Back in the title: the label already says it."

```

- Keep the order of the sequence the same as in the navigation that lists its pages.
- Don't mix the `previous` and `next` props with the parts in one pager.

## Anatomy

```tsx anatomy=PagerAnatomy enlarge

```

1. **Pager** (`env-pager`)
2. **Link** (`env-pager-link-previous`, `previous`)
3. **Icon** (`env-pager-link-previous > env-icon`, `icon`)
4. **Direction** (`env-pager-link-label`)
5. **Title** (`env-pager-link-title`, `children`)

## Adapting to width

The links sit side by side while they fit; in less room each takes a centred row of its own, and titles wrap between words.

```tsx example=LongTitles widths="16 44"

```

## Accessibility

### Keyboard

| Key                                             | Action                                                   |
| ----------------------------------------------- | -------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves focus to the previous link, then to the next link. |
| <kbd>Enter</kbd>                                | Follows the focused link.                                |

### envUI provides

- A `nav` landmark named Previous and next content, from `messages.pager`.
- Native links with `rel="prev"` and `rel="next"`, named with their direction, such as Up next Invite your team.
- Links at least 2.75 rem tall, and decorative icons hidden.

### You provide

- An `aria-label` that names the sequence where the page has several navigation landmarks.
- The routing behind `href`, through `LinkProvider`.

## Changelog

- **1.0.0**: `DirectionLinks` is `Pager.Root`, and `DirectionLink` is `Pager.Previous` or `Pager.Next`, which no longer take `direction`. Pager.Root also accepts the two parts as children. `DirectionLinkProps` and `DirectionLinksDestination` are `Pager.LinkProps`, the classes are `env-pager` and `env-pager-link-*`, and the page is `pager`. The direction labels and the landmark's name come from `messages.pager`, and children render between the `previous` and `next` props' links instead of after both.
- **0.4.0**: Links settle slightly while pressed.
- **0.2.0**: Destinations render through the `LinkProvider`'s link component.
- **0.1.0**: DirectionLink and DirectionLinks: previous and next destinations that wrap on narrow screens.
