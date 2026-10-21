---
title: DatePicker
summary: A field that opens a calendar to choose a date, or a date and time, and the calendar on its own.
status: stable
since: 0.6.0
category: Forms & selection
aliases:
  - DateTimeField
  - date field
  - date input
  - date time picker
  - datetime picker
  - datetime
  - calendar
  - calendar picker
  - day picker
  - month view
useWhen:
  - People choose a day, such as when a report goes out or a task is due.
  - People choose a day and a time, such as when a meeting starts (`granularity="minute"`).
  - A day is chosen within a page or a panel from a month that stays visible, such as in a planning view (Calendar).
avoidWhen:
  - text: A time of day without a date, such as when a shift starts.
    use: TimePicker
  - text: A month without a day, such as a billing period.
    use: MonthPicker
  - text: A moment shown relative to now, such as "3 hours ago".
    use: RelativeTime
  - text: Activity per day over months, shown as shades.
    use: CalendarHeatmap
  - text: A free-text date that people type in any format.
    use: TextField
  - text: A choice among a few named periods, such as This week or This month.
    use: SegmentedControl
related:
  - time-picker
  - month-picker
  - text-field
  - popover
  - combobox
  - calendar-heatmap
  - relative-time
  - accessibility
components:
  - DatePicker
  - Calendar
---

# DatePicker

## Overview

A date picker is a field that opens a calendar to choose a day, or a day and a time.

```tsx example=PublishDate

```

```tsx example=PlanningCalendar caption="Calendar: the month the field opens, also on its own in a page."

```

### States

A read-only field shows its value, and its calendar doesn't open.

<!-- specimen: States -->

### A date and a time

With `granularity="minute"`, the calendar stays open beside the time's wheels; turning a wheel sets the time at once.

```tsx example=MeetingTime

```

### Within a range

Days outside `min` and `max` are unavailable, and the month buttons stop at them.

```tsx example=WithinRange

```

### In a form

`name` submits the value as `YYYY-MM-DD`, or `YYYY-MM-DDTHH:mm`, a local date without a zone. Converting it to a moment belongs to the application.

```tsx example=LeaveRequest

```

## Variants

```tsx example=Variants

```

| Variant                | Use for                                                 |
| ---------------------- | ------------------------------------------------------- |
| Date                   | A day; choosing one closes the calendar. The default.   |
| `granularity="minute"` | A day and a time, with Now and the time's wheels.       |
| `variant="floating"`   | A long form on a page, as TextField's floating variant. |

### Sizes

`sm`, `md` and `lg`, the control heights of the [scale](../foundations/scale.md). With `showLabel={false}`, the placeholder shows in place of the label.

```tsx example=SmallToolbar

```

## When to use

```tsx do=DayOnly caption="A day alone where the time doesn't matter."

```

```tsx dont=NeedlessTime caption="A time nobody chose, such as midnight on a due date."

```

```tsx do=LimitsExplained caption="Say which days can be chosen in the description."

```

```tsx dont=LimitsUnexplained caption="Unavailable days that people find only in the calendar."

```

- Use two fields for a range, such as First day and Last day.
- Use `readOnly`, not `disabled`, to show a date people can't change.

### Labels

```tsx do=NamedMoment caption="A label that names the moment."

```

```tsx dont=GenericLabel caption="Date, which says nothing about what happens then."

```

## Anatomy

```tsx anatomy=DatePickerAnatomy

```

1. **Field** (`env-date-picker`)
2. **Control** (`env-date-picker-control`)
3. **Label** (`env-date-picker-control > label`, `label`)
4. **Value** (`env-date-picker-value`)
5. **Clear** (`env-date-picker-clear`, `clearable`)
6. **Calendar icon** (`env-date-picker-icon`)
7. **Description** (`env-field-description`, `description`)

Not shown: the popup, `env-date-picker-popup`, with the calendar, and the times, `env-date-picker-time`, beside it.

## Accessibility

### Keyboard

| Key                                                                         | Action                                              |
| --------------------------------------------------------------------------- | --------------------------------------------------- |
| <kbd>Enter</kbd>, <kbd>Space</kbd>, <kbd>↓</kbd>, <kbd>↑</kbd> on the field | Opens the calendar at the chosen day, or today.     |
| <kbd>←</kbd>, <kbd>→</kbd>                                                  | Moves a day, in the reading direction.              |
| <kbd>↑</kbd>, <kbd>↓</kbd>                                                  | Moves a week.                                       |
| <kbd>Page Up</kbd>, <kbd>Page Down</kbd>                                    | Moves a month; with <kbd>Shift</kbd>, a year.       |
| <kbd>Home</kbd>, <kbd>End</kbd>                                             | Moves to the start or end of the week.              |
| <kbd>Enter</kbd>, <kbd>Space</kbd> on a day                                 | Chooses the day.                                    |
| <kbd>↑</kbd>, <kbd>↓</kbd> on a time wheel                                  | Chooses its previous or next value.                 |
| <kbd>Esc</kbd>                                                              | Closes the calendar and returns focus to the field. |
| <kbd>Backspace</kbd>, <kbd>Delete</kbd> on the field                        | Clears a clearable field.                           |

### envUI provides

- The field as a `combobox` button named by its label, with its description and error.
- The calendar as a grid of days, each named by its full date, with one tab stop.
- Time wheels as `spinbutton`s named Hours, Minutes and AM/PM.
- The month heading as a live region, announced as it changes.

### You provide

- A `label`, or `aria-label` on a field without one.
- Validation, such as the order of two dates, and its `error`.
- The labels in the application's language.

## Changelog

- **1.0.0**: With the minute granularity, the time is chosen on wheels of hours, minutes every `minuteStep` minutes (15) and, on a 12-hour clock, day periods, beside the calendar, in place of the time field under it; turning a wheel sets the time at once. The calendar has no Done button, and `doneLabel` is gone: it closes as a date-only one does. The field and popup are shared with TimePicker and MonthPicker.
- **1.0.0**: `withTime` is `granularity`, `"day"` or `"minute"`; `hint` is `description`; `variant="outlined"` is `variant="outline"`, which the `v1-props` codemod writes. `className` and `style` style the field's root rather than the button, which takes `ref`. The calendar opens on the shared popup, its month buttons are ghost icon buttons, and its labels come from EnvUIProvider's `messages`, as its locale does: `env-date-time-well` is `env-date-picker-control`.
- **1.0.0**: `DateTimeField` is `DatePicker`, with the `env-date-picker-*` classes; the page is `date-picker`.
- **0.6.0**: DateTimeField, for a day or, with `withTime`, a date and time, and Calendar.
