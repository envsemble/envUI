---
title: EmptyState
summary: Explains why a region has no content, such as nothing yet, no results or a failed load, and offers the next action.
status: beta
since: 0.1.0
category: Feedback & overlays
aliases:
  - empty state
  - blank slate
  - zero state
  - no data
  - no results
  - nothing found
  - error state
  - load error
  - placeholder
useWhen:
  - A list, table or page has no content yet, such as before the first project.
  - A search or filter matches nothing.
  - Content failed to load and people can try again (`tone="error"`).
  - A state takes the place of a whole page's or region's content (`align="center"`).
avoidWhen:
  - text: Content that is on its way, which keeps its layout while it loads.
    use: Skeleton
  - text: A message about a page or section that still has its content.
    use: Alert
  - text: Feedback after an action, such as a failed save.
    use: Toast
  - text: Work of unknown length in a small area.
    use: Spinner
related:
  - loading
  - skeleton
  - alert
  - toast
  - card
  - button
components:
  - EmptyState
---

# EmptyState

## Overview

An empty state takes the place of content that isn't there: it says why, such as no projects yet, no results for a search or a list that failed to load, and offers the action that resolves it. It has a decorative icon, a title as a real heading, a description and an action. Inside a card, panel or dialog it lines up with the start; in place of a page's or region's content it centres itself in the room it gets.

```tsx example=FirstProject

```

## Anatomy

1. **Icon** (optional, `icon`): decorative, 1 rem at the start and 2.5 rem in the quiet icon color when centred. An error state shows the error icon unless `icon` replaces it.
2. **Title** (`title`): a heading of level `headingLevel` (4) in the section heading type, 1 rem in medium weight, whatever its level.
3. **Description** (optional, `description`): supporting text in the muted color, 0.875 rem, 0.5 rem below the title.
4. **More content** (optional, `children`): below the description, such as a short list of next steps.
5. **Action** (optional, `action`): a Button, or a group of them, 1 rem below the text.

## Variants and sizes

| Variant          | Use for                                                                                                                    |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------- |
| `align="start"`  | A state inside a card, a panel or a dialog, lined up with the content around it. The default.                              |
| `align="center"` | A state that takes the place of a page's or region's content, such as an empty list: centred, with a larger, quieter icon. |
| `tone="neutral"` | Nothing yet, or no results. The default.                                                                                   |
| `tone="error"`   | Content that failed to load: the error icon in the error color, announced as an alert. Pair it with a retry action.        |

- A start-aligned state has 1.5 rem padding and 1 rem between the icon, the text and the action.
- A centred state centres its icon, text and action, keeps 3 rem of block padding and limits its text to 30 rem. It is centred vertically in the height the application gives it, so give the region its height, such as with a grid that fills the rest of the page.

<!-- specimen: Matrix -->

## States and behaviour

- An empty state has no interactive states of its own; its action keeps its own.
- An error state has the `alert` role, so it is announced when it appears, and keeps its error icon color when centred.
- The title's level follows `headingLevel` for the page's outline, while its look stays the same; set 1 when the state is the whole page, such as a failed sign-in.

## Content guidelines

- Say what is missing or what happened in the title, in a few words: "No projects yet", "No matching projects", "Projects couldn’t load".
- Use the description for why and what to do, in a sentence or two: "Check the spelling or clear the search."
- Tell first use apart from no results: invite people to create in the first, and to change the search in the second.
- Name the action after what it does: "Create project", "Clear search", "Try again".
- In an error, say that people's work is safe where it is, and avoid codes and blame.

## Do and don't

### Do

- Offer one action that resolves the state, such as creating the first item or clearing the filters.
- Use `tone="error"` with a retry action when content failed to load.
- Use `align="center"` when the state takes the place of a region's content, and give that region its height.
- Set `headingLevel` so the title fits the page's outline.

### Don't

- Don't show an empty state while content is still loading; use [Skeleton](../components/skeleton.md).
- Don't report a failed action, such as a save, with an empty state; use [Toast](../components/toast.md) or [Alert](../components/alert.md).
- Don't centre a state inside a small card or a dialog.
- Don't fill an empty state with decoration or several competing actions.

## Accessibility

### envUI provides

- The title as a heading of the level `headingLevel` sets, so the state appears in the page's outline.
- The icon hidden from assistive technology.
- The `alert` role on an error state, so it is announced when it appears.

### You provide

- A `headingLevel` that fits the page's outline, and 1 when the state is the whole page.
- An announcement of a neutral state that appears as people type or filter, such as a count of results in a status region.
- Where focus goes when the action makes the state go away, such as back to the search field after Clear search.

## Examples

### No results

A search that matches nothing explains why and offers to clear the search; a status line announces the count, and clearing returns focus to the field.

```tsx example=NoResults

```

### Failed to load

An error state replaces the list that failed to load and is announced; Try again shows its progress until the list arrives.

```tsx example=LoadFailed

```

### In place of a page's content

`align="center"` centres the state in the height of the region it replaces, with a larger, quieter icon; `headingLevel={2}` fits it under the page's title.

```tsx example=InPlaceOfContent

```

## Changelog

- **0.7.0**: `align="center"`, for a state that takes the place of a page's or region's content.
- **0.4.0**: `headingLevel`, for an empty or error state that is the whole page.
- **0.2.0**: `tone="error"`, for content that failed to load.
- **0.1.0**: EmptyState.
