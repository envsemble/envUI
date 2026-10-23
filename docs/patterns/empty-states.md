---
title: Empty states
summary: Show what a region holds when it has nothing to show, tell first use from no results, done and failed, and offer the one way on.
status: beta
since: 1.0.0
intent: Keep people informed
aliases:
  - EmptyState
  - empty state
  - no results
  - no data
  - zero state
  - first use
  - nothing found
  - no access
useWhen:
  - A list, a table or a page has nothing to show, for any reason.
  - A search or filters match nothing.
  - Content failed to load, or people may not see it.
avoidWhen:
  - text: Content that is still loading.
    see: loading
  - text: Reporting that an action, such as a save, failed.
    see: feedback
composes:
  - Alert
  - PageHeader
  - SearchField
  - Select
  - List
  - Table
  - placeholders
  - Badge
  - Button
  - Surface
  - Column
  - Row
  - Text
---

# Empty states

## Overview

An empty state says why a region has nothing to show and what people can do, in place of the list or the table, under the heading and toolbar that stay: an icon, a heading, a sentence and the one action, in a [Column](../components/column.md) of [Text](../foundations/typography.md) and a [Button](../components/button.md). Until something exists, it holds the create action; then the page's own header action takes over.

```tsx example=FirstUse

```

## Variants

| Kind       | When                                        | Title                                    | Action               |
| ---------- | ------------------------------------------- | ---------------------------------------- | -------------------- |
| First use  | Nothing has been made yet                   | "No projects yet", and why they help     | Create the first one |
| No results | A search or a filter matches nothing        | "No matching projects", naming the query | Clear filters        |
| Done       | People cleared a queue                      | "No reviews waiting"                     | None                 |
| Failed     | The content couldn't load (an Alert)        | "Couldn't load documents"                | Try again            |
| No access  | The content exists, but not for this person | "You don't have access to this project"  | Request access       |

### No results

The search and filters stay, a count in a status says how many match, and Clear filters resets them and returns focus to the search.

```tsx example=NoResults

```

### Load failed

A failure is an [Alert](../components/alert.md) with `tone="danger"` and `announce`, so it is announced, in the room the table takes; it says the documents are safe and offers Try again.

```tsx example=LoadFailed

```

### No access

The state says who to ask, and Request access sends the request.

```tsx example=NoAccess

```

### All done

When the last review is approved, the queue says so plainly, with what comes next and no action.

```tsx example=AllDone

```

## When to use

```tsx do=OneAction caption="One action, the one that ends the state."

```

```tsx dont=CompetingActions caption="Several actions compete, and none says what ends the state."

```

- Show placeholders while content loads, and the empty state only once the answer is "nothing", as in [Loading](loading.md).
- Centred, with a 2.5 rem icon, where the state takes a region's place and the region gives it height; at the start, with a 1.5 rem icon, in a small card or under a list's toolbar.

### Content

- The title states the fact, the description says why or what next ([empty states](../foundations/content.md#empty-states)).
- Name the query in curly quotes: "Nothing matches “roadmap” with these filters."
- Keep a done state factual: "No reviews waiting", not "All caught up! Great job!".

## Anatomy

```tsx anatomy=EmptyStatesAnatomy

```

1. **The frame that stays** (`env-page-header`)
2. **Icon** (`env-page-header ~ * env-text > svg`)
3. **Heading** (`env-page-header ~ * env-text[data-variant='title']`)
4. **Description** (`env-page-header ~ * env-text[data-variant='body-sm']`)
5. **Action** (`env-page-header ~ * env-button`)

## Accessibility

An empty state doesn't take focus; <kbd>Tab</kbd> reaches its action after the toolbar. When the action makes the state go, move focus on: Clear filters to the search, Create project to the new list, Try again to the region's heading.

### envUI provides

- The icons hidden from assistive technology, so the heading and the sentence are what is read.

### You provide

- The heading's level, such as `render={<h4 />}` under a section's `h3`, so the state takes its place in the page's outline; its look stays the title type whatever the level.
- A danger Alert with `announce` for content that failed to load, so it is announced; a neutral state isn't.
- The right kind of state, its words and its one action.
- A count of results in a `role="status"` text beside a search, since a neutral state isn't announced.

## Changelog

- **1.0.0**: Empty states are built from Column, Text and Button, in place of the EmptyState component. The page is on the figure template.
