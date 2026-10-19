---
title: Badge
summary: Small static pills that name a state in its tone or a piece of metadata, show a count, or the size of a change.
status: stable
since: 0.5.0
category: Content & guidance
aliases:
  - Counter
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
  - A number belongs to a label, such as unread messages beside a navigation item or comments on a button (CounterBadge).
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
    use: Stat
related:
  - card
  - nav-list
  - button
  - stat
  - code
  - colors
components:
  - Badge
  - CounterBadge
  - DiffStat
---

# Badge

## Overview

A badge is a small pill that names a state beside the content it describes, such as Blocked beside a project's name, or a piece of neutral metadata, such as Current plan. Its tone carries the meaning and its text says it, so the state reads without color. Badges are static: they don't respond to the pointer or the keyboard.

The family shares the pill:

- **CounterBadge** shows a count, such as unread messages beside a navigation item, with a full name for assistive technology.
- **DiffStat** shows the size of a change in one pill, such as +12 −3, with additions in the success tone and deletions in the danger tone.

```tsx example=ProjectStatus

```

## Anatomy

1. **Pill**: fully rounded, with the tone's tint, fill or border by `variant`.
2. **Icon** (optional, `icon`): decorative, 0.875 rem, before the label in the tone's color.
3. **Label** (`children`): 0.75 rem text in medium weight, on one line; it ends with an ellipsis when the badge is wider than its container.

CounterBadge is a pill with the count (`value`) in tabular figures, and a visually hidden name (`aria-label`) where one is given. DiffStat is a pill with the additions, the deletions and a visually hidden name (`formatLabel`).

## Variants and sizes

| Variant   | Use for                                                                                                   |
| --------- | --------------------------------------------------------------------------------------------------------- |
| `soft`    | Most states, in lists, tables and headings: the tone's light tint with text in the tone. The default.     |
| `solid`   | A state that must stand out, such as Overdue: the tone's fill with text in the on-tone color. Use rarely. |
| `outline` | Names and categories, such as a team or a folder: a border in the tone and no fill.                       |

| Tone      | Use for                                                                                              |
| --------- | ---------------------------------------------------------------------------------------------------- |
| `neutral` | A state without urgency, such as Archived or Draft, and metadata, such as Current plan. The default. |
| `accent`  | The current or highlighted state, such as In review or New.                                          |
| `success` | Done well or healthy, such as Ready or Approved.                                                     |
| `warning` | Needs attention soon, such as Blocked or Expiring.                                                   |
| `danger`  | Failed or at risk, such as Failed or Overdue.                                                        |
| `done`    | Completed work, in purple, such as Completed or Merged.                                              |

CounterBadge is `neutral`, a quiet fill with text in the primary color, or `accent`, the accent fill with text in the on-tone color, for counts that need attention.

<!-- specimen: VariantMatrix -->

- A badge is about 1.3 rem tall, with 0.0625 rem block padding, 0.5 rem inline padding and 0.25 rem between the icon and the label. It is as wide as its content, at most its container's width, and lines up with the middle of the text beside it.
- A CounterBadge and a DiffStat are 1.25 rem tall, 1 rem in the compact scale (`--env-counter-badge-height`), with 0.375 rem inline padding; a CounterBadge is at least as wide as it is tall, so a single digit shows as a circle. DiffStat keeps 0.25 rem between its two numbers.
- Tone text keeps 4.5:1 contrast on the canvas, panes and rows in both themes, also over the soft tint.

## States and behaviour

- Badges have no interactive states: they are not focusable and don't respond to the pointer or the keyboard.
- **In a button**, such as a tab with a count, a badge takes the button's text color as an outlined pill. A CounterBadge keeps its own filled pill, and a DiffStat sits on a pill that leans back toward the canvas so its tones keep their contrast; on the solid fills of primary and important buttons, both take the button's text color as an outlined pill instead.
- **In navigation**, NavList.Item shows a CounterBadge as its `end` content, and a small dot instead while the item is icon-only, whose name then says the count.
- **Names**: a CounterBadge with `aria-label` hides its visible value from assistive technology and reads the label instead, such as "12 unread". A DiffStat always reads its label once instead of the signs, "12 added lines and 3 removed lines" by default.

## Content guidelines

- Name a state in one or two words, in sentence case: "In review", "Blocked", "Ready". Use the same word for the same state everywhere.
- Keep metadata as short: "Current plan", "12 of 20 seats". A badge stays on one line, so a long value ends with an ellipsis.
- Choose the tone by meaning, not decoration, and keep the word meaningful on its own.
- Keep counts short: show "99+" beyond two or three digits, with the full meaning in `aria-label`, such as "More than 99 unread".
- Give a CounterBadge an `aria-label` when the number needs context, such as "12 unread"; a count inside a button whose label says what it counts, such as Comments, can do without.
- Word a DiffStat's name for other units with `formatLabel`, such as "12 added files and 3 removed files"; for another language, set `messages.diffStat.label` on EnvUIProvider.

## Do and don't

### Do

- Put a badge right beside what it describes, such as after a title or in a table cell.
- Use soft badges in lists and tables, and keep solid badges for the one state that must stand out.
- Use neutral badges for metadata, such as a plan or a count, beside the content it describes.
- Use the same tone for the same state across the application.

### Don't

- Don't make a badge look or act like a button or a filter; use [Button](../components/button.md) or [SegmentedControl](../components/segmented-control.md).
- Don't put a sentence in a badge; use [Alert](../components/alert.md) for a message.
- Don't use color as the only difference between two states; name them differently.
- Don't use a CounterBadge for a number that stands on its own, such as a headline figure; use [Stat](../components/stat.md).

## Accessibility

### envUI provides

- Badge labels as text, read in place with the content around them; icons are decorative and hidden from assistive technology.
- A CounterBadge's `aria-label` as visually hidden text that replaces the hidden value, so it is read on a plain `span` too.
- A DiffStat named once, by `messages.diffStat.label` or `formatLabel`, with the signs and numbers hidden from assistive technology; the numbers in the locale's digits.
- Tone colors that keep 4.5:1 contrast for text on the canvas, panes and rows in both themes, also inside buttons.

### You provide

- A label that says the state in words, not only in its tone.
- An `aria-label` on a CounterBadge whose number doesn't explain itself, and a translated `messages.diffStat.label` where the interface is not in English.
- An announcement when a count changes in a way people need to know about at once, such as in a status region.

## Examples

### Tones

Each tone carries a meaning; the word says it too.

```tsx example=Tones

```

### Emphasis

Soft badges suit most states; a solid badge stands out for the one state that must, and outline badges mark names and categories.

```tsx example=Emphasis

```

### Neutral metadata

A neutral badge holds a fact about the content beside it, such as the plan a card describes or its seats, in place of 0.x's InfoChip.

```tsx example=NeutralMetadata

```

### With an icon

A decorative icon before the label repeats the state at a glance.

```tsx example=WithIcon

```

### Counts in navigation

A CounterBadge as a NavList.Item's `end` content, with an `aria-label` that says what it counts; the accent tone marks the count that needs attention.

```tsx example=NavigationCounts

```

### Counts in buttons

In a button, a CounterBadge keeps its own pill and a DiffStat sits on a pill toward the canvas; on a primary button they take the button's text color as an outlined pill.

```tsx example=CountsInButtons

```

### The size of a change

DiffStat beside each changed file, read as "124 added lines and 37 removed lines".

```tsx example=ChangeSize

```

## Changelog

- **1.0.0**: InfoChip is Badge, a pill, and its page joins this one. The `subtle` variant is `soft`. `Counter` is `CounterBadge` and `DiffCount` is `DiffStat`, with their props types and the `env-counter-badge-*` and `env-diff-stat-*` classes; the page is `badge`. DiffStat writes its numbers and its name in the locale, and its name comes from `messages.diffStat.label`. A control sets the badges inside it through the `--env-badge-*`, `--env-counter-badge-*` and `--env-diff-stat-*` hooks.
- **0.7.0**: DiffCount; a counter in a button keeps its own filled pill, except on primary and important fills.
- **0.5.0**: Badge in six tones and three variants, and Counter; in a button, a badge or counter takes the button's text color as an outlined pill.
