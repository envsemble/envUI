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
examples:
  PreviousAndNext:
    role: overview
    caption: Each link shows its destination's title under the label Previous or Up next.
  ComposedParts: example
  PagerAnatomy: anatomy
  StepThroughAGuide: example
  LongTitles: example
---

# Pager

## Variants

### The links alone

The previous and next links are parts of their own too, which make the same pair together and also stand alone.

```tsx figure=ComposedParts

```

## Anatomy

```tsx figure=PagerAnatomy enlarge

```

1. **Pager** (`env-pager`)
2. **Link** (`env-pager-link-previous`, `previous`)
3. **Icon** (`env-pager-link-previous > env-icon`, `icon`)
4. **Direction** (`env-pager-link-label`)
5. **Title** (`env-pager-link-title`, `children`)

## Behaviour

### Step through a guide

At either end of the sequence, leave out the missing destination: a single link stays centred.

```tsx figure=StepThroughAGuide motion

```

### Adapting to width

The links sit side by side while they fit.

- In less room each takes a centred row of its own.
- Titles wrap between words.

```tsx figure=LongTitles widths="46 16" sweep

```

## Rules

A link names its destination by its title, in the order the navigation lists the pages.

### Titles

Use the title as the page's heading reads it. Leave Next or Back out of it: the label already says the direction.

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

## Compose

### Usage

```tsx
<Pager.Root
  previous={{ href: '/guide/projects', children: 'Create a project', icon: <ArrowBack /> }}
  next={{ href: '/guide/team', children: 'Invite your team', icon: <ArrowForward /> }}
/>
```

`previous` and `next` each take the props of their link: an `href`, which renders through the router link from `LinkProvider`, the destination's title as `children`, and an optional decorative `icon`, such as ArrowBack before the previous title and ArrowForward after the next. On the first or last page, leave one out or pass `null`. `aria-label` names the landmark where a page has several.

#### The links alone

```tsx
<Pager.Root>
  <Pager.Previous href="/guide/projects">Create a project</Pager.Previous>
  <Pager.Next href="/guide/team">Invite your team</Pager.Next>
</Pager.Root>
```

Pager.Previous and Pager.Next, as children of Pager.Root, make the same pair, and also stand alone. They render between the `previous` prop's link and the `next` prop's, but don't mix the props and the parts in one pager. Each link's `rel` is `prev` or `next` by default.

### Composition

The pager is the `nav` landmark `env-pager`; each link is `env-pager-link-previous` or `env-pager-link-next`. The direction labels and the landmark's name come from EnvUIProvider's `messages.pager`.

## Changelog

- **1.0.0**: `DirectionLinks` is `Pager.Root`, and `DirectionLink` is `Pager.Previous` or `Pager.Next`, which no longer take `direction`. Pager.Root also accepts the two parts as children. `DirectionLinkProps` and `DirectionLinksDestination` are `Pager.LinkProps`, the classes are `env-pager` and `env-pager-link-*`, and the page is `pager`. The direction labels and the landmark's name come from `messages.pager`, and children render between the `previous` and `next` props' links instead of after both.
- **0.4.0**: Links settle slightly while pressed.
- **0.2.0**: Destinations render through the `LinkProvider`'s link component.
- **0.1.0**: DirectionLink and DirectionLinks: previous and next destinations that wrap on narrow screens.
