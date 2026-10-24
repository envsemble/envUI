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
  - A list, a table or a page with nothing to show
  - A search or filters that match nothing
  - Content that failed to load, or that people may not see
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

The state takes the place of the list or the table, under the heading and toolbar that stay: an icon, a heading, a sentence and the one action. Until something exists, it holds the create action; then the page's own action takes over.

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

The search and filters stay, a count says how many match, and Clear filters resets them.

```tsx example=NoResults

```

### Load failed

A failure is a danger [Alert](../components/alert.md), announced as it appears, in the room the table takes; it says the documents are safe.

```tsx example=LoadFailed

```

### No access

The state says who to ask, and Request access sends the request.

```tsx example=NoAccess

```

### All done

When the last review is approved, the queue says so, and what comes next.

```tsx example=AllDone

```

## When to use

```tsx do=OneAction caption="One action, the one that ends the state."

```

```tsx dont=CompetingActions caption="Several actions compete, and none says what ends the state."

```

### Placement

Centre the state, with a large icon, where it takes a region's place and the region gives it height. In a small card or under a list's toolbar, start it at the edge, with a smaller icon.

### Content

The title states the fact and the description says why or what next, as [content](../foundations/content.md) describes. Name the query in curly quotes, "Nothing matches “roadmap” with these filters.", and keep a done state factual: "No reviews waiting", not "All caught up! Great job!".

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

## In code

### Usage

An empty state is a Column of Text and a Button, with no component of its own: the icon in a muted Text, the heading as Text with `variant="title"` at the level the outline needs, such as `render={<h4 />}`, the description as Text with `variant="body-sm"`, then the one Button. Render it in place of the List or the Table when there is nothing to show, and once something exists, show the page's own action instead.

```tsx source=FirstUse

```

#### Placement and icon size

Centred, the Column takes `align="center"`, `justify="center"` and `textAlign: 'center'`, with a 2.5 rem icon, in a region that gives it height, such as a Surface with a `minBlockSize`. At the start, under a toolbar or in a small card, it keeps the default alignment and a 1.5 rem icon.

#### No results

Keep the SearchField and the Select in the PageHeader's `toolbar`, and say the count of matches in a Text with `role="status"`, since a neutral state isn't announced. Clear filters resets the query and the filters, then focuses the search, as the button goes with the state.

#### Load failed

A failure is an Alert with `tone="danger"` and `announce`, its Try again Button in `action`, in the table's place. Try again moves focus to the region's heading, a Text with `tabIndex={-1}` and a ref, while the same Table loads as a `skeleton` over `placeholders()` rows.

```tsx source=LoadFailed

```

## Changelog

- **1.0.0**: Empty states are built from Column, Text and Button, in place of the EmptyState component. The page is on the figure template.
