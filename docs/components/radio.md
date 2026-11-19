---
title: Radio
summary: One choice from up to five options, all in view, listed one under the other.
status: stable
since: 1.0.0
category: Forms & selection
aliases:
  - radio button
  - radio group
  - radio list
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
  ChooseLanguage:
    role: overview
    open: true
  SideBySide: example
  PlanRows: example
  RadioAnatomy: anatomy
  RequiredChoice: example
---

# Radio

## Variants

### Side by side

```tsx figure=SideBySide

```

### Rows of a list

```tsx figure=PlanRows

```

## Anatomy

```tsx figure=RadioAnatomy

```

1. **Group** (`env-radio-group`)
2. **Group label** (`env-radio-group > legend`, `label`)
3. **Option** (`env-radio`)
4. **Label** (`env-radio-label`, `label`)
5. **Description** (`env-radio-description`, `description`)
6. **Radio** (`env-radio-input`)
7. **State layer** (`env-radio-control`)

## Behaviour

### States

<!-- specimen: States -->

### A required choice

```tsx figure=RequiredChoice motion

```
