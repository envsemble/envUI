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

A date picker is a field that shows a date, or with `granularity="minute"` a date and time, in the reader's locale, such as 20 Oct 2026 or Oct 20, 2026, 9:30 AM, and opens a calendar to choose it. Its values are local dates and times without a zone: a day as `YYYY-MM-DD`, or `YYYY-MM-DDTHH:mm` with a time. Converting them to and from a moment in time belongs to the application. The field is the shared text field, and the calendar follows the WAI-ARIA date picker.

**Calendar** is the month of days the field opens, which also stands on its own within a page or a panel.

```tsx example=PublishDate

```

## Anatomy

1. **Field**: a button in the shared text field's frame, with the floating `label`, `description` and `error`, showing the value or the `placeholder`.
2. **Clear button** (`clearable`): a text icon button named `clearLabel` (Clear), while there is a value.
3. **Calendar icon**: a calendar, or a calendar with a clock with the minute granularity, at the end of the field.
4. **Popup**: the Popover surface below the field, with the calendar, the times with the minute granularity, and its footer.
5. **Month heading**: the month and year between the previous and next month buttons (`previousMonthLabel`, `nextMonthLabel`).
6. **Days**: a grid of six weeks under the weekday names, each day a round mark; today has a ring and the chosen day a solid fill.
7. **Time** (`granularity="minute"`): a column beside the calendar, as tall as it, under the heading `timeLabel` (Time), holding TimePicker's wheels side by side: Hours, Minutes every `minuteStep` minutes (15) and, on a 12-hour clock, AM/PM, in the order the locale writes a time. Each wheel's middle row is its value, on the solid fill of a chosen day, so the time reads as one line. Where the window is narrow, the time stacks under the calendar.
8. **Footer**: Today, or Now with the minute granularity, at the start, and Clear with `clearable` at the end.

## Variants and sizes

| Variant                | Use for                                                                                                              |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Date                   | A day. Choosing one closes the calendar. The default.                                                                |
| `granularity="minute"` | A day and a time: the calendar stays open beside the time's wheels, with Now and Clear.                              |
| `variant="floating"`   | A long form on a page: the field 3.5 rem tall inside its border, whose label floats above the value, as TextField's. |

<!-- specimen: States -->

- A field fills its container's width.
- `size` sets the field's height, as on every control: `sm`, `md` or `lg` in the app's [scale](../foundations/scale.md); without it the field takes its container's control height. `showLabel={false}` hides the label in a toolbar, so a placeholder and an `aria-label` name it.
- The calendar is as wide as seven days, each as tall as a `md` control, 2.5 rem or 2 rem in the compact scale; on touch screens days are 2.75 rem, and the calendar fits a phone's width. The popup's buttons are `sm`.
- The calendar always shows six weeks, so its height stays the same from month to month; empty cells before and after the month keep each day under its weekday.

## States and behaviour

- **Opening and closing**: pressing the field, its label or its icon opens the calendar, as does <kbd>↓</kbd> or <kbd>↑</kbd>; pressing the field or its label again, a press outside and <kbd>Esc</kbd> close it and return focus to the field. As it opens, focus moves to the chosen day, or today. `open`, `defaultOpen` and `onOpenChange` control it.
- **Choosing**: choosing a day calls `onValueChange` with the new value and closes the calendar of a date field. With `granularity="minute"`, a newly chosen day starts at `defaultTime` (00:00), and turning any of the time's wheels sets the whole time at once; without a value, the wheels show `defaultTime`, or the current time on the minute step, and choose nothing until one turns. Now chooses the current date and time and leaves the calendar open. `minuteStep` sets the minutes between the minute wheel's rows, from 1 to 60, and a value between them still shows its minute, in its place; on the days of `min` and `max`, the hours, minutes and day periods outside them are dimmer and passed over.
- **Clearing**: with `clearable`, the clear button, Clear in the calendar and <kbd>Backspace</kbd> or <kbd>Delete</kbd> on the field remove the value, and `onValueChange` receives null.
- **Limits**: days outside `min` and `max` are unavailable and faded, the month buttons stop at them, Today or Now is unavailable outside them, and values are kept within them.
- **Days**: today has a ring and the chosen day a solid fill, blue with white text in the light theme and light blue with dark text in the dark theme, each with at least 3:1 contrast against the surface.
- **Locale and week**: `locale` sets the value's format and the calendar's names and numbers, the browser's by default; `formatOptions` changes the field's format. `weekStart` is the locale's first weekday, or Monday where the browser can't tell. The calendar is Gregorian, also in a locale with a calendar of its own, which then names the Gregorian months.
- **Right to left**: a field in right-to-left text opens a calendar that runs right to left, where <kbd>←</kbd> and <kbd>→</kbd> follow the reading direction.
- **Read only and disabled**: a read-only field shows its value and can be focused, but its calendar doesn't open; like a read-only input it isn't validated, so an empty required one never keeps its form from submitting. A disabled field can't be focused and is left out of the form.
- **In forms**: `name` submits the value, `required` asks for one, and an empty required field takes focus when its form is submitted; a form reset restores an uncontrolled field's `defaultValue`. Validation and its `error` belong to the application.
- **Server rendering**: without `locale`, a field or calendar rendered on a server writes British English, and a calendar without a value leaves its days empty until it hydrates; then the reader's language, week and today replace them without a mismatch error. Pass `locale` and `weekStart` for server output in the reader's language.

## Content guidelines

- Name the field after the moment, in sentence case: "Publish on", "Meeting", "Last day".
- Use the description for the limits or what the date affects: "Any day this quarter."
- Write an error that says how to correct the value: "Choose a last day on or after the first."
- Translate `clearLabel`, `todayLabel`, `nowLabel`, `timeLabel`, `previousMonthLabel` and `nextMonthLabel`, and the wheels' names with `messages.timePicker`, where the interface is not in English.

## Do and don't

### Do

- Store and send the field's `YYYY-MM-DD` or `YYYY-MM-DDTHH:mm` values, and convert them to moments with the time zone the application knows.
- Use `min` and `max` for the days that can be chosen, and say so in the description.
- Use `granularity="minute"` only when the time matters.
- Name a Calendar on its own with `aria-label` or `aria-labelledby`.

### Don't

- Don't ask people to type a date in a TextField when they choose it from a calendar.
- Don't use a date picker for a range of two dates in one field; use two fields, such as First day and Last day.
- Don't disable a date picker to show a date; use `readOnly`, which people can still focus and read.

## Accessibility

### Keyboard

| Key                                                                           | Action                                                                                                                                                                                                                                                                                                                                                  |
| ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>                               | Moves focus to the field, then its clear button. In an open calendar, moves between the month buttons, the active day, each of the time's wheels and the footer's buttons; moving focus out of the calendar closes it.                                                                                                                                  |
| <kbd>Enter</kbd>, <kbd>Space</kbd>, <kbd>↓</kbd> or <kbd>↑</kbd> on the field | Opens the calendar with focus on the chosen day, or today.                                                                                                                                                                                                                                                                                              |
| <kbd>Backspace</kbd> or <kbd>Delete</kbd> on the field                        | Clears the value of a clearable field.                                                                                                                                                                                                                                                                                                                  |
| <kbd>←</kbd>, <kbd>→</kbd>                                                    | Moves to the previous or next day, in the reading direction.                                                                                                                                                                                                                                                                                            |
| <kbd>↑</kbd>, <kbd>↓</kbd>                                                    | Moves to the same day of the previous or next week.                                                                                                                                                                                                                                                                                                     |
| <kbd>Page Up</kbd>, <kbd>Page Down</kbd>                                      | Moves to the same day of the previous or next month.                                                                                                                                                                                                                                                                                                    |
| <kbd>Shift</kbd>+<kbd>Page Up</kbd>, <kbd>Shift</kbd>+<kbd>Page Down</kbd>    | Moves to the same day of the previous or next year.                                                                                                                                                                                                                                                                                                     |
| <kbd>Home</kbd>, <kbd>End</kbd>                                               | Moves to the first or last day of the week.                                                                                                                                                                                                                                                                                                             |
| <kbd>↑</kbd>, <kbd>↓</kbd> on the time                                        | Chooses the wheel's previous or next value, wrapping around; <kbd>Page Up</kbd> and <kbd>Page Down</kbd> five, <kbd>Home</kbd> and <kbd>End</kbd> its ends, digits the hour or minute they name, and <kbd>A</kbd> or <kbd>P</kbd> a day period; <kbd>←</kbd> and <kbd>→</kbd> move to the next wheel in the reading direction. The calendar stays open. |
| <kbd>Enter</kbd> or <kbd>Space</kbd> on a day                                 | Chooses the day.                                                                                                                                                                                                                                                                                                                                        |
| <kbd>Esc</kbd>                                                                | Closes the calendar and returns focus to the field; in a dialog, the next <kbd>Esc</kbd> closes the dialog.                                                                                                                                                                                                                                             |

### envUI provides

- The field as a `combobox` button named by its label, with the description and error as its description, `aria-invalid`, `aria-required` and `aria-readonly`.
- The calendar as a grid of days, each named by its full date, such as "Tuesday, 20 October 2026", with the chosen day selected, today marked as the current date and unavailable days disabled; the active day is the grid's one tab stop.
- With the minute granularity, the time as a group named by `timeLabel`, its wheels each a `spinbutton` named Hours, Minutes or AM/PM (`messages.timePicker`), with the value as the locale writes it in `aria-valuetext`.
- A Calendar named with `aria-label` or `aria-labelledby` as a group around its month, so calendars showing the same month stay apart.
- Focus that moves into the calendar as it opens and back to the field as it closes, and stays where it was when a key doesn't move the day.
- The month heading as a polite live region, so the new month is announced as it changes, and month buttons that stay focusable at `min` and `max` and report `aria-disabled`.
- Day colors with their own roles, and today's ring and the chosen day's fill with at least 3:1 contrast.

### You provide

- A `label`, or `aria-label` or `aria-labelledby` on a field without one.
- Validation, such as the order of two dates, and its `error`.
- The labels in the application's language.

## Examples

### A date and a time

With `granularity="minute"`, the calendar stays open beside the time's wheels, here with minutes every half hour with `minuteStep={30}`; turning a wheel sets the time at once, Now chooses the current date and time, and Esc or a press outside closes it.

```tsx example=MeetingTime

```

### Within a range

`min` and `max` make the days outside this quarter unavailable, and the month buttons stop at them.

```tsx example=WithinRange

```

### Small, in a toolbar

`size="sm"` gives the field the small control height, so it lines up with small buttons, and its placeholder shows in place of the hidden label.

```tsx example=SmallToolbar

```

### In a form

Two required fields submit their days; the application checks their order and shows the error, and Reset returns them to `defaultValue`.

```tsx example=LeaveRequest

```

### A calendar on its own

Calendar chooses a day within the page, named by `aria-label`; a status says which day is chosen.

```tsx example=PlanningCalendar

```

## Changelog

- **1.0.0**: With the minute granularity, the time is chosen on wheels of hours, minutes every `minuteStep` minutes (15) and, on a 12-hour clock, day periods, beside the calendar, in place of the time field under it; turning a wheel sets the time at once. The calendar has no Done button, and `doneLabel` is gone: it closes as a date-only one does. The field and popup are shared with TimePicker and MonthPicker.
- **1.0.0**: `withTime` is `granularity`, `"day"` or `"minute"`; `hint` is `description`; `variant="outlined"` is `variant="outline"`, which the `v1-props` codemod writes. `className` and `style` style the field's root rather than the button, which takes `ref`. The calendar opens on the shared popup, its month buttons are ghost icon buttons, and its labels come from EnvUIProvider's `messages`, as its locale does: `env-date-time-well` is `env-date-picker-control`.
- **1.0.0**: `DateTimeField` is `DatePicker`, with the `env-date-picker-*` classes; the page is `date-picker`.
- **0.6.0**: DateTimeField, for a day or, with `withTime`, a date and time, and Calendar.
