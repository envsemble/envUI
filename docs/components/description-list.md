---
title: DescriptionList
summary: Labels and their values, describing one thing.
status: beta
since: 1.0.0
category: Data display
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
  - The facts about one item, such as a project's owner, status and dates
  - An item's settings beside their labels, each a small control
avoidWhen:
  - text: Many items compared by the same fields.
    use: Table
  - text: Items people open or act on, one per row.
    use: List
  - text: Values people fill in and submit, as a form.
    see: field
components:
  - DescriptionList
examples:
  Facts: overview
  Sizes: example
  ControlsAligned: example
  DescriptionListAnatomy: anatomy
  FactsAtWidths: example
---

# DescriptionList

## Variants

<!-- specimen: Layouts -->

### Sizes

```tsx figure=Sizes

```

### With controls

```tsx figure=ControlsAligned

```

## Anatomy

```tsx figure=DescriptionListAnatomy

```

1. **List** (`env-description-list`)
2. **Item** (`env-description-list-item`)
3. **Label** (`env-description-list-label`, `label`)
4. **Value** (`env-description-list-value`, `children`)

## Behaviour

### Adapting to width

```tsx figure=FactsAtWidths widths="30 16" sweep

```
