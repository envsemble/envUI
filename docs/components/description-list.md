---
title: DescriptionList
summary: The facts about one thing, as labels and their values, beside each other or stacked by the list's own width.
status: beta
since: 1.0.0
category: Content & guidance
aliases:
  - facts
  - fact list
  - key-value list
  - key value pairs
  - definition list
  - property list
  - details
  - metadata
  - dl
useWhen:
  - A page, card or sidebar shows the facts about one item, such as a project's owner, status and dates.
  - Settings of one item sit beside their labels, each a small control, such as a visibility Select.
avoidWhen:
  - text: Many items compared by the same fields.
    use: Table
  - text: Items people open or act on, one per row.
    use: List
  - text: A form that people fill in and submit.
    use: Field
  - text: One headline number with its trend.
    see: key-figures
related:
  - table
  - list
  - card
  - key-figures
  - loading
components:
  - DescriptionList
---

# DescriptionList

## Overview

DescriptionList shows the facts about one thing as labels and their values.

```tsx example=Facts

```

## Variants

| Layout    | Labels                                               | Use for                           |
| --------- | ---------------------------------------------------- | --------------------------------- |
| `auto`    | Beside their values, or above them in a narrow list. | Most lists. The default.          |
| `inline`  | Beside their values at every width.                  | A wide region that never narrows. |
| `stacked` | Above their values at every width.                   | Long values, such as addresses.   |

`size="md"` sets the list in body text, for a page of details; `sm`, the default, suits a card or a pane.

```tsx example=Stacked caption="The stacked layout, in the md size."

```

## When to use

```tsx do=ControlsAligned caption="With controls, each label sits on its control's line."

```

```tsx dont=ControlsUnaligned caption="Without controls: labels sit higher than the controls beside them."

```

- No headings or long paragraphs in values: link to them.
- Don't nest description lists.

### Content

```tsx do=ShortLabels caption="Short nouns as labels, and a dash for a value not set."

```

```tsx dont=WordyLabels caption="Questions, colons and empty values."

```

## Anatomy

```tsx anatomy=DescriptionListAnatomy

```

1. **List** (`env-description-list`)
2. **Item** (`env-description-list-item`)
3. **Label** (`env-description-list-label`, `label`)
4. **Value** (`env-description-list-value`, `children`)

## Adapting to width

In the `auto` layout, labels move above their values where the list is narrower than 24 rem.

```tsx example=FactsAtWidths widths="16 30"

```

## Accessibility

### envUI provides

- A `dl` of `dt` and `dd` pairs, read as terms and their values.
- Labels and values in reading order in every layout.

### You provide

- An `aria-label` on each list where a page has several.
- A name on each control in a value: the label beside it isn't one.

## Changelog

- **1.0.0**: DescriptionList, with `layout`, `size` and `controls`.
