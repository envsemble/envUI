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
  - Exactly one of two to five options, all in view, such as who can open a project
  - Options that each need a sentence to explain them, such as roles
  - A choice in a form that takes effect when the form is saved
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
components:
  - RadioGroup
  - Radio
---

# Radio

## Overview

Each Radio sits in a RadioGroup, whose label names the choice.

```tsx example=ProjectAccess

```

### States

Choosing an option clears the one chosen before; people can't clear a choice, only make another.

<!-- specimen: States -->

### A required choice

A required group with nothing chosen asks for a choice before the form is sent, and its error is tied to the group.

```tsx example=RequiredChoice

```

### A choice that can't change here

A disabled group keeps its choice visible; a sentence says where to change it.

```tsx example=InheritedAccess

```

## Variants

| Layout    | Use for                                                         |
| --------- | --------------------------------------------------------------- |
| In a line | Short options people tell apart by name. The default.           |
| In rows   | Options that need a sentence each, in rows that fill the width. |

```tsx example=VisibilityRows caption="In rows, each option with a description."

```

## When to use

```tsx do=DescribedRows caption="Short labels, with each explanation in a description."

```

```tsx dont=LongInlineLabels caption="Explanations packed into inline labels."

```

### Defaults

Choose a default where one option suits most people, and none where people must decide.

### Nothing to press inside

Keep links and buttons out of labels and descriptions: pressing anywhere on an option chooses it.

### Labels

Name the group with a short noun, and give options short, parallel names.

## Anatomy

```tsx anatomy=RadioAnatomy

```

1. **Group** (`env-radio-group`)
2. **Group label** (`env-radio-group > legend`, `label`)
3. **Option** (`env-radio`)
4. **Label** (`env-radio > span::text`, `label`)
5. **Description** (`env-radio-description`, `description`)
6. **Radio** (`env-radio-input`)

### Colors

One radio can take colors of its own: its fill, its text and its chosen color. Its hover, focus and press then follow them; with none set, it keeps its own colors.

## Adapting to width

Options in a line wrap onto more lines, and rows fill the width.

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

## In code

### Usage

A RadioGroup holds Radio options and is a native `<fieldset>`: its `label`, the legend, names the choice, or `aria-label` where it has none. Each Radio has a `value`, which the group reports and a form submits, its `label`, and an optional `description`, a short muted line read with its name. Leave the group uncontrolled, with `defaultValue`, which a form reset returns to, or control it with `value` and `onValueChange`; without either, no option is chosen until people choose one. Set `name` in a form; without it the group takes a unique generated one.

```tsx source=ProjectAccess

```

#### Orientation

`orientation` is `horizontal`, the default, radios before their labels side by side, which wrap onto more lines, or `vertical`, connected selectable rows that fill the width, for options with a description.

```tsx source=VisibilityRows

```

#### Required and disabled

`required` asks for a choice before the form submits, through native constraint validation. Show the error under the group, linked with `aria-describedby`, and move focus to the group when a form is refused. `disabled` disables every option: the group keeps its choice visible, but can't be focused or changed.

```tsx source=RequiredChoice

```

### Composition

The parts are the group, `env-radio-group`, with `data-orientation` and its legend, `env-radio-group > legend`; each option, `env-radio`, the label around the radio and its text; the description, `env-radio-description`; and the native radio, `env-radio-input`. A Radio's `className` and `style` reach its root, and `ref` and the other native props the input, so a form library can register and focus it.

### Customize

`--env-radio-container`, `--env-radio-content` and `--env-radio-selected` set the colors of one Radio, through `style` or CSS. Its hover, focus and press then follow them, as state layers; with none set, it keeps its own colors.

```tsx
<Radio
  value="team"
  label="My team"
  style={{ '--env-radio-selected': 'var(--env-color-fg-success)' } as CSSProperties}
/>
```

## Changelog

- **1.0.0**: RadioGroup's `variant` is `orientation`: `inline` is `horizontal` and `rows` is `vertical`; Radio's `detail` is `description`, which the `v1-props` codemod writes. `className` and `style` style a Radio's root rather than the input, which keeps `ref` and the other native props. A focused radio shows the focus ring. The classes follow the component: `env-radio-options` is `env-radio-group` with `[data-orientation]`, `env-radio-option` and the inline label are `env-radio`, `env-radio-control` is `env-radio-input` and `env-radio-detail` `env-radio-description`.
- **0.4.0**: Radio rows take the stronger row hover and pressed fills, settle like clickable cards while pressed, and keep 1.5 rem inline padding; radios shrink slightly while they or their labels are pressed.
- **0.1.0**: Radio and RadioGroup, inline or as rows.
