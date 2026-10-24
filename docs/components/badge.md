---
title: Badge
summary: Small static pills that name a state in its tone or a piece of metadata, show a count, or the size of a change.
status: stable
since: 0.5.0
category: Content & guidance
aliases:
  - Counter
  - CounterBadge
  - DiffCount
  - InfoChip
  - info chip
  - chip
  - chips
  - metadata
  - status badge
  - status
  - tag
  - lozenge
  - label
  - pill
  - count
  - counter
  - notification count
  - unread count
  - diff count
  - change size
useWhen:
  - A short state sits beside the content it describes, such as In review, Blocked or Archived.
  - A short name or category marks an item, such as a team or a folder (`variant="outline"`).
  - A piece of neutral metadata sits beside related content, such as a plan or a count of seats.
  - A number belongs to a label, such as unread messages beside a navigation item or comments on a button (`count`).
  - The size of a change shows beside a file or a version, such as +12 −3 (DiffStat).
avoidWhen:
  - text: An action, or a choice people turn on and off, even when it looks like a pill.
    use: Button
  - text: Choosing one of a few filters or views.
    use: SegmentedControl
  - text: A message about a page or section that needs a sentence.
    use: Alert
  - text: How full or complete something is, such as storage used.
    use: Meter
  - text: A headline number with its label and trend, such as on a dashboard.
    see: key-figures
  - text: A count beside a destination in the navigation, which a Drawer item shows with `count`.
    use: Drawer
  - text: An identifier or a command in text.
    use: Code
components:
  - Badge
  - DiffStat
---

# Badge

## Overview

```tsx example=ProjectStatus

```

```tsx example=CountsInButtons caption="With count, a compact count, here inside buttons."

```

```tsx example=ChangeSize caption="DiffStat: the size of a change."

```

## Variants

```tsx variants=Emphasis

```

1. **Soft**
2. **Solid**
3. **Outline**

| Variant   | Use for                                             |
| --------- | --------------------------------------------------- |
| `soft`    | Most states, in lists, tables and headings.         |
| `solid`   | The one state that must stand out, such as Overdue. |
| `outline` | Names and categories, such as a team or a folder.   |

```tsx variants=Tones

```

1. **Neutral**
2. **Accent**
3. **Success**
4. **Warning**
5. **Danger**
6. **Done**

| Tone      | Use for                                               |
| --------- | ----------------------------------------------------- |
| `neutral` | No urgency, such as Draft, and metadata. The default. |
| `accent`  | The current or highlighted state, such as In review.  |
| `success` | Done well or healthy, such as Ready.                  |
| `warning` | Needs attention soon, such as Blocked.                |
| `danger`  | Failed or at risk, such as Failed.                    |
| `done`    | Completed work, such as Merged.                       |

A count takes the same tones and variants: neutral and soft by default, and `tone="accent" variant="solid"` for a count that needs attention.

## When to use

```tsx do=SoftInLists caption="Soft badges in a list, and solid only for the state that must stand out."

```

```tsx dont=SolidEverywhere caption="Solid badges everywhere: none of them stands out."

```

- Give the same state the same word and tone everywhere.
- Don't let the tone carry the meaning alone: the word says it.

### Content

- Show `99+` beyond two digits, with the full count in `aria-label`.

### In navigation

```tsx example=NavigationCounts

```

## Anatomy

```tsx anatomy=BadgeAnatomy

```

1. **Pill** (`env-badge`)
2. **Icon** (`env-badge > env-icon`, `icon`)
3. **Label** (`env-badge-label`, `children`)

A count is `env-badge[data-count]`, with `env-badge-count-label` for its `aria-label`; DiffStat has `env-diff-stat-additions` and `env-diff-stat-deletions`.

### Colors

`--env-badge-container`, `--env-badge-content` and `--env-badge-outline` set the colors of one Badge, through `style` or CSS. Its hover, focus and press then follow them, as state layers; with none set, it keeps its own colors.

## Adapting to width

A badge stays on one line and ends with an ellipsis where its container is narrower.

```tsx example=LongState widths="10 20"

```

## Accessibility

### envUI provides

- The label as text, read in place; the icon hidden.
- A count's `aria-label` read instead of its number.
- A DiffStat named once, such as 12 added lines and 3 removed lines, from `messages.diffStat.label` or `formatLabel`.

### You provide

- An `aria-label` on a count whose number doesn't explain itself, such as 12 unread.
- A status region where a change of count must be announced.

## Changelog

- **1.0.0**: InfoChip is Badge, a pill, and its page joins this one. The `subtle` variant is `soft`. `Counter` is a Badge with `count`, which the `v1-structure` codemod writes, `.env-badge[data-count]` with `env-badge-count-label`, and `DiffCount` is `DiffStat`, with its props type and the `env-diff-stat-*` classes; the page is `badge`. DiffStat writes its numbers and its name in the locale, and its name comes from `messages.diffStat.label`. A control sets the badges inside it through the `--env-badge-*`, `--env-badge-count-*` and `--env-diff-stat-*` hooks.
- **0.7.0**: DiffCount; a counter in a button keeps its own filled pill, except on primary and important fills.
- **0.5.0**: Badge in six tones and three variants, and Counter; in a button, a badge or counter takes the button's text color as an outlined pill.
