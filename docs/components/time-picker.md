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
  - A time of day without a date, such as when a shift starts
  - Times on steps, such as every quarter or half hour
avoidWhen:
  - text: A date and a time together, such as when a meeting starts.
    use: DatePicker
  - text: A length of time, such as 45 minutes.
    use: TextField
  - text: A choice among a few named times of day, such as Morning or Evening.
    use: SegmentedControl
  - text: A few fixed times, such as on the hour.
    use: Select
components:
  - TimePicker
---

# TimePicker

## Overview

Where people write AM and PM, a third wheel holds them.

```tsx example=StartTime

```

### Within office hours

Only the times that can be booked are offered: between an earliest and a latest time, on steps such as every half hour.

```tsx example=OfficeHours

```

### The locale's clock

The same value on a 12-hour and a 24-hour clock; the value itself stays on the 24-hour clock.

```tsx example=ClockConventions

```

### In a form

The form sends the time alone, without a date or a time zone. Combining it with a date belongs to the application.

```tsx example=ShiftForm

```

## Variants

```tsx variants=Variants

```

1. **Outline**
2. **Floating**

| Variant  | Use for                                                            |
| -------- | ------------------------------------------------------------------ |
| Outline  | A time of day, on wheels that stay open as they turn. The default. |
| Floating | A long form on a page, as TextField's floating variant.            |

### Sizes

Small, medium and large set the field's height, the control heights of the [scale](../foundations/scale.md).

## When to use

### A time that can't change

Show a time people can't change as read-only rather than disabled, so they can still focus and read it.

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

```tsx anatomy=TimePickerPopupAnatomy open

```

1. **Popup** (`env-time-picker-popup`)
2. **Column** (`env-time-list-column`)
3. **Time** (`env-time-list-row[data-centred]`)
4. **Actions** (`env-date-picker-actions`)

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

## In code

### Usage

TimePicker's value is a time of day as `HH:mm` on the 24-hour clock, or `null` for none: control it with `value` and `onValueChange`, which receives `HH:mm`, or `null` once the field is cleared, or leave it uncontrolled with `defaultValue`. It shows the value and its wheels on the clock of `locale`, EnvUIProvider's or else the browser's, 12- or 24-hour, and `formatOptions` sets how the field shows it, as `Intl.DateTimeFormat` options, by default the short time style. `label`, `description` and `error` work as on TextField. `clearable` adds a clear button to the field and the popup, named by `clearLabel`, and `nowLabel` names the popup's shortcut to the current time.

```tsx source=StartTime

```

#### Available times

`min` and `max`, as `HH:mm`, are the earliest and latest times. `minuteStep` is the minutes between the times the list offers, from 1 to 60, 15 by default; a value between them still shows, in its place.

```tsx source=OfficeHours

```

#### In a form

`name` submits the time as `HH:mm`, without a date or a zone, and a form reset restores `defaultValue`; `required` keeps an empty field's form from submitting and focuses it. Use `readOnly`, not `disabled`, to show a time people can't change. For one moment, a day and a time, use a single DatePicker with `granularity="minute"`.

```tsx source=ShiftForm

```

#### Variants and sizes

`variant` is `outline`, the default, or `floating`, 3.5 rem tall with room for its label. `size` is `sm`, `md` or `lg`; without it, the field takes its container's control height. `showLabel={false}` hides the label, with a `placeholder` while the field is empty.

```tsx source=Variants

```

### Composition

TimePicker shares DatePicker's field: the root, `env-time-picker`, holds the control, `env-date-picker-control`, with the label, `env-date-picker-label`, the value, `env-date-picker-value`, the clear button, `env-date-picker-clear`, and the clock icon, `env-date-picker-icon`, then the description. The popup, `env-time-picker-popup`, holds a wheel, `env-time-list-column`, for hours, minutes and, on a 12-hour clock, the day period, each row an `env-time-list-row`, the chosen one with `data-centred`, and the actions, `env-date-picker-actions`. `className` and `style` reach the root, and `ref` the field's button.

## Changelog

- **1.0.0**: TimePicker, for a time of day chosen on wheels of hours, minutes and day periods on the locale's clock, with `minuteStep`, `min` and `max`.
