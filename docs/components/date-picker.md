---
title: DatePicker
summary: A field that opens a calendar to choose a date, or a date and time, and the calendar on its own.
status: stable
since: 1.0.0
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
  - A day, such as when a report goes out or a task is due
  - A day and a time, such as when a meeting starts
  - A day chosen from a month that stays in view, such as in a planning view (Calendar)
avoidWhen:
  - text: A time of day without a date, such as when a shift starts.
    use: TimePicker
  - text: A month without a day, such as a billing period.
    use: MonthPicker
  - text: A moment shown relative to now, such as "3 hours ago".
    use: RelativeTime
  - text: A free-text date that people type in any format.
    use: TextField
  - text: A choice among a few named periods, such as This week or This month.
    use: SegmentedControl
components:
  - DatePicker
  - Calendar
examples:
  PublishDate:
    role: overview
    motion: true
  PlanningCalendar:
    role: overview
    caption: 'Calendar: the month the field opens.'
  Variants: variants
  SmallToolbar: example
  DatePickerAnatomy: anatomy
  DatePickerPopupAnatomy: anatomy
  MeetingTime: example
  WithinRange: example
  DayOnly:
    role: do
    caption: A day alone where the time doesn't matter.
  NeedlessTime:
    role: dont
    caption: A time nobody chose, such as midnight on a due date.
---

# DatePicker

## Variants

```tsx figure=Variants

```

1. **Outline**
2. **Outline, with a time**
3. **Floating**

| Variant              | Use for                                                    |
| -------------------- | ---------------------------------------------------------- |
| Outline              | A day; choosing one closes the calendar. The default.      |
| Outline, with a time | A day and a time, with Now and the time's wheels.          |
| Floating             | A long form on a page, as a text field's floating variant. |

### In a toolbar

A field without a visible label, such as in a toolbar, shows its placeholder instead, and keeps enough width for a date.

```tsx figure=SmallToolbar

```

## Anatomy

```tsx figure=DatePickerAnatomy

```

1. **Field** (`env-date-picker`)
2. **Control** (`env-date-picker-control`)
3. **Label** (`env-date-picker-label`, `label`)
4. **Value** (`env-date-picker-value`)
5. **Clear** (`env-date-picker-clear`, `clearable`)
6. **Calendar icon** (`env-date-picker-icon`)
7. **Description** (`env-field-description`, `description`)

```tsx figure=DatePickerPopupAnatomy open

```

1. **Popup** (`env-date-picker-popup`)
2. **Previous month** (`env-calendar-previous`)
3. **Month** (`env-calendar-title`)
4. **Next month** (`env-calendar-next`)
5. **Day** (`env-calendar-day:last-child`)
6. **Actions** (`env-date-picker-actions`)

## Behaviour

### States

A read-only field shows its value, and its calendar doesn't open.

<!-- specimen: States -->

### A date and a time

With a time, the calendar stays open beside the time's wheels, and turning a wheel sets the time at once.

```tsx figure=MeetingTime motion

```

### Within a range

Days outside the allowed range are unavailable, and the month buttons stop at them.

```tsx figure=WithinRange motion

```

## Rules

Ask for a time only where it matters, and for a range in two fields.

```tsx figure=DayOnly

```

```tsx figure=NeedlessTime

```

### Ranges

Use two fields for a range, such as First day and Last day.

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

## Compose

### Usage

A DatePicker is a field with its `label`, `description` and `error`, whose button opens the calendar.

- Its value is a day as `YYYY-MM-DD`, or `null` for none.
- Leave it uncontrolled, with `defaultValue`, or control it with `value` and `onValueChange`, which receives `null` once the field is cleared.
- `clearable` adds a clear button to the field and the calendar.

```tsx source=PublishDate

```

#### A date and a time

`granularity` is `day`, the default, or `minute`, for a local date and time as `YYYY-MM-DDTHH:mm`.

- The time is chosen on wheels of hours, minutes every `minuteStep` minutes, 15 by default, and, on a 12-hour clock, day periods.
- `placeholderTime`, as `HH:mm`, is the time a newly chosen day starts with, 00:00 by default.

```tsx
<DatePicker
  label="Meeting"
  granularity="minute"
  placeholderTime="09:00"
  minuteStep={30}
  value={meeting}
  onValueChange={setMeeting}
  clearable
/>
```

#### Range and format

`min` and `max`, in the value's format, make earlier and later days unavailable, and the month buttons stop at them. Check the order of two dates yourself, and set `error`.

- `locale`, EnvUIProvider's by default, sets the shown value and the calendar's names.
- `weekStart` sets the first day of the week, from 0 for Sunday.
- `formatOptions` sets the `Intl.DateTimeFormat` options of the shown value.

#### In a form

`name` submits the value as `YYYY-MM-DD`, or `YYYY-MM-DDTHH:mm`, a local date without a zone; converting it to a moment belongs to the application.

- `required` keeps an empty field from submitting, and a reset restores `defaultValue`.
- Use `readOnly`, not `disabled`, for a date people can't change.
- Values are `YYYY-MM-DD`, so two dates compare as text: on submit, set the last field's `error` where `last < first`.

```tsx
<form onSubmit={request}>
  <DatePicker label="First day" name="first" defaultValue="2026-11-02" required />
  <DatePicker label="Last day" name="last" defaultValue="2026-11-06" required error={error} />
  <Button type="submit">Request leave</Button>
</form>
```

#### Variants and sizes

`variant` is `outline`, the default, or `floating`, 3.5 rem tall with room for its label, as TextField's.

- `size` is `sm`, `md` or `lg`; without it, the field takes its container's control height.
- With `showLabel={false}`, `placeholder` shows in place of the label; name the field with `aria-label`.
- The field is 12 rem wide at least, also in a container sized to its content, and in a narrower container it takes the container's width.

```tsx
<DatePicker size="sm" showLabel={false} aria-label="Due" placeholder="Due" granularity="minute" />
```

#### Calendar

Calendar is the month on its own, for a page or a panel: it takes `value`, `defaultValue` and `onValueChange`, `min`, `max`, `weekStart` and `locale`, as the field does.

```tsx
<Calendar aria-label="Planning" value={day} onValueChange={setDay} />
```

### Composition

`open`, `defaultOpen` and `onOpenChange` control the calendar. `clearLabel`, `todayLabel`, `nowLabel`, `timeLabel`, `previousMonthLabel` and `nextMonthLabel` name its buttons, from EnvUIProvider's `messages` by default. `className` and `style` reach the field's root, and `ref` the button.

The field's parts are the root, `env-field` with `env-date-picker`; the control, `env-date-picker-control`, with the label, `env-date-picker-label`, the value, `env-date-picker-value`, the clear button, `env-date-picker-clear`, and the calendar icon, `env-date-picker-icon`; then the description, `env-field-description`, and the error, `env-field-error`. The popup is the picker card TimePicker and MonthPicker open too, `env-picker-popup` with `env-date-picker-popup`. Its body, `env-picker-popup-body`, holds the calendar, with `env-calendar-previous`, `env-calendar-title`, `env-calendar-next` and `env-calendar-day`, and the times, `env-date-picker-time`, beside it with `granularity="minute"`; its footer, `env-picker-popup-footer` with `env-date-picker-actions`, holds the actions, Clear in `env-picker-popup-footer-end` with `env-date-picker-actions-end`.

### Customize

Its popup is frosted, as every popup is: `--env-popup-opacity`, `--env-popup-blur` and `--env-popup-shadow`, set on a theme, change it, as [Popover](popover.md#customize) describes.

## Changelog

- **1.0.0-prerelease.5**: `defaultTime` is `placeholderTime`, as React Aria names it: `default` names an uncontrolled starting value elsewhere.
- **1.0.0-prerelease.5**: The calendar popup is frosted: the popup's color lets a little of what is behind through, blurred, with a soft shadow and no outline edge, and is solid with its edge at high contrast and with reduced transparency. Its inset is a panel's, as wide as a popup row's corner: 14 px, 11.2 px at the compact scale. The calendar leads with the month's name, its buttons side by side at the end; the days of a week touch, a row height wide; today is in the accent color rather than ringed, and a day under the pointer takes the neutral fill.
- **1.0.0**: The field keeps its minimum width, 12 rem, in a container sized to its content, such as an inline-flex toolbar, rather than growing after the container measured it and pushing its neighbours onto another row; in a narrower container it still takes the container's width. The calendar's month and year, `env-calendar-heading`, are `env-calendar-title`.
- **1.0.0**: With the minute granularity, the time is chosen on wheels of hours, minutes every `minuteStep` minutes (15) and, on a 12-hour clock, day periods, beside the calendar, in place of the time field under it; turning a wheel sets the time at once. The calendar has no Done button, and `doneLabel` is gone: it closes as a date-only one does. The field and popup are shared with TimePicker and MonthPicker.
- **1.0.0**: `withTime` is `granularity`, `"day"` or `"minute"`; `hint` is `description`; `variant="outlined"` is `variant="outline"`. `className` and `style` style the field's root rather than the button, which takes `ref`. The calendar opens on the shared popup, its month buttons are ghost icon buttons, and its labels come from EnvUIProvider's `messages`, as its locale does: `env-date-time-well` is `env-date-picker-control`.
- **1.0.0**: `DateTimeField` is `DatePicker`, with the `env-date-picker-*` classes; the page is `date-picker`.
