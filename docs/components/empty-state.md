---
title: EmptyState
summary: Explains why a region has no content, such as nothing yet, no results or a failed load, and offers the next action.
status: stable
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
  - Content failed to load and people can try again (`tone="danger"`).
  - A state takes the place of a whole page's or region's content (`align="center"`).
avoidWhen:
  - text: Content that is on its way, which keeps its layout while it loads, as a skeleton.
    use: Surface
  - text: A message about a page or section that still has its content.
    use: Alert
  - text: Feedback after an action, such as a failed save.
    use: Toast
  - text: Work of unknown length in a small area.
    use: Spinner
related:
  - loading
  - alert
  - toast
  - card
  - button
components:
  - EmptyState
---

# EmptyState

## Overview

An empty state takes the place of content that isn't there: it says why and offers the action that resolves it.

```tsx example=FirstProject

```

## Variants

| Variant          | Use for                                                       |
| ---------------- | ------------------------------------------------------------- |
| `align="start"`  | A state inside a card, a panel or a dialog. The default.      |
| `align="center"` | A state in place of a page's or a region's content.           |
| `tone="neutral"` | Nothing yet, or no results. The default.                      |
| `tone="danger"`  | Content that failed to load, with an action that tries again. |

### In place of content

`align="center"` centres the state in the height its region gives it.

```tsx example=InPlaceOfContent

```

### Failed to load

`tone="danger"` shows the error icon and announces the state. Try again shows its progress.

```tsx example=LoadFailed

```

## When to use

```tsx do=NoResults caption="No results: say so, and offer to clear the search."

```

```tsx dont=FirstUseForNoResults caption="The first-use state for a search that matched nothing."

```

```tsx do=OneAction caption="One action that resolves the state."

```

```tsx dont=CompetingActions caption="Several actions: none of them reads as the way forward."

```

### Content

```tsx do=SayWhatHappened caption="Say what happened, that work is safe, and what to do."

```

```tsx dont=ErrorCode caption="A code and an apology, with nothing to do next."

```

- Write the title as what is missing, in a few words, such as No projects yet.
- Name the action after what it does, such as Clear search.

## Anatomy

```tsx anatomy=EmptyStateAnatomy

```

1. **Container** (`env-empty-state`)
2. **Icon** (`env-empty-state > env-icon`, `icon`)
3. **Title** (`env-empty-state-description > env-text:first-child`, `title`)
4. **Description** (`env-empty-state-description > env-text:last-child`, `description`)
5. **Action** (`env-empty-state > env-button`, `action`)

`children` go below the description, such as a short list of next steps.

## Accessibility

### envUI provides

- The title as a heading of the level `headingLevel` sets.
- The icon hidden from assistive technology.
- The `alert` role on a danger state, so it is announced as it appears.

### You provide

- A `headingLevel` that fits the page's outline, and 1 when the state is the whole page.
- A count of results in a status region, where a state appears as people search.
- Focus for after the action removes the state, such as back to the search field.

## Changelog

- **1.0.0**: `tone="danger"` for `error`; the tone and alignment are `data-tone` and `data-align`, and the text column is `env-empty-state-description`.
- **0.7.0**: `align="center"`, for a state that takes the place of a page's or region's content.
- **0.4.0**: `headingLevel`, for an empty or error state that is the whole page.
- **0.2.0**: `tone="error"`, for content that failed to load.
- **0.1.0**: EmptyState.
