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

A radio group offers a few options and lets people choose exactly one; choosing an option clears the one chosen before. RadioGroup is a native fieldset whose legend names the group, and each Radio is a native radio input inside its label, so the arrow keys, Tab, form submission and reset behave as the platform's.

A group comes in two looks:

- **Inline** (the default): radios before their labels, side by side, wrapping onto more lines when space runs out.
- **Rows** (`orientation="vertical"`): connected rows that fill the width, with each option's label and description at the start and its radio at the end, for options that need explaining.

```tsx example=ProjectAccess

```

## Anatomy

1. **Group label** (`label` on RadioGroup): the fieldset's legend in the body text, 0.9375 rem, 1 rem above the options. It names the group.
2. **Radio**: the native radio, 1 rem, in the control blue while chosen. It comes before its label inline, and at the end of a row.
3. **Label** (`label` on Radio): the option's name in 0.875 rem text, 0.75 rem from the radio. Pressing it chooses the option.
4. **Description** (optional, `description`): a muted line under the label in the same size, which helps people choose.
5. **Row** (`orientation="vertical"`): the option's fill, which holds its label, description and radio; the whole row chooses the option.

## Variants and sizes

| Orientation  | Use for                                                                                                             |
| ------------ | ------------------------------------------------------------------------------------------------------------------- |
| `horizontal` | Short options people tell apart by their names, such as Team and Only me, in a form. The default.                   |
| `vertical`   | Options that need a sentence each to choose between, such as a role or a visibility, in a form, a dialog or a pane. |

- **Horizontal**: options sit 2 rem apart side by side and wrap onto lines 1 rem apart.
- **Rows**: rows fill the group's width, 0.125 rem apart, with 0.75 rem block and 1.5 rem inline padding, on the muted row fill. The group's outer corners are 1.75 rem and the corners between rows 0.5 rem, as in a [List](../components/list.md); a single row is rounded all round.
- On touch screens every option, inline or a row, is at least 2.75 rem tall.

## States and behaviour

- **Choosing**: pressing a radio, its label or its row chooses the option and clears the one chosen before. People can't clear a choice, only make another, so leave none chosen where people must decide.
- **Hover and pressed**: the radio takes its hover and pressed blues. A row takes the row hover fill under the pointer and the pressed fill while pressed, from the color tokens [colors and themes](../foundations/colors.md) describes, and settles slightly while pressed; an inline radio shrinks slightly while it or its label is pressed. With a reduced-motion preference nothing moves.
- **Chosen**: the radio shows its dot; a chosen row keeps the hover fill, so it stands out from the others.
- **Focus**: keyboard focus shows the browser's focus ring around the radio; a row also shows the shared focus ring around its edge.
- **Disabled**: `disabled` on a Radio disables one option, and on RadioGroup every option. A disabled option takes the shared disabled opacity on its radio and the disabled text color on its label, doesn't react to the pointer, is skipped by the arrow keys and is left out of form submission.
- **Controlled or not**: RadioGroup's `value` with `onValueChange` controls the choice; otherwise it starts from `defaultValue`, or with nothing chosen. `onValueChange` receives the chosen option's `value`, and a Radio's `onChange` the native event.
- **Native forms**: the chosen option submits its `value` under the group's `name`; without `name` the group takes a unique generated one, so its radios still work as one group. `required` asks the browser to refuse the form until an option is chosen, and `form` ties the group to a form it sits outside of. A form reset returns an uncontrolled group to `defaultValue` and leaves a controlled one as `value` says; a reset the form prevents changes nothing.
- A Radio works only inside a RadioGroup; elsewhere it throws an error.

## Content guidelines

- Name the group with a short noun phrase in sentence case, without a colon: "Access", "Export format".
- Give options short, parallel names that start the same way where they can: "Team", "Only me", "Anyone with the link".
- Use `description` for the consequence that tells options apart, in one sentence: "Only the people you invite." Use it on every option of a group or on none.
- Order options from the most common or the least permissive, and keep that order wherever the choice appears.
- Say why an option is unavailable in its description, or in a sentence linked to the group with `aria-describedby`.

## Do and don't

### Do

- Show every option, and keep to about five; use [Select](../components/select.md) for more.
- Use rows where options need explaining, and horizontal radios where their names are enough.
- Choose a default where one option suits most people, and leave none chosen where people must decide.
- Give every RadioGroup in a form a `name`, and say what is missing when a required choice isn't made.

### Don't

- Don't use radios for views or filters that apply as soon as they change; use [SegmentedControl](../components/segmented-control.md).
- Don't use a single radio, or radios for a yes-or-no setting; use [Checkbox](../components/checkbox.md) or [Switch](../components/switch.md).
- Don't put links or buttons in a label or a description; the whole option is a label, and pressing it chooses the option.
- Don't disable options without saying why.

## Accessibility

### Keyboard

| Key                                                        | Action                                                                                                                           |
| ---------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>            | Moves focus into the group, to its chosen option or, while none is chosen, to its first or last option, and on out of the group. |
| <kbd>↓</kbd> or <kbd>→</kbd>, <kbd>↑</kbd> or <kbd>←</kbd> | Chooses the next or previous option and moves focus to it, skipping disabled options. Most browsers wrap around at the ends.     |
| <kbd>Space</kbd>                                           | Chooses the focused option while none is chosen.                                                                                 |
| <kbd>Enter</kbd>                                           | Leaves the choice as it is; inside a form it submits the form, as <kbd>Enter</kbd> in a text field does.                         |

### envUI provides

- A native `<fieldset>` named by its `<legend>`, and native `<input type="radio">` options that share the group's `name`, so assistive technology announces the group, each option's state and its position, such as 2 of 3.
- A `<label>` around each radio with its label and description, which names the option and chooses it when pressed; the description is read as part of the name.
- The shared focus ring on a focused radio, and around a focused row, and options at least 2.75 rem tall on coarse pointers.
- Native disabled and required states, form submission and reset.

### You provide

- A `label` for the group, or `aria-label` or `aria-labelledby` on RadioGroup where its name shows elsewhere.
- A `name` for a group in a form.
- Guidance and errors: RadioGroup has no hint or error of its own, so link a sentence to it with `aria-describedby`, announce an error, and move focus to the group when a form is refused.
- A reason near disabled options.

## Examples

### Selectable rows

Rows suit options that need a sentence each. The disabled option says why in its description.

```tsx example=VisibilityRows

```

### A required choice

The group starts with nothing chosen. Exporting without a choice shows an error linked to the group, announces it and moves focus to the first option.

```tsx example=RequiredChoice

```

### A choice that can't change here

A disabled group keeps its choice visible, and a sentence linked with `aria-describedby` says where to change it.

```tsx example=InheritedAccess

```

## Changelog

- **1.0.0**: RadioGroup's `variant` is `orientation`: `inline` is `horizontal` and `rows` is `vertical`; Radio's `detail` is `description`, which the `v1-props` codemod writes. `className` and `style` style a Radio's root rather than the input, which keeps `ref` and the other native props. A focused radio shows the focus ring. The classes follow the component: `env-radio-options` is `env-radio-group` with `[data-orientation]`, `env-radio-option` and the inline label are `env-radio`, `env-radio-control` is `env-radio-input` and `env-radio-detail` `env-radio-description`.
- **0.4.0**: Radio rows take the stronger row hover and pressed fills, settle like clickable cards while pressed, and keep 1.5 rem inline padding; radios shrink slightly while they or their labels are pressed.
- **0.1.0**: Radio and RadioGroup, inline or as rows.
