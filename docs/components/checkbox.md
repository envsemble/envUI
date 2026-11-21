---
title: Checkbox
summary: An option people turn on or off, independent of the others.
status: stable
since: 1.0.0
category: Forms & selection
aliases:
  - check box
  - tick box
  - checkmark
  - check mark
  - checkbox group
  - select all
  - indeterminate checkbox
  - tri-state checkbox
  - opt-in
useWhen:
  - Any number of options, each chosen on its own, such as which e-mails to receive
  - Agreeing to one option, applied when a form is sent, such as the terms
  - A parent that selects or clears a group, and shows when only some are chosen
avoidWhen:
  - text: A setting that takes effect at once, such as turning notifications on.
    use: Switch
  - text: Exactly one choice from a few options.
    use: Radio
  - text: Several choices from a long list, found by typing.
    use: Combobox
components:
  - Checkbox
examples:
  IncludeArchived: overview
  CheckboxAnatomy: anatomy
  SelectAll: example
  LongLabel: example
---

# Checkbox

## Anatomy

```tsx figure=CheckboxAnatomy

```

1. **Checkbox** (`env-checkbox`)
2. **Box** (`env-checkbox-box`)
3. **Check** (`env-checkbox-indicator path`)
4. **Label** (`env-checkbox-label`, `label`)

## Behaviour

### States

<!-- specimen: States -->

### Select all

```tsx figure=SelectAll motion

```

### Adapting to width

```tsx figure=LongLabel widths="30 14" sweep

```
