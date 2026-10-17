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

A checkbox turns one choice on or off, independently of the choices beside it. It is a native `<input type="checkbox">` inside its `<label>`, so pressing the box or the label toggles it, and forms submit, validate and reset it as the platform does. A checkbox can also be mixed, for the parent of a group whose children are only partly chosen.

```tsx example=IncludeArchived

```

## Anatomy

1. **Box**: a square of the medium icon size, 1.125 rem (1 rem in the compact scale), with the smallest corners and a hairline border; checked and mixed boxes take the checkbox fill.
2. **Mark**: a check mark while checked, or a short dash while mixed, in the on-fill color.
3. **Label** (optional, `label`): the text beside the box, 0.75 rem from it, in the small body type. The whole label toggles the checkbox.

## Variants and sizes

- The label is 0.875 rem and wraps onto more lines when it runs out of room, also within a long word; the box stays centred beside it.
- On touch screens the label and box are at least 2.75 rem tall.

## States and behaviour

- **Checked, unchecked and mixed**: `checked` and `onCheckedChange` control the checkbox, and `defaultChecked` starts an uncontrolled one. `"mixed"` shows the dash and reports the mixed state; a press calls `onCheckedChange` with `true`, and the checkbox stays mixed while the application keeps passing `"mixed"`.
- **Hover, pressed and focus**: hover and press darken the border of an empty box and the fill of a checked one, with color tokens of their own, as [colors and themes](../foundations/colors.md) describes; keyboard focus shows a focus outline around the box. Without a reduced-motion preference the box shrinks slightly while it is pressed, and the mark pops in as it appears.
- **Disabled**: the box takes the shared disabled opacity and the label the disabled text color; it cannot be focused or changed, and forms leave it out.
- **In forms**: a checked checkbox submits its `name` with its `value` ("on" without one), and an unchecked one submits nothing. `required` asks for it to be checked. A form reset restores an uncontrolled checkbox's `defaultChecked`, also when that is mixed, and leaves a controlled one as the application holds it; a reset the application cancels changes nothing.
- **Props**: `className` and `style` style the root, the label around the box and the text; `ref` and the other native props, such as `name` and `aria-describedby`, reach the native `<input>`, so a form library can register it.

<!-- specimen: States -->

## Content guidelines

- Write the label as the choice it turns on, in sentence case without ending punctuation: "Include archived projects", "Mentions".
- Phrase it positively, so checking means yes: "Send me a weekly digest", not "Don't send me a weekly digest".
- Name a group of checkboxes with a heading or legend that says what they choose: "Send me an e-mail about".
- Name a parent after the whole group: "All projects".

## Do and don't

### Do

- Use checkboxes for choices that take effect when people save or send a form.
- Derive a parent's state from its children: checked when all are, mixed when some are, unchecked when none are.
- Group related checkboxes in a fieldset with a legend, or a group with a name.
- Keep a visible label on every checkbox.

### Don't

- Don't use a checkbox for a setting that applies at once; use [Switch](../components/switch.md).
- Don't use checkboxes for a single choice among options; use [Radio](../components/radio.md).
- Don't disable a checkbox without saying why nearby.

## Accessibility

### Keyboard

| Key                                             | Action                                                           |
| ----------------------------------------------- | ---------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves focus to the next or previous checkbox.                    |
| <kbd>Space</kbd>                                | Checks or unchecks the focused checkbox, and checks a mixed one. |

### envUI provides

- A native checkbox inside its `<label>`, so its name is the label's text and pressing the label toggles it.
- The mixed state as the native `indeterminate` state and `aria-checked="mixed"`, kept in step with `checked`.
- The check mark hidden from assistive technology, and a box border with 3:1 contrast.
- A focus outline around the box, and a 2.75 rem target on touch screens.

### You provide

- A `label`, or `aria-label` or `aria-labelledby` on a checkbox without one.
- A name for a group of checkboxes, such as a fieldset with a legend.
- The state of a parent, derived from its children.
- Errors and descriptions where a choice is required; Checkbox has no error or description of its own, so link them with `aria-describedby`.

## Examples

### Select all

The parent is checked when every project is, mixed when some are, and checks or clears them all when pressed. The children line up with the parent's label.

```tsx example=SelectAll

```

### In a form

Checkboxes with the same `name` submit one entry for each checked value. A fieldset's legend names the group, and Reset returns every box to `defaultChecked`.

```tsx example=NotificationForm

```

## Changelog

- **1.0.0**: `className` and `style` style the root, `env-checkbox`, rather than the input, which keeps `ref` and the other native props. The classes follow the component: `env-choice-control` is `env-checkbox`, `env-checkbox-control` `env-checkbox-input` and `env-checkbox-mark` `env-checkbox-indicator`.
- **0.4.0**: Checkboxes shrink slightly whether the box or its label is pressed.
- **0.1.0**: Checkbox.
