---
title: Switch
summary: An on/off setting that takes effect as soon as it changes.
status: stable
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
components:
  - Switch
---

# Switch

## Overview

A switch turns a setting on or off, and the change takes effect at once.

```tsx example=NotificationSettings

```

### States

Pressing the track or its label toggles it.

<!-- specimen: States -->

### Apply at once

The application applies the setting as soon as the switch changes; there is nothing to save.

```tsx example=ShowCompleted

```

### Settings in a list

In a row, the row's title names the switch with `aria-labelledby`, and its detail describes it.

```tsx example=SettingsRows

```

## When to use

```tsx do=ManagedSetting caption="Say why a setting can't change, and who can change it."

```

```tsx dont=DisabledWithoutReason caption="Disabled switches that don’t say why."

```

- When saving a setting fails, turn the switch back and say what went wrong.

### Labels

Name the setting in a short phrase, so that on means yes.

```tsx do=SameLabel caption="One label, whichever way the switch is set."

```

```tsx dont=StateInLabel caption="A label that changes to say the state, which the track shows."

```

## Anatomy

```tsx anatomy=SwitchAnatomy

```

1. **Switch** (`env-switch`)
2. **Track** (`env-switch-input`)
3. **Label** (`env-switch-label`, `label`)

The thumb is drawn by the track and has no element of its own.

## Adapting to width

The label wraps beside the track.

```tsx example=LongLabel widths="14 30"

```

## Accessibility

### Keyboard

| Key                                             | Action                                |
| ----------------------------------------------- | ------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves to the next or previous switch. |
| <kbd>Space</kbd>                                | Turns the switch on or off.           |

### envUI provides

- A native checkbox with `role="switch"`, announced as on or off.
- A `<label>` that names the switch and toggles it when pressed.
- An off track whose edge reaches 3:1 contrast, and a 2.75 rem target on touch screens.

### You provide

- A `label`, or `aria-labelledby` where the name shows elsewhere.
- A description linked with `aria-describedby` where a setting needs explaining.
- An announcement, such as a Toast, where the change happens out of sight or fails.

## Changelog

- **1.0.0**: `className` and `style` style the root, `env-switch`, rather than the input, which keeps `ref` and the other native props. `env-choice-control` is `env-switch` and `env-switch-control` `env-switch-input`.
- **1.0.0**: The track of a switch that is off has a 3:1 boundary, and switches in the dark theme reach 3:1 on every surface.
- **0.4.0**: A switch shrinks slightly while it or its label is pressed. The off track uses the shared fill, so switches on rows stand apart from their surface.
- **0.1.0**: Switch.
