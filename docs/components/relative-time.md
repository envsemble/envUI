---
title: RelativeTime
summary: A moment as text relative to now, such as 3 hours ago, kept current, with the date and time
  in a tooltip.
status: stable
since: 1.0.0
category: Data display
aliases:
  - time ago
  - timeago
  - from now
  - relative date
  - timestamp
  - date
  - formatRelativeTime
useWhen:
  - How long ago or how soon, more than the exact moment, such as a review due
  - Times that stay current while the page is open, such as Draft saved 2 minutes ago
  - How long ago as plain text, such as in an option's label
avoidWhen:
  - text: Choosing a date, or a date and time.
    use: DatePicker
  - text: Days shown on a month grid.
    use: Calendar
components:
  - RelativeTime
  - formatRelativeTime
examples:
  DraftSaved:
    role: overview
    motion: true
  PastAndComing:
    role: overview
    caption: Past moments read ago, coming ones in.
    motion: true
  Formats: variants
  VersionLabels: example
  RelativeTimeAnatomy: anatomy
  ExactDateNearby:
    role: do
    caption: Show the date where it matters, with the relative time beside it.
---

# RelativeTime

## Variants

```tsx figure=Formats

```

1. **Long**
2. **Short**
3. **Narrow**

| Format | Reads as    | Use for                           |
| ------ | ----------- | --------------------------------- |
| Long   | 3 hours ago | Text and most lists. The default. |
| Short  | 3 hr. ago   | Dense lists and table cells.      |
| Narrow | 3h ago      | Toolbars and other tight spots.   |

### Text for a label

The same text comes as plain text too, for a place that takes only text, such as an option's label. It doesn't update by itself.

```tsx figure=VersionLabels

```

## Anatomy

```tsx figure=RelativeTimeAnatomy

```

1. **Time** (`env-relative-time`, `value`)

## Behaviour

### Rounding and languages

The text rounds to the nearest unit and stays a count: 1 day ago, never yesterday.

- It speaks the application's language, else the browser's, or one of its own, such as German: vor 3 Stunden.
- Where the exact moment shows nearby, it can leave out its tooltip.

## Rules

The words around a relative time say what happened, and the exact date shows where it matters.

```tsx figure=ExactDateNearby

```

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

## Compose

### Usage

RelativeTime's `value` is the moment: a Date, milliseconds since 1970 or a date string, such as an ISO 8601 timestamp; an invalid one renders nothing. The text rounds to the nearest unit and stays a count, and every RelativeTime on the page updates from one shared clock, so don't run a timer of your own. The tooltip shows the date and time in the reader's time zone; `tooltip={false}` leaves it out where the exact moment shows nearby.

```tsx source=DraftSaved

```

#### Formats and languages

`format` is `long`, the default, `short` or `narrow`, in the locale's own wording from `Intl.RelativeTimeFormat`. `locale` sets the language as a BCP 47 tag, such as `de` for vor 3 Stunden, or a list of them; without it, EnvUIProvider's `locale`, else the browser's. `nowLabel` is the text for a moment less than 45 seconds away, by default just now, or now for a coming one, which EnvUIProvider's `messages.relativeTime.now` can set.

```tsx
<RelativeTime value={updatedAt} format="short" locale="de" />
```

#### Text for a label

`formatRelativeTime(value, options)` returns the same text as a string, with the same `format`, `locale`, `nowLabel` and `now`, for a place that takes only text, such as an option's label or an accessible name. It doesn't update by itself, and runs in React Server Components; RelativeTime is a client component.

```tsx
const options = versions.map((version, index) => ({
  value: version.id,
  label: `Version ${versions.length - index} · saved ${formatRelativeTime(version.savedAt)}`,
}));
```

#### Exact moments and tests

Where people must read the moment exactly, format the date with `Intl.DateTimeFormat` instead. `now` fixes the moment to compare with, so the text stays as it is: pass the same `now` to the server and the browser where their output must match, as in tests.

```tsx
const date = new Intl.DateTimeFormat(undefined, { dateStyle: 'long' }).format(sentAt);

<Text>
  Invoice sent on {date} (<RelativeTime value={sentAt} tooltip={false} />)
</Text>;
```

### Composition

RelativeTime is a native `<time>`, `env-relative-time`, whose `dateTime` holds the exact moment, with the quiet dotted underline, `env-hover-detail`, that marks text with more on hover.

## Changelog

- **1.0.0**: RelativeTime's time, which shows the full date in a tooltip, takes the quiet dotted underline, `env-hover-detail`, that marks text with more on hover. RelativeTime takes EnvUIProvider's `locale` and `messages.relativeTime.now`. `formatRelativeTime` runs in React Server Components; RelativeTime is a client component.
