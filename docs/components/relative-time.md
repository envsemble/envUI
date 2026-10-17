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

RelativeTime shows a moment as text relative to now, such as "3 hours ago" or "in 2 days", in a native `<time>` element that carries the exact moment. The words come from the browser's `Intl.RelativeTimeFormat`, in any language, and one shared clock keeps every time on the page current while it stays open. Hovering the text shows the date and time in a tooltip.

`formatRelativeTime` returns the same text as a string, for places that take only text, such as an option label or an accessible name. It runs anywhere, also on a server.

```tsx example=DraftSaved

```

## Variants and sizes

| Format   | Reads as    | Use for                                                      |
| -------- | ----------- | ------------------------------------------------------------ |
| `long`   | 3 hours ago | Running text and most lists. The default.                    |
| `short`  | 3 hr. ago   | Dense lists and table cells where space is short.            |
| `narrow` | 3h ago      | Toolbars and other tight spots where every character counts. |

- The time takes the font, size and color of the text around it, with tabular digits, so a count that changes doesn't move the text beside it.
- The text wraps like the text around it in a narrow container.

## States and behaviour

- **Rounding**: the text rounds to the nearest unit and changes halfway between counts. Less than 45 seconds away is "just now", or "now" for a coming moment; then minutes below 45, hours below 22, days below a week, weeks below 26 days, months below 11, and years.
- **Counts, not calendar words**: counts stay numbers, such as "1 day ago" rather than "yesterday", since 24 hours ago is not always yesterday by the calendar.
- **Kept current**: one shared clock wakes every second while a moment is less than a minute away, every minute while one is less than a day away and every hour beyond, and reads the time again at once when a hidden page shows again. Only times whose text changed render again. A new `value` joins the clock at once.
- **Tooltip**: hovering the text shows the date and time, such as "Oct 14, 2026, 9:41 AM", in the reader's time zone and the `locale`, once the pointer rests on it for 400 ms; <kbd>Esc</kbd> closes it. `tooltip={false}` leaves it out. Inside an application's own [Tooltip](../components/tooltip.md), that tooltip describes the time instead.
- **Languages**: `locale` sets the language of the text and of the tooltip, such as `de` for "vor 3 Stunden"; without it, EnvUIProvider's `locale`, and else the browser's language. `nowLabel`, or else EnvUIProvider's `messages.relativeTime.now`, replaces the text for moments under 45 seconds away; without either, English says "just now" and other languages the locale's own word. The text keeps its own direction, so English reads in order inside right-to-left text.
- **Invalid moments**: a `value` that is not a valid moment renders nothing, and `formatRelativeTime` returns an empty string. An invalid `now` is ignored, and the text follows the clock.
- **A fixed now**: `now` compares with a fixed moment instead of the clock, for tests and server rendering; the text then stays as it is.
- **Server rendering**: on the server the text follows the server's clock and language. The page hydrates without a mismatch error and then shows the browser's text, so a page rendered earlier, or in another language, corrects itself at once. Pass the same `now` on the server and in the browser for identical output, as tests need.

## Content guidelines

- Put the event before the time, such as "Updated 3 hours ago" or "Review due in 2 days", so the time never stands alone.
- Use relative time for recent activity and near deadlines. Show the date itself where people must act on the exact moment, such as a due date or a booking.
- Where both matter, show the date and the relative time together, such as "Invoice sent on March 2, 2026 (2 days ago)", and set `tooltip={false}`.
- Use one format per list, usually `long`; keep `short` and `narrow` for tight spaces.
- Set the page's language as `locale` on EnvUIProvider, or on the time, and write the words around the time in the same language.

## Do and don't

### Do

- Pass the moment as it comes from your data, a `Date`, milliseconds or an ISO 8601 string, and let RelativeTime keep the text current.
- Use `formatRelativeTime` where only a string fits, such as an option label, and know that the string doesn't update by itself.
- Pass `now` in tests and to both the server and the browser where their output must match.

### Don't

- Don't run your own timer to update relative times; the shared clock already does it for every time on the page.
- Don't put the only copy of an exact date in the tooltip; it shows on hover only.
- Don't use relative times for moments far in the past in records people compare, such as invoices from last year; a date reads faster.

## Accessibility

### Keyboard

| Key                                             | Action                                                        |
| ----------------------------------------------- | ------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Pass over the time: it is not focusable and handles no keys.  |
| <kbd>Esc</kbd>                                  | Closes the date and time tooltip opened by hovering the time. |

### envUI provides

- A native `<time>` element whose `dateTime` holds the exact moment in ISO 8601.
- Text in the `locale`, with `dir="auto"` so it keeps its own direction inside text in another direction.
- Updates without announcements: the text changes in place as the clock moves, without a live region, so it never interrupts.
- Tabular digits, so a changing count doesn't shift the text around it.

### You provide

- The words that say what happened or what is due, around the time.
- The exact date in visible text where it matters. The tooltip opens on hover only, and the time is not focusable, so keyboard and screen reader users don't reach it.
- A `locale` that matches the page's language, on EnvUIProvider or the time.

## Examples

### Past and coming moments

Past moments read "ago" and coming ones "in"; the unit grows with the distance, from minutes to years.

```tsx example=PastAndComing

```

### Formats

`short` and `narrow` shorten the words for tight spaces.

```tsx example=Formats

```

### Other languages

`locale` writes the text, and the date in the tooltip, in another language.

```tsx example=Languages

```

### The exact date nearby

Where the date shows beside it, the relative time needs no tooltip.

```tsx example=ExactDateNearby

```

### Text for an option label

`formatRelativeTime` returns the same text as a string, for places that take only text. The string doesn't update by itself.

```tsx example=VersionLabels

```

## Changelog

- **1.0.0**: RelativeTime takes EnvUIProvider's `locale` and `messages.relativeTime.now`. `formatRelativeTime` runs in React Server Components; RelativeTime is a client component.
- **0.6.0**: RelativeTime and `formatRelativeTime`, with `format`, `locale`, `nowLabel`, `now` and `tooltip`, kept current by one shared clock.
