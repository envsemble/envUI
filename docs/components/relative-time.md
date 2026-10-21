---
title: RelativeTime
summary: A moment as text relative to now, such as 3 hours ago, kept current, with the date and time
  in a tooltip.
status: stable
since: 0.6.0
category: Content & guidance
aliases:
  - time ago
  - timeago
  - from now
  - relative date
  - timestamp
  - date
  - formatRelativeTime
useWhen:
  - How long ago or how soon matters more than the exact moment, such as when a report changed or when a review is due.
  - Activity and lists where times update while the page stays open, such as Draft saved 2 minutes ago.
  - A string that says how long ago, for a place that takes only text, such as an option label or an accessible name (formatRelativeTime).
avoidWhen:
  - text: A moment people must read exactly, such as a deadline, an appointment or the date of a record; format the date with Intl.DateTimeFormat.
  - text: Choosing a date, or a date and time.
    use: DatePicker
  - text: Days shown on a month grid.
    use: Calendar
  - text: A count that changes in place, such as seats left.
    use: AnimatedNumber
related:
  - tooltip
  - date-picker
  - animated-number
  - table
components:
  - RelativeTime
  - formatRelativeTime
---

# RelativeTime

## Overview

RelativeTime shows a moment relative to now, such as 3 hours ago, and keeps it current while the page stays open.

```tsx example=DraftSaved

```

```tsx example=PastAndComing caption="Past moments read ago, coming ones in."

```

### Text for a label

`formatRelativeTime` returns the same text as a string, for an option label or a name. It doesn't update by itself.

```tsx example=VersionLabels

```

### Rounding and languages

The text rounds to the nearest unit and stays a count: 1 day ago, never yesterday. Hovering it shows the exact date and time; `tooltip={false}` leaves that out. `locale` sets the language, such as `de` for vor 3 Stunden; without it, EnvUIProvider's `locale`, else the browser's.

## Variants

```tsx example=Formats

```

| Format   | Reads as    | Use for                           |
| -------- | ----------- | --------------------------------- |
| `long`   | 3 hours ago | Text and most lists. The default. |
| `short`  | 3 hr. ago   | Dense lists and table cells.      |
| `narrow` | 3h ago      | Toolbars and other tight spots.   |

## When to use

```tsx do=EventFirst caption="Put the event first, so the time never stands alone."

```

```tsx dont=TimeAlone caption="A time on its own: people can't tell what happened."

```

```tsx do=ExactDateNearby caption="Show the date where it matters, with the relative time beside it."

```

```tsx dont=DateOnlyInTooltip caption="The date only in the tooltip: keyboards and screen readers never reach it."

```

- Don't run a timer of your own: one shared clock updates every time on the page.
- Pass the same `now` to the server and the browser where their output must match, as in tests.

## Anatomy

```tsx anatomy=RelativeTimeAnatomy

```

1. **Time** (`env-relative-time`, `value`)

## Accessibility

### Keyboard

| Key            | Action                                 |
| -------------- | -------------------------------------- |
| <kbd>Esc</kbd> | Closes the tooltip opened by hovering. |

### envUI provides

- A native `<time>` whose `dateTime` holds the exact moment.
- Text that changes in place without announcements.
- Its own direction inside text of another direction.

### You provide

- The words around the time that say what happened.
- The exact date in visible text where it matters.
- A `locale` that matches the page.

## Changelog

- **1.0.0**: RelativeTime takes EnvUIProvider's `locale` and `messages.relativeTime.now`. `formatRelativeTime` runs in React Server Components; RelativeTime is a client component.
- **0.6.0**: RelativeTime and `formatRelativeTime`, with `format`, `locale`, `nowLabel`, `now` and `tooltip`, kept current by one shared clock.
