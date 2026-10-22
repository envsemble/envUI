---
title: TimePicker
summary: A field that opens wheels of hours and minutes to choose a time of day, on the locale's own clock.
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
  - People choose a time of day without a date, such as when a shift starts or a daily reminder goes off.
  - The times that make sense fall on steps, such as every quarter or half hour (`minuteStep`).
avoidWhen:
  - text: A date and a time together, such as when a meeting starts.
    use: DatePicker
  - text: A length of time, such as 45 minutes.
    use: TextField
  - text: A choice among a few named times of day, such as Morning or Evening.
    use: SegmentedControl
related:
  - date-picker
  - month-picker
  - text-field
  - select
components:
  - TimePicker
---

# TimePicker

## Overview

A time picker is a field that opens wheels to choose a time of day, in the reader's locale.

```tsx example=StartTime

```

### Within office hours

`min`, `max` and `minuteStep` offer only the times that can be booked.

```tsx example=OfficeHours

```

### The locale's clock

The same value on a 12-hour and a 24-hour clock; the value stays `HH:mm` on the 24-hour clock.

```tsx example=ClockConventions

```

### In a form

`name` submits the time as `HH:mm`, without a date or a zone. Combining it with a date belongs to the application.

```tsx example=ShiftForm

```

## Variants

```tsx example=Variants

```

| Variant              | Use for                                                 |
| -------------------- | ------------------------------------------------------- |
| Default              | A time of day, on wheels that stay open as they turn.   |
| `variant="floating"` | A long form on a page, as TextField's floating variant. |

`sm`, `md` and `lg` set the field's height, the control heights of the [scale](../foundations/scale.md).

## When to use

```tsx do=LimitsExplained caption="Say which values can be chosen in the description."

```

```tsx dont=LimitsUnexplained caption="Unavailable values that people find only in the popup."

```

- Use `readOnly`, not `disabled`, to show a time people can't change.
- For one moment, a day and a time, use a single DatePicker with `granularity="minute"`.

### Labels

```tsx do=NamedMoment caption="A label that names the moment."

```

```tsx dont=GenericLabel caption="Time, which says nothing about what happens then."

```

## Anatomy

```tsx anatomy=TimePickerAnatomy

```

1. **Field** (`env-time-picker`)
2. **Control** (`env-date-picker-control`)
3. **Label** (`env-date-picker-label`, `label`)
4. **Value** (`env-date-picker-value`)
5. **Clear** (`env-date-picker-clear`, `clearable`)
6. **Clock icon** (`env-date-picker-icon`)
7. **Description** (`env-field-description`, `description`)

Not shown: the popup, `env-time-picker-popup`, with a wheel each for the hours, the minutes and, on a 12-hour clock, AM and PM.

## Accessibility

### Keyboard

| Key                                                                         | Action                                               |
| --------------------------------------------------------------------------- | ---------------------------------------------------- |
| <kbd>Enter</kbd>, <kbd>Space</kbd>, <kbd>↓</kbd>, <kbd>↑</kbd> on the field | Opens the popup at the chosen value.                 |
| <kbd>↑</kbd>, <kbd>↓</kbd> on a wheel                                       | Chooses its previous or next value, wrapping around. |
| <kbd>←</kbd>, <kbd>→</kbd>                                                  | Moves to the next wheel.                             |
| <kbd>Esc</kbd>                                                              | Closes the popup and returns focus to the field.     |
| <kbd>Backspace</kbd>, <kbd>Delete</kbd> on the field                        | Clears a clearable field.                            |

### envUI provides

- The field as a `combobox` button named by its label, with its description and error.
- Each wheel a `spinbutton` named Hours, Minutes or AM/PM, with the time as the locale writes it.

### You provide

- A `label`, or `aria-label` on a field without one.
- Validation and its `error`.
- The labels in the application's language.

## Changelog

- **1.0.0**: TimePicker, for a time of day chosen on wheels of hours, minutes and day periods on the locale's clock, with `minuteStep`, `min` and `max`.
