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

A time picker is a field that shows a time of day in the reader's locale, such as 09:30 or 9:30 AM, and opens wheels side by side to choose it: the hours, the minutes every `minuteStep`, and on a 12-hour clock AM and PM. The middle row of each wheel is its value, so the chosen time reads as one line, such as 2 00 PM. Its value is a wall-clock time without a zone or a date, as `HH:mm` on the 24-hour clock whatever the locale writes. It shares DatePicker's field and popup, so the two line up in a form.

```tsx example=StartTime

```

## Anatomy

1. **Field**: a button in the shared text field's frame, with the floating `label`, `description` and `error`, showing the value or the `placeholder`.
2. **Clear button** (`clearable`): a text icon button named `clearLabel` (Clear), while there is a value.
3. **Clock icon**: at the end of the field.
4. **Popup**: the Popover surface below the field, with the wheels and its footer.
5. **Wheels**: Hours, Minutes and, where the locale uses a 12-hour clock, AM/PM, in the order the locale writes a time, so the day period comes first in some locales. Each is five rows tall; the middle row is its value, in the body type on the solid fill of a chosen calendar day, and the rows above and below are smaller, dimmer and fade towards the edges. Hours run 00 to 23, or 12, 1 to 11 on a 12-hour clock, and minutes from 00 every `minuteStep` minutes (15); both loop endlessly. AM/PM has its two rows.
6. **Footer**: Now at the start, and Clear with `clearable` at the end, as on DatePicker.

## Variants and sizes

| Variant              | Use for                                                                                                              |
| -------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Time                 | A time of day, chosen on its wheels; the popup stays open while they turn. The default.                              |
| `variant="floating"` | A long form on a page: the field 3.5 rem tall inside its border, whose label floats above the value, as TextField's. |

- A field fills its container's width.
- `size` sets the field's height, as on every control: `sm`, `md` or `lg` in the app's [scale](../foundations/scale.md); without it the field takes its container's control height. `showLabel={false}` hides the label in a toolbar, so a placeholder and an `aria-label` name it.
- Each wheel is five rows tall; a row is as tall as a `md` control, and touch-tall on touch screens. The popup's buttons are `sm`.

## States and behaviour

- **Opening and closing**: pressing the field, its label or its icon opens the wheels, as does <kbd>↓</kbd> or <kbd>↑</kbd>; pressing the field or its label again, a press outside and <kbd>Esc</kbd> close them and return focus to the field. As they open, each wheel has the chosen time in its middle, and the first takes focus. `open`, `defaultOpen` and `onOpenChange` control it.
- **Choosing**: scrolling a wheel, by mouse wheel, trackpad or touch, snaps a row to its middle, and the row it comes to rest on is chosen; pressing a row turns it to the middle. Each choice calls `onValueChange` with the whole time at once; without a value, the wheels show the current time on the minute step and choose nothing until one turns. Now chooses the current time and leaves the popup open, as it does on DatePicker with a time. With reduced motion, the wheels jump rather than glide.
- **Steps**: `minuteStep` sets the minutes between the minute wheel's rows, from 1 to 60. A value between the steps, such as 10:07 with steps of 5 minutes, still shows its minute on the wheel, in its place.
- **Clearing**: with `clearable`, the clear button, Clear in the popup and <kbd>Backspace</kbd> or <kbd>Delete</kbd> on the field remove the value, and `onValueChange` receives null.
- **Limits**: an hour or a day period with no time within `min` and `max`, and a minute that would take the chosen hour outside them, are dimmer and passed over: a wheel that comes to rest on one turns on to the nearest available, the keys skip them, and the chosen time is kept within the limits. Now is unavailable outside them. A range that runs past midnight isn't supported.
- **Locale and clock**: `locale` sets how the value and the times are written, with the locale's own 12- or 24-hour clock, the browser's by default; `formatOptions` changes the field's format, such as `{ hour: 'numeric', minute: '2-digit', hour12: false }`.
- **Read only and disabled**: a read-only field shows its value and can be focused, but its wheels don't open; like a read-only input it isn't validated. A disabled field can't be focused and is left out of the form.
- **In forms**: `name` submits the value as `HH:mm`, `required` asks for one, and an empty required field takes focus when its form is submitted; a form reset restores an uncontrolled field's `defaultValue`. Validation and its `error` belong to the application.

## Content guidelines

- Name the field after the moment, in sentence case: "Starts at", "Reminder", "Call back at".
- Use the description for the limits: "Any half hour between 08:00 and 18:00."
- Write an error that says how to correct the value: "Choose an end after the start."
- Translate `clearLabel` and `nowLabel`, and the wheels' names, Hours, Minutes and AM/PM, with EnvUIProvider's `messages.timePicker`, where the interface is not in English.

## Do and don't

### Do

- Store and send the field's `HH:mm` value, and combine it with a date and the time zone the application knows.
- Choose a `minuteStep` that matches what can be booked, such as 30 for half-hour slots.
- Use `min` and `max` for the hours that can be chosen, and say so in the description.

### Don't

- Don't use two fields, a DatePicker and a TimePicker, for one moment; use a DatePicker with `granularity="minute"`.
- Don't use a time picker for a duration.
- Don't disable a time picker to show a time; use `readOnly`, which people can still focus and read.

## Accessibility

### Keyboard

| Key                                                                           | Action                                                                                                                                                                              |
| ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>                               | Moves focus to the field, then its clear button. In the open popup, moves between the wheels, each one tab stop, and the footer's buttons; moving focus out of the popup closes it. |
| <kbd>Enter</kbd>, <kbd>Space</kbd>, <kbd>↓</kbd> or <kbd>↑</kbd> on the field | Opens the wheels with focus on the first.                                                                                                                                           |
| <kbd>Backspace</kbd> or <kbd>Delete</kbd> on the field                        | Clears the value of a clearable field.                                                                                                                                              |
| <kbd>↑</kbd>, <kbd>↓</kbd>                                                    | Chooses the previous or next value of the wheel; hours and minutes wrap around.                                                                                                     |
| <kbd>Page Up</kbd>, <kbd>Page Down</kbd>                                      | Chooses the value five before or after.                                                                                                                                             |
| <kbd>Home</kbd>, <kbd>End</kbd>                                               | Chooses the wheel's first or last value that is available.                                                                                                                          |
| <kbd>←</kbd>, <kbd>→</kbd>                                                    | Moves to the previous or next wheel, in the reading direction.                                                                                                                      |
| Digits                                                                        | On the hours or minutes, choose the first value they name, such as <kbd>9</kbd> or <kbd>1</kbd><kbd>4</kbd> for an hour and <kbd>3</kbd> for 30 minutes.                            |
| <kbd>A</kbd>, <kbd>P</kbd>                                                    | On the day periods, choose AM or PM, or the period whose name starts with the letter.                                                                                               |
| <kbd>Esc</kbd>                                                                | Closes the popup and returns focus to the field; in a dialog, the next <kbd>Esc</kbd> closes the dialog.                                                                            |

### envUI provides

- The field as a `combobox` button named by its label, with the description and error as its description, `aria-invalid`, `aria-required` and `aria-readonly`.
- The wheels as a group named by the field's label, each a `spinbutton` named Hours, Minutes or AM/PM, with `aria-valuenow`, `aria-valuemin`, `aria-valuemax` and the value as the locale writes it in `aria-valuetext`; the repeated rows that draw a wheel are hidden from assistive technology.
- Focus that moves into the wheels as they open and back to the field as they close.
- The chosen time's fill with at least 3:1 contrast, and system colors under forced colors.

### You provide

- A `label`, or `aria-label` or `aria-labelledby` on a field without one.
- Validation, such as the order of two times, and its `error`.
- The labels in the application's language.

## Examples

### Within office hours

`min`, `max` and `minuteStep={30}` offer the half hours of the working day; hours outside it, and the half hour after 18:00, are unavailable.

```tsx example=OfficeHours

```

### The locale's clock

The same value written by two locales: on the 12-hour clock in US English, with an AM/PM wheel, and the 24-hour clock in German, with hours and minutes alone. The value stays `18:45`.

```tsx example=ClockConventions

```

### In a form

Two required fields submit their `HH:mm` values; the application checks their order and shows the error, and Reset returns them to `defaultValue`.

```tsx example=ShiftForm

```

## Changelog

- **1.0.0**: TimePicker, for a time of day chosen on wheels of hours, minutes and day periods on the locale's clock, with `minuteStep`, `min` and `max`.
