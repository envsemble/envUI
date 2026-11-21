---
title: TimePicker
summary: A field for picking a time, on a 12- or 24-hour clock by locale.
status: beta
since: 1.0.0
category: Forms & selection
aliases:
  - time picker
  - time field
  - time input
  - time select
  - clock picker
  - hour picker
useWhen:
  - A time of day without a date, such as when a shift starts
  - Times on steps, such as every quarter or half hour
avoidWhen:
  - text: A date and a time together, such as when a meeting starts.
    use: DatePicker
  - text: A length of time, such as 45 minutes.
    use: TextField
  - text: A few fixed times, such as on the hour.
    use: Select
components:
  - TimePicker
examples:
  StartTime:
    role: overview
    open: true
    caption: Where people write AM and PM, a third wheel holds them.
  TimePickerAnatomy: anatomy
  TimePickerPopupAnatomy: anatomy
  ClockConventions: example
  MinuteSteps: example
  OfficeHours: example
---

# TimePicker

## Anatomy

```tsx figure=TimePickerAnatomy

```

1. **Field** (`env-time-picker`)
2. **Control** (`env-date-picker-control`)
3. **Label** (`env-date-picker-label`, `label`)
4. **Value** (`env-date-picker-value`)
5. **Clear** (`env-date-picker-clear`, `clearable`)
6. **Clock icon** (`env-date-picker-icon`)
7. **Description** (`env-field-description`, `description`)

```tsx figure=TimePickerPopupAnatomy open

```

1. **Popup** (`env-time-picker-popup`)
2. **Column** (`env-time-list-column`)
3. **Time** (`env-time-list-row[data-centered]`)
4. **Actions** (`env-date-picker-actions`)

## Behaviour

### The locale's clock

```tsx figure=ClockConventions

```

### Steps

```tsx figure=MinuteSteps

```

### Within office hours

```tsx figure=OfficeHours motion

```

## Accessibility

### Keyboard

| Key                                                                         | Action                                               |
| --------------------------------------------------------------------------- | ---------------------------------------------------- |
| <kbd>Enter</kbd>, <kbd>Space</kbd>, <kbd>↓</kbd>, <kbd>↑</kbd> on the field | Opens the popup at the chosen value.                 |
| <kbd>↑</kbd>, <kbd>↓</kbd> on a wheel                                       | Chooses its previous or next value, wrapping around. |
| <kbd>←</kbd>, <kbd>→</kbd>                                                  | Moves to the next wheel.                             |
| <kbd>Backspace</kbd>, <kbd>Delete</kbd> on the field                        | Clears a clearable field.                            |
