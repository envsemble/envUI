---
title: Pager
summary: Previous and next links between the pages of an ordered sequence, such as a guide.
status: beta
since: 1.0.0
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

```tsx figure=ComposedParts

```

## Anatomy

```tsx figure=PagerAnatomy enlarge

```

1. **Pager** (`env-pager`)
2. **Link** (`env-pager-link-previous`, `previous`)
3. **Start** (`env-pager-link-start`, `start`)
4. **Direction** (`env-pager-link-label`)
5. **Title** (`env-pager-link-title`, `children`)

## Behaviour

### Step through a guide

```tsx figure=StepThroughAGuide motion

```

### Adapting to width

```tsx figure=LongTitles widths="46 16" sweep

```
