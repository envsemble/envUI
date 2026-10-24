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
  - Links to the neighbouring pages of a guide, a handbook or release notes
  - Moving on to the next page of reading, or back a page
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

The previous and next links are parts of their own too, which make the same pair together and also stand alone.

```tsx example=ComposedParts

```

## When to use

```tsx do=TitlesOnly caption="The destination's title, as its page heading reads."

```

```tsx dont=DirectionInTitles caption="Next or Back in the title: the label already says it."

```

### Order

Keep the order of the sequence the same as in the navigation that lists its pages.

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

## In code

### Usage

Pager.Root takes the `previous` and `next` destinations, each the props of its link: an `href`, which renders through the application's router link from `LinkProvider`, the destination's title as `children`, and an optional decorative `icon`, such as ArrowBack before the previous title and ArrowForward after the next. On the first or last page of the sequence, leave one out or pass `null`, and the single link stays centred. `aria-label` names the landmark where a page has several.

```tsx source=PreviousAndNext

```

#### Compose the parts

Pager.Previous and Pager.Next, as children of Pager.Root, make the same pair, and also stand alone. They render between the `previous` prop's link and the `next` prop's, but don't mix the props and the parts in one pager. Each link's `rel` is `prev` or `next` by default.

```tsx source=ComposedParts

```

### Composition

The pager is the `nav` landmark `env-pager`; each link is `env-pager-link-previous` or `env-pager-link-next`, with its icon, its direction label, `env-pager-link-label`, and the title, `env-pager-link-title`. The direction labels and the landmark's name come from EnvUIProvider's `messages.pager`.

## Changelog

- **1.0.0**: `DirectionLinks` is `Pager.Root`, and `DirectionLink` is `Pager.Previous` or `Pager.Next`, which no longer take `direction`. Pager.Root also accepts the two parts as children. `DirectionLinkProps` and `DirectionLinksDestination` are `Pager.LinkProps`, the classes are `env-pager` and `env-pager-link-*`, and the page is `pager`. The direction labels and the landmark's name come from `messages.pager`, and children render between the `previous` and `next` props' links instead of after both.
- **0.4.0**: Links settle slightly while pressed.
- **0.2.0**: Destinations render through the `LinkProvider`'s link component.
- **0.1.0**: DirectionLink and DirectionLinks: previous and next destinations that wrap on narrow screens.
