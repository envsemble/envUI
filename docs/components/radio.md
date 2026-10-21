---
title: Radio
summary: One choice from a few options shown together, side by side or as selectable rows.
status: stable
since: 0.1.0
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
  - People choose exactly one of two to five options, and seeing them all helps them choose, such as who can open a project.
  - Each option needs a sentence that explains it, such as a role or a visibility (`orientation="vertical"`).
  - A choice in a form or a dialog that takes effect when the form is saved.
avoidWhen:
  - text: More options than fit comfortably, or options people already know, such as a country or a time zone.
    use: Select
  - text: Finding one option in a long list by typing.
    use: Combobox
  - text: Switching between views or filters that apply at once, such as List and Board.
    use: SegmentedControl
  - text: Several options people can choose together, or one option on its own.
    use: Checkbox
  - text: A setting that turns on or off and applies at once.
    use: Switch
related:
  - checkbox
  - select
  - segmented-control
  - switch
  - dialog
  - accessibility
components:
  - RadioGroup
  - Radio
---

# Radio

## Overview

A radio group shows a few options and lets people choose exactly one.

```tsx example=ProjectAccess

```

### States

Choosing an option clears the one chosen before; people can't clear a choice, only make another.

<!-- specimen: States -->

### A required choice

With `required` and nothing chosen, the form asks for a choice. Link the error to the group with `aria-describedby`.

```tsx example=RequiredChoice

```

### A choice that can't change here

`disabled` on the group keeps its choice visible; a sentence says where to change it.

```tsx example=InheritedAccess

```

## Variants

```tsx example=VisibilityRows

```

| Orientation  | Use for                                                         |
| ------------ | --------------------------------------------------------------- |
| `horizontal` | Short options people tell apart by name. The default.           |
| `vertical`   | Options that need a sentence each, in rows that fill the width. |

## When to use

```tsx do=DescribedRows caption="Rows with a description where options need explaining."

```

```tsx dont=LongInlineLabels caption="Explanations packed into inline labels."

```

- Choose a default where one option suits most people, and none where people must decide.
- No links or buttons in a label or a description: pressing anywhere on an option chooses it.

### Labels

Name the group with a short noun, and give options short, parallel names.

```tsx do=ParallelNames caption="Short names that read alike."

```

```tsx dont=MixedNames caption="Names of different shapes, which people must read twice."

```

## Anatomy

```tsx anatomy=RadioAnatomy

```

1. **Group** (`env-radio-group`)
2. **Group label** (`env-radio-group > legend`, `label`)
3. **Option** (`env-radio`)
4. **Label** (`env-radio > span::text`, `label`)
5. **Description** (`env-radio-description`, `description`)
6. **Radio** (`env-radio-input`)

## Adapting to width

Horizontal options wrap onto more lines; rows fill the width.

```tsx example=WrappingOptions widths="14 30"

```

## Accessibility

### Keyboard

| Key                                             | Action                                                        |
| ----------------------------------------------- | ------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves into the group, to the chosen or first option, and out. |
| Arrow keys                                      | Choose the next or previous option, skipping disabled ones.   |
| <kbd>Space</kbd>                                | Chooses the focused option while none is chosen.              |

### envUI provides

- A native `<fieldset>` named by its `<legend>`, and native radios sharing one `name`.
- Each option's label and description as its name, and its position, such as 2 of 3.
- The focus ring, and options 2.75 rem tall on touch screens.

### You provide

- A `label` for the group, or `aria-label`.
- A `name` for a group in a form.
- Errors linked with `aria-describedby`, and focus on the group when a form is refused.

## Changelog

- **1.0.0**: RadioGroup's `variant` is `orientation`: `inline` is `horizontal` and `rows` is `vertical`; Radio's `detail` is `description`, which the `v1-props` codemod writes. `className` and `style` style a Radio's root rather than the input, which keeps `ref` and the other native props. A focused radio shows the focus ring. The classes follow the component: `env-radio-options` is `env-radio-group` with `[data-orientation]`, `env-radio-option` and the inline label are `env-radio`, `env-radio-control` is `env-radio-input` and `env-radio-detail` `env-radio-description`.
- **0.4.0**: Radio rows take the stronger row hover and pressed fills, settle like clickable cards while pressed, and keep 1.5 rem inline padding; radios shrink slightly while they or their labels are pressed.
- **0.1.0**: Radio and RadioGroup, inline or as rows.
