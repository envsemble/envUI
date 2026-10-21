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
    use: Stat
related:
  - table
  - list
  - card
  - stat
  - loading
components:
  - DescriptionList
---

# DescriptionList

## Overview

DescriptionList shows the facts about one thing as labels and their values: a `dl` whose items are its terms with their values. Labels are muted and line up in a column as wide as the longest; below 24 rem of the list's own width, each label moves above its value, so a list in a sidebar or on a phone needs no other layout.

```tsx example=Facts

```

## Anatomy

1. **Root** (`DescriptionList.Root`): the `dl`, with `layout`, `size` and `controls`.
2. **Item** (`DescriptionList.Item`): a `div` around one term and its value.
3. **Label** (`label`): the `dt`, in muted text, wrapping between words only.
4. **Value** (`children`): the `dd`: text, a link, a Badge, or a control.

## Variants and sizes

| Layout           | Labels                                                         | Use for                                          |
| ---------------- | -------------------------------------------------------------- | ------------------------------------------------ |
| `auto` (default) | Beside their values, above them below 24 rem of the list width | Most lists, wherever they are placed             |
| `inline`         | Beside their values at every width                             | A wide region that never narrows, such as a page |
| `stacked`        | Above their values at every width                              | Long values, such as addresses or descriptions   |

- **Size**: `sm`, the default, sets the list in the smaller body text, for facts beside other content, such as in a card or a sidebar; `md` in body text, for a page of details.
- **Controls**: `controls` makes each row at least as tall as a small control, 2 rem, and puts each label on its control's line, for values that are a Select, a Switch or a small Button.

## States and behaviour

- DescriptionList has no states and handles no keys; the controls in its values handle their own.
- The values wrap anywhere rather than widen the list; labels wrap between words.
- **Loading**: while the facts load, render the list in a surface with `skeleton`, its values given as undefined, so it keeps its shape, as [Loading](../patterns/loading.md) shows.

## Content guidelines

- Write labels as short nouns, such as "Owner" or "Last updated", without a colon.
- Show a value people can't see yet as a dash or "None", not an empty space.
- Keep the order the same on every item of a kind, most important first.

## Do and don't

### Do

- Group the facts about one item in one list, and give the list a name where the page has several.
- Use `controls` when the values are controls, so the rows line up.
- Let the list stack by its own width with the default `auto` layout.

### Don't

- Don't use a description list for many items with the same fields; use a [Table](../components/table.md).
- Don't put headings or long paragraphs in values; link to them instead.
- Don't nest description lists.

## Accessibility

### envUI provides

- A `dl` of `div`-wrapped `dt` and `dd` pairs, which assistive technology reads as terms and their definitions.
- Labels and values in reading order at every layout.

### You provide

- An `aria-label` or `aria-labelledby` on the root where the page has more than one list.
- An accessible name on each control in a value; the label beside it is not its name.

## Examples

### Stacked

Contact details with long values put each label above its value.

```tsx example=Stacked

```

### With controls

Settings of one item, each a small control beside its label.

```tsx example=WithControls

```

## Changelog

- **1.0.0**: DescriptionList, with `layout`, `size` and `controls`.
