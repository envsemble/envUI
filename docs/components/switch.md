---
title: Switch
summary: An on/off setting that takes effect as soon as it changes.
status: stable
since: 1.0.0
category: Forms & selection
aliases:
  - toggle
  - toggle switch
  - on/off switch
  - on/off toggle
  - on/off setting
  - setting toggle
useWhen:
  - A setting that applies at once, such as e-mail notifications
  - One setting in each row of a settings list
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
examples:
  NotificationSettings: overview
  ShowCompleted: example
  SettingsRows: example
  SameLabel:
    role: do
    caption: One label, whichever way the switch is set.
  StateInLabel:
    role: dont
    caption: A label that changes to say the state, which the track shows.
  SwitchAnatomy: anatomy
  LongLabel: example
---

# Switch

## Anatomy

```tsx figure=SwitchAnatomy

```

1. **Switch** (`env-switch`)
2. **Track** (`env-switch-input`)
3. **Label** (`env-switch-label`, `label`)

## Behaviour

### States

Pressing the track or its label toggles it.

<!-- specimen: States -->

### Apply at once

The setting applies as soon as the switch changes, with no Save button.

- When saving it fails, the switch goes back, with a message that says what went wrong.

```tsx figure=ShowCompleted motion

```

### Settings in a list

In a row, the row's title names the switch, and its detail describes it.

```tsx figure=SettingsRows

```

### Adapting to width

The label wraps beside the track.

```tsx figure=LongLabel widths="30 14" sweep

```

## Rules

Name the setting in a short phrase, so that on means yes.

```tsx figure=SameLabel motion

```

```tsx figure=StateInLabel motion

```

### Disabled

A disabled switch keeps its setting from changing. It fades whole with its label, so one that is on keeps its fill and its thumb at the end, faded, and still reads as on.

- Say why beside it, such as in the row's detail, and who can change it.

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

## Compose

### Usage

```tsx
<Switch label="Show completed tasks" checked={showCompleted} onCheckedChange={setShowCompleted} />
```

A Switch is a native checkbox with `role="switch"`, named by its `label`; an optional `description` is a short muted line under it, read with its name. Apply the setting from `onCheckedChange`, which receives the new state; control it with `checked`, or leave it uncontrolled with `defaultChecked`, which a form reset restores. When saving fails, set it back. `name` and the other native props reach the input.

#### Disabled

```tsx
<Switch label="Two-step sign-in" defaultChecked disabled aria-describedby={reason} />
<Text id={reason} variant="body-sm">
  Your administrator, Sam Lee, manages these settings for everyone at Northwind.
</Text>
```

#### Settings in a list

In a List row, the row's title names the switch through `aria-labelledby`, and its detail describes it through `aria-describedby`, as the SettingsRows example does.

### Composition

The root, `env-switch`, is the label around the track, `env-switch-input`, and the text, `env-switch-label`. `className` and `style` reach the root, and `ref` and the other native props the input.

## Changelog

- **1.0.0**: `className` and `style` style the root, `env-switch`, rather than the input, which keeps `ref` and the other native props. `env-choice-control` is `env-switch` and `env-switch-control` `env-switch-input`.
- **1.0.0**: The track of a switch that is off has a 3:1 boundary, and switches in the dark theme reach 3:1 on every surface.
- **1.0.0-prerelease.6**: A switch that is on and unavailable keeps its fill and its white thumb, faded with its label, rather than a faint tint with a gray thumb, which read as off.
- **1.0.0-prerelease.6**: A switch that is off has a muted thumb, which no longer outweighs one that is on, and darkens it under the pointer with its ring. A switch that is on and unavailable takes a faint tint of the accent, `--env-color-bg-primary-muted`, rather than the neutral fill, so it differs from one that is off by more than the thumb's place.
- **1.0.0-prerelease.6**: A switch that is on that is unavailable takes the neutral fill, with its thumb in `--env-color-fg-disabled`, rather than a faded accent, as an unavailable button does.
- **1.0.0-prerelease.6**: Beside a label that wraps or has a description, the track sits on the middle of its first line rather than across both lines.
- **1.0.0-prerelease.6**: A switch that is off darkens its ring under the pointer and while pressed, as its track deepens.
- **1.0.0-prerelease.5**: `description`, a muted line under the label.
