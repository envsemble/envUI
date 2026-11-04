---
title: DescriptionList
summary: The facts about one thing, as labels and their values.
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
    see: forms
  - text: One headline number with its trend.
    see: key-figures
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

| Layout    | Labels                                               | Use for                           |
| --------- | ---------------------------------------------------- | --------------------------------- |
| Automatic | Beside their values, or above them in a narrow list. | Most lists. The default.          |
| Inline    | Beside their values at every width.                  | A wide region that never narrows. |
| Stacked   | Above their values at every width.                   | Long values, such as addresses.   |

<!-- specimen: Layouts -->

### Sizes

Smaller text, the default, suits a card or a pane, and body text a page of details.

```tsx figure=Sizes

```

### With controls

Values can be controls, such as switches, and each label sits on its control's line.

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

In the automatic layout, labels move above their values where the list is narrow.

```tsx figure=FactsAtWidths widths="30 16" sweep

```

## Rules

### Values

Keep headings and long paragraphs out of values and link to them instead, and don't put a description list inside another.

## Accessibility

### envUI provides

- A `dl` of `dt` and `dd` pairs, read as terms and their values.
- Labels and values in reading order in every layout.

### You provide

- An `aria-label` on each list where a page has several.
- A name on each control in a value: the label beside it isn't one.

## Compose

### Usage

DescriptionList.Root is a `dl`, and each DescriptionList.Item a term and its value: its `label`, such as Owner, and its value as `children`, such as text, a Link or a Badge. Name each list with `aria-label` where a page has several.

```tsx source=Facts

```

#### Layout and size

`layout` is `auto`, the default, `inline` or `stacked`. Inline puts each label beside its value, in a column as wide as the longest label; stacked puts it above; auto is inline, and stacked where the list's own width is below 24 rem. `size` is `sm`, the default, the smaller body text, for facts beside other content, such as in a sidebar or a card, or `md`, body text, for a page of details.

```tsx
<DescriptionList.Root layout="stacked" size="md" aria-label="Contact">
  <DescriptionList.Item label="Email">priya.shah@example.com</DescriptionList.Item>
  <DescriptionList.Item label="Address">12 Harbour Street, Northwind Bay</DescriptionList.Item>
</DescriptionList.Root>
```

#### Controls

`controls` on the Root is for values that hold controls, such as a Select or a Switch: each row is at least as tall as a small control, and its label sits on the control's first line. Give each control a name of its own, such as an `aria-label`: the label beside it isn't one.

```tsx
<DescriptionList.Root controls aria-label="Sharing">
  <DescriptionList.Item label="Comments">
    <Switch aria-label="Allow comments" defaultChecked />
  </DescriptionList.Item>
</DescriptionList.Root>
```

### Composition

The parts are the list, `env-description-list`, with `data-layout`, `data-size` and `data-controls`; each item, `env-description-list-item`, a `div` around its label, `env-description-list-label`, a `dt`, and its value, `env-description-list-value`, a `dd`. Keep headings and long paragraphs out of values, and don't nest description lists.

## Changelog

- **1.0.0**: DescriptionList, with `layout`, `size` and `controls`.
