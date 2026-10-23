---
title: Checkbox
summary: A native checkbox with its label, for a choice people turn on or off on its own, with a mixed state for a group's parent.
status: stable
since: 0.1.0
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
  - People choose any number of options from a list, each on its own, such as which e-mails to receive.
  - One option is agreed to or included, such as accepting the terms or including archived items, and takes effect when a form is sent.
  - A parent selects or clears a group of options and shows when only some are chosen (`checked="mixed"`).
avoidWhen:
  - text: A setting that takes effect at once, such as turning notifications on.
    use: Switch
  - text: Exactly one choice from a few options.
    use: Radio
  - text: One choice from a long list of options.
    use: Select
  - text: Several choices from a long list, found by typing.
    use: Combobox
  - text: Choosing rows of a table.
    use: Table
related:
  - switch
  - radio
  - select
  - combobox
  - table
  - accessibility
components:
  - Checkbox
---

# Checkbox

## Overview

A checkbox turns one choice on or off, on its own, and takes effect when a form is sent.

```tsx example=IncludeArchived

```

### States

Pressing the box or its label toggles it. `checked="mixed"` shows a dash, for a parent whose children are only partly chosen.

<!-- specimen: States -->

### Select all

A parent is checked when every child is, mixed when some are, and checks or clears them all.

```tsx example=SelectAll

```

### In a form

A checked box submits its `name` with its `value`; an unchecked one submits nothing. A reset restores `defaultChecked`.

```tsx example=NotificationForm

```

## When to use

```tsx do=NamedGroup caption="Name a group with a legend, so each choice reads in context."

```

```tsx dont=UnnamedGroup caption="Checkboxes with no name for the group: mentions of what?"

```

```tsx do=DisabledWithReason caption="Say why a choice is unavailable, next to it."

```

```tsx dont=DisabledWithoutReason caption="A disabled checkbox that doesn’t say why."

```

- Derive a parent's state from its children; the checkbox doesn't.

### Labels

Write the label as the choice it turns on, in sentence case, so checking it means yes.

```tsx do=PositiveLabel caption="A label that checking means yes to."

```

```tsx dont=NegativeLabel caption="A negative label: checking it means no."

```

## Anatomy

```tsx anatomy=CheckboxAnatomy

```

1. **Checkbox** (`env-checkbox`)
2. **Box** (`env-checkbox-box`)
3. **Check** (`env-checkbox-indicator`)
4. **Label** (`env-checkbox-label`, `label`)

### Colors

`--env-checkbox-outline`, `--env-checkbox-selected` and `--env-checkbox-icon` set the colors of one Checkbox, through `style` or CSS. Hover, focus and press are state layers of the content color over the container. [Customize colors](../customizing-colors.md) describes the roles.

## Adapting to width

The label wraps onto more lines, and the box stays centred beside it.

```tsx example=LongLabel widths="14 30"

```

## Accessibility

### Keyboard

| Key                                             | Action                                         |
| ----------------------------------------------- | ---------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves to the next or previous checkbox.        |
| <kbd>Space</kbd>                                | Checks or unchecks it, and checks a mixed one. |

### envUI provides

- A native checkbox inside its `<label>`, named by the label's text.
- The mixed state as `indeterminate` and `aria-checked="mixed"`.
- A focus outline, and a 2.75 rem target on touch screens.

### You provide

- A `label`, or `aria-label` on a checkbox without one.
- A name for a group, such as a fieldset's legend.
- An error or description, linked with `aria-describedby`.

## Changelog

- **1.0.0**: `className` and `style` style the root, `env-checkbox`, rather than the input, which keeps `ref` and the other native props. The classes follow the component: `env-choice-control` is `env-checkbox`, `env-checkbox-control` `env-checkbox-input` and `env-checkbox-mark` `env-checkbox-indicator`.
- **0.4.0**: Checkboxes shrink slightly whether the box or its label is pressed.
- **0.1.0**: Checkbox.
