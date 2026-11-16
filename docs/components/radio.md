---
title: Radio
summary: One choice from a few options shown together, side by side or as selectable rows.
status: stable
since: 1.0.0
category: Forms & selection
aliases:
  - radio button
  - radio group
  - radio list
  - radio rows
  - option group
  - option button
  - choice group
  - single choice
useWhen:
  - Options that each need a sentence to explain them, such as roles
  - One of two to five options that must all stay in view, such as in a form
avoidWhen:
  - text: More options than fit in view, or ones people know, such as a time zone.
    use: Select
  - text: Views or filters of the content in front of people, such as List and Board.
    use: SegmentedControl
  - text: Several options people can choose together, or one option on its own.
    use: Checkbox
components:
  - RadioGroup
  - Radio
examples:
  ProjectAccess: overview
  VisibilityRows: example
  RadioAnatomy: anatomy
  RequiredChoice: example
  WrappingOptions: example
---

# Radio

## Variants

```tsx figure=VisibilityRows

```

## Anatomy

```tsx figure=RadioAnatomy

```

1. **Group** (`env-radio-group`)
2. **Group label** (`env-radio-group > legend`, `label`)
3. **Option** (`env-radio`)
4. **Label** (`env-radio > span::text`, `label`)
5. **Description** (`env-radio-description`, `description`)
6. **Radio** (`env-radio-input`)

## Behaviour

### States

<!-- specimen: States -->

### A required choice

```tsx figure=RequiredChoice motion

```

### Adapting to width

```tsx figure=WrappingOptions widths="30 14" sweep

```
