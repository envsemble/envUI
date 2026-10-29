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
examples:
  ProjectAccess: overview
  VisibilityRows:
    role: example
    caption: In rows, each option with a description.
  RadioAnatomy: anatomy
  RequiredChoice: example
  WrappingOptions: example
  DescribedRows:
    role: do
    caption: Short labels, with each explanation in a description.
  LongInlineLabels:
    role: caution
    caption: 'Explanations packed into inline labels: long rows, slow to scan.'
---

# Radio

## Variants

| Layout    | Use for                                                         |
| --------- | --------------------------------------------------------------- |
| In a line | Short options people tell apart by name. The default.           |
| In rows   | Options that need a sentence each, in rows that fill the width. |

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

Choosing an option clears the one chosen before. People can't clear a choice, only make another. A chosen row takes the selection's fill, as a selected list row does.

<!-- specimen: States -->

### A required choice

A required group with nothing chosen asks for a choice before the form is sent, and its error is tied to the group.

```tsx figure=RequiredChoice motion

```

### Adapting to width

Options in a line wrap onto more lines, and rows fill the width.

```tsx figure=WrappingOptions widths="30 14" sweep

```

## Rules

Labels stay short, and an option that needs explaining says so in its description.

```tsx figure=DescribedRows

```

```tsx figure=LongInlineLabels

```

### Defaults

Choose a default where one option suits most people, and none where people must decide.

### Nothing to press inside

Keep links and buttons out of labels and descriptions: pressing anywhere on an option chooses it.

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

## Compose

### Usage

A RadioGroup holds Radio options and is a native `<fieldset>`: its `label`, the legend, names the choice, or `aria-label` where it has none.

- Each Radio has a `value`, which the group reports and a form submits, its `label`, and an optional `description`, a short muted line read with its name.
- Uncontrolled: `defaultValue`, which a form reset returns to.
- Controlled: `value` and `onValueChange`; `null` chooses none.
- Without either, no option is chosen until people choose one.
- Set `name` in a form; without it the group takes a unique generated one.
- `description` under the options, and `error`, such as for a required group left empty, describe the group, as on a field.

```tsx source=ProjectAccess

```

#### Orientation

`orientation` is `horizontal`, the default, radios before their labels side by side, which wrap onto more lines, or `vertical`, connected selectable rows that fill the width, for options with a description, as the VisibilityRows example shows.

```tsx
<RadioGroup orientation="vertical" label="Visibility" name="visibility" defaultValue="team">
  <Radio value="team" label="Team" description="Everyone at Northwind can open it." />
  <Radio value="private" label="Private" description="Only the people you invite." />
</RadioGroup>
```

#### Required and disabled

`required` asks for a choice before the form submits, through native constraint validation. Show the error under the group, linked with `aria-describedby`, and move focus to the group when a form is refused, as the RequiredChoice example does; envUI has no error message for RadioGroup yet, so a Text with `role="alert"` holds it. `disabled` disables every option: the group keeps its choice visible, but can't be focused or changed. Say where to change it in a sentence beside it.

```tsx
<RadioGroup label="Access" value="team" disabled aria-describedby={reason}>
  <Radio value="team" label="Team" />
  <Radio value="private" label="Private" />
</RadioGroup>
<Text id={reason} variant="body-sm">
  This folder takes its access from Northwind launch. Change it there.
</Text>
```

### Composition

The parts are the group, `env-radio-group`, with `data-orientation` and its legend, `env-radio-group > legend`; each option, `env-radio`, the label around the radio and its text; the description, `env-radio-description`; and the native radio, `env-radio-input`. A Radio's `className` and `style` reach its root, and `ref` and the other native props the input, so a form library can register and focus it.

## Changelog

- **1.0.0-prerelease.5**: RadioGroup takes `description` and `error`, as a field does, and a controlled `value` of `null` chooses none.
- **1.0.0-prerelease.5**: The chosen row of a group in rows takes the selection's fill and text, as a selected list row and Select's chosen option do, rather than the hover fill.
- **1.0.0**: RadioGroup's `variant` is `orientation`: `inline` is `horizontal` and `rows` is `vertical`; Radio's `detail` is `description`. `className` and `style` style a Radio's root rather than the input, which keeps `ref` and the other native props. A focused radio shows the focus ring. The classes follow the component: `env-radio-options` is `env-radio-group` with `[data-orientation]`, `env-radio-option` and the inline label are `env-radio`, `env-radio-control` is `env-radio-input` and `env-radio-detail` `env-radio-description`.
