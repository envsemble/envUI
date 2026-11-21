---
title: RelativeTime
summary: A time shown relative to now, such as 3 hours ago, kept up to date.
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
  - Times that stay current while the page is open, such as Saved 2 minutes ago
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
---

# RelativeTime

## Variants

```tsx figure=Formats

```

1. **Long**
2. **Short**
3. **Narrow**

### Text for a label

```tsx figure=VersionLabels

```

## Anatomy

```tsx figure=RelativeTimeAnatomy

```

1. **Time** (`env-relative-time`, `value`)
