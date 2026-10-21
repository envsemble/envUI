---
title: Empty states
summary: Show what a region holds when it has nothing to show, tell first use from no results, done and failed, and offer the one way on.
status: beta
since: 1.0.0
intent: Keep people informed
aliases:
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
  - EmptyState
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
related:
  - loading
  - feedback
  - empty-state
  - list
  - table
---

# Empty states

## Overview

Use this pattern when a region has nothing to show, to say why and what people can do. "Empty" has four causes, and each needs its own words and action: nothing exists yet, nothing matches, everything is done, or the content failed to load or isn't theirs to see. The state takes the place of the list or the table, under the toolbar that stays.

```tsx example=FirstUse

```

## Anatomy

1. **The region's frame:** the heading and the toolbar of the list or table, a [PageHeader](../components/page-header.md) with its `toolbar` or a row of its own. It stays, so people can change what they asked for.
2. **The state:** an [EmptyState](../components/empty-state.md) in place of the [List](../components/list.md) or [Table](../components/table.md), with `align="center"` where it takes the region's place and the region gives it height, and `align="start"` inside a small card or panel.
3. **Title:** the fact, a heading at the `headingLevel` that fits the page's outline.
4. **Description:** why, or what comes next, in a sentence or two.
5. **Action:** at most one [Button](../components/button.md) that resolves the state: "Create project", "Clear filters", "Try again", "Request access". A cleared queue has none.
6. **Icon:** optional and decorative, such as a folder for first use or a lock for no access; `tone="danger"` brings the error icon.

## States and behaviour

| Kind       | When                                        | Title                                    | Action               |
| ---------- | ------------------------------------------- | ---------------------------------------- | -------------------- |
| First use  | Nothing has been made yet                   | "No projects yet", and why they help     | Create the first one |
| No results | A search or a filter matches nothing        | "No matching projects", naming the query | Clear filters        |
| Done       | People cleared a queue                      | "No reviews waiting"                     | None                 |
| Failed     | The content couldn't load (`tone="danger"`) | "Couldn't load documents"                | Try again            |
| No access  | The content exists, but not for this person | "You don't have access to this project"  | Request access       |

- **Not while loading.** Show placeholders while content loads, and the empty state only once the answer is "nothing", as [Loading](loading.md) describes.
- **No results keeps the filters.** The toolbar stays with the search and filters people set, a count in a status says how many match, and Clear filters resets them all and returns focus to the search.
- **Failed is announced.** An EmptyState with `tone="danger"` has the alert role, so it is announced when it appears. Try again shows the loading state, then the content or the error again.
- **First use offers the action once.** Until something exists, the empty state holds the create action; once it does, the page's own header action takes over.
- **Leaving the state.** When the action resolves the state, its button goes with it: move focus to what replaced it, such as the new list, the search field or the region's heading.
- **Height.** A centred state fills the height of the region it replaces, which the application gives it; it never makes a small card or dialog taller.

## Content guidelines

- Follow [Empty states](../foundations/content.md#empty-states): the title states the fact, the description says why or what next, and the action says what it does.
- Name the query in a no-results description, inside curly quotes: "Nothing matches “roadmap” with these filters."
- In a failure, say that people's work is safe, and avoid codes and blame, as [Error messages](../foundations/content.md#error-messages) describes.
- Keep a done state factual: "No reviews waiting", not "All caught up! Great job!".

## Do and don't

### Do

- Tell first use, no results, done, failed and no access apart, with their own words.
- Keep the toolbar and the page's heading in place around the state.
- Offer one action, and return focus to where people continue when it resolves the state.
- Set `headingLevel` to fit the page's outline.

### Don't

- Don't show an empty state while content is loading.
- Don't offer several competing actions, or decoration that pushes the message down.
- Don't celebrate an empty queue.
- Don't report a failed save or another failed action with an empty state; see [Notifications and feedback](feedback.md).

## Accessibility

### Focus and keyboard

An empty state doesn't take focus when it appears. Its action is reached with Tab after the toolbar. When the action makes the state go away, move focus on: Clear filters returns it to the search field, Create project to the list that appears, Try again to the region's heading while the content loads, and Request access to the region that now says the request was sent. When the last item of a queue goes, focus moves to the region's heading.

### envUI provides

- The title as a heading of `headingLevel`, so the state is in the page's outline.
- The alert role on a `tone="danger"` state, so a failure is announced as it appears.
- The icon hidden from assistive technology.

### You provide

- The right kind of state, with its words and its one action.
- A `headingLevel` that fits the page, and the region's height for a centred state.
- A count of results in a `role="status"` text beside a search or filters, since a neutral state that appears as people type isn't announced.
- Focus for when the action makes the state go away.

## Examples

### No results

The search and the status filter stay above the state, which names the query, and a count says how many match. Clear filters resets both and returns focus to the search.

```tsx example=NoResults

```

### Load failed

In place of the table, a danger state says the documents are safe and offers Try again. The heading and the page's action stay.

```tsx example=LoadFailed

```

### No access

The project exists, but not for this person: the state says who to ask, and Request access sends the request.

```tsx example=NoAccess

```

### All done

When the last review is approved, the queue says so plainly, with what comes next and no action.

```tsx example=AllDone

```
