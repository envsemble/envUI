---
title: Switch
summary: An on/off setting that takes effect as soon as it changes.
status: beta
since: 0.1.0
category: Forms & selection
aliases:
  - toggle
  - toggle switch
  - on/off switch
  - on/off toggle
  - on/off setting
  - setting toggle
useWhen:
  - A setting turns on or off and takes effect at once, such as e-mail notifications or showing completed tasks.
  - Each row of a settings list turns one setting on or off.
avoidWhen:
  - text: A choice that waits for a Save or Submit button, such as accepting terms, or one of several options people tick.
    use: Checkbox
  - text: Choosing between two or more named views or modes, such as List and Board.
    use: SegmentedControl
  - text: Choosing one of several options in a form.
    use: RadioGroup
  - text: An action that runs once, such as archiving a project.
    use: Button
  - text: An option that turns on or off inside a menu.
    use: Menu
related:
  - checkbox
  - radio
  - segmented-control
  - list
  - accessibility
components:
  - Switch
---

# Switch

## Overview

A switch turns a setting on or off, and the change takes effect at once, as a light switch does. It is a native checkbox with the switch role, drawn as a track and a thumb with its label beside it, so focus, <kbd>Space</kbd>, pressing the label and form participation behave as the platform's.

```tsx example=NotificationSettings

```

## Anatomy

1. **Track**: a pill 2.5 rem wide and 1.5 rem tall. Off, it is a translucent neutral fill inside a thin ring; on, it turns blue.
2. **Thumb**: a 1 rem circle 0.25 rem inside the track, at its start while off and at its end while on.
3. **Label** (`label`): the setting's name, 0.75 rem after the track, in 0.875 rem text. It wraps beside the track when space runs out, and pressing it toggles the switch too.
4. **Focus ring**: the shared ring, 0.125 rem outside the track, shown for keyboard focus.

A switch is 1.5 rem tall, or as tall as its wrapped label, and at least 2.75 rem on touch screens. The ref and other `input` props, such as `name`, `value` and `aria-describedby`, reach the native input; `className` is set on it too.

## States and behaviour

- **Off and on**: the thumb slides from the start of the track to its end and the track fills blue. The label stays the same in both states.
- **Hover and pressed**: the track takes its hover and pressed shades, which are color tokens of their own as [colors and themes](../foundations/colors.md) describes, while the pointer is on the switch or its label. Pressing either also shrinks the switch slightly.
- **Focus**: keyboard focus shows the shared focus ring around the track.
- **Disabled** (`disabled`): the track takes the shared disabled opacity and the label the disabled text color. The switch can't be focused or changed, and forms leave it out.
- **Controlled or not**: `checked` with `onCheckedChange` controls the switch; otherwise it starts from `defaultChecked`, off by default. `onCheckedChange` receives the new state and `onChange` the native event.
- **Native forms**: with `name`, a switch that is on submits its `value`, `on` unless set; a switch that is off submits nothing. A form reset returns an uncontrolled switch to `defaultChecked` and leaves a controlled one as `checked` says; a reset the form prevents changes nothing.
- **Motion**: the thumb slides and the track's color eases; with a reduced-motion preference they change at once, and the switch doesn't shrink while pressed.
- The application applies the setting and saves it; the switch only reports the change.

<!-- specimen: States -->

## Content guidelines

- Name the setting in a short phrase in sentence case, without ending punctuation: "E-mail notifications", "Show completed tasks".
- Keep the label the same whether the switch is on or off; the track shows the state, and assistive technology announces it. Don't add On or Off beside it.
- Word the label so that on means yes: "Show completed tasks", not "Hide completed tasks".
- Put what the setting does or why it is unavailable in a sentence beside it, linked with `aria-describedby`: "Your administrator manages this setting."

## Do and don't

### Do

- Apply the change as soon as the switch changes, and show its effect where people can see it.
- Name a switch in a settings row by the row's title with `aria-labelledby`, and describe it by the row's detail with `aria-describedby`.
- Turn the switch back and say what went wrong when saving the setting fails.
- Say near a disabled switch why it can't change, and who can change it.

### Don't

- Don't use a switch for a choice that waits for a Save button; use [Checkbox](../components/checkbox.md).
- Don't change the label to say the state.
- Don't use a switch to start an action, such as archiving or sending; use [Button](../components/button.md).
- Don't choose between two named views with a switch; use [SegmentedControl](../components/segmented-control.md).

## Accessibility

### Keyboard

| Key                                             | Action                                                                                                   |
| ----------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves focus to the next or previous switch; a disabled switch is skipped.                                |
| <kbd>Space</kbd>                                | Turns the switch on or off.                                                                              |
| <kbd>Enter</kbd>                                | Leaves the switch as it is; inside a form it submits the form, as <kbd>Enter</kbd> in a text field does. |

### envUI provides

- A native `<input type="checkbox">` with `role="switch"` and `aria-checked`, so assistive technology announces a switch that is on or off.
- A `<label>` around the control and its label text, which names the switch and toggles it when pressed.
- The shared focus ring, and a ring that draws the off track's edge at 3:1 contrast, since its translucent fill alone is too faint to show it.
- A switch and label at least 2.75 rem tall on coarse pointers.
- Native disabled state, form submission and reset.

### You provide

- A `label`, or `aria-label` or `aria-labelledby` where the setting's name shows elsewhere, such as a row's title.
- A description linked with `aria-describedby` where the setting needs explaining or is disabled.
- The effect of the change, and an announcement, such as a Toast, where it happens out of sight or saving fails.

## Examples

### Apply at once

The list follows the switch as soon as it changes; there is nothing to save.

```tsx example=ShowCompleted

```

### Settings in a list

Each row's switch is named by the row's title and described by its detail, so the visible text is read once.

```tsx example=SettingsRows

```

### Unavailable settings

Disabled switches keep their state visible. A sentence linked to both with `aria-describedby` says why they can't change.

```tsx example=ManagedSetting

```

## Changelog

- **1.0.0**: The track of a switch that is off has a 3:1 boundary, and switches in the dark theme reach 3:1 on every surface.
- **0.4.0**: A switch shrinks slightly while it or its label is pressed. The off track uses the shared fill, so switches on rows stand apart from their surface.
- **0.1.0**: Switch.
