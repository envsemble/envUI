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
  - text: A choice that waits for a Save or Submit button, such as accepting terms.
    use: Checkbox
  - text: Choosing between two or more named views or modes, such as List and Board.
    use: SegmentedControl
  - text: An action that runs once, such as archiving a project.
    use: Button
components:
  - Switch
examples:
  NotificationSettings: overview
  ShowCompleted: example
  SettingsRows: example
  SameLabel:
    role: do
    caption: One label, whichever way the switch is set.
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

<!-- specimen: States -->

### Apply at once

```tsx figure=ShowCompleted motion

```

### Settings in a list

```tsx figure=SettingsRows

```

### Adapting to width

```tsx figure=LongLabel widths="30 14" sweep

```

## Rules

```tsx figure=SameLabel motion

```
