---
title: DatePicker
summary: A date field with a calendar, for a date or a date and time. The calendar also works on its own.
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
  - A day chosen from a month that stays in view (Calendar)
avoidWhen:
  - text: A time of day without a date, such as when a shift starts.
    use: TimePicker
  - text: A month without a day, such as a billing period.
    use: MonthPicker
  - text: A moment shown relative to now, such as "3 hours ago".
    use: RelativeTime
components:
  - DatePicker
  - Calendar
examples:
  PublishDate:
    role: overview
    open: true
  PlanningCalendar:
    role: overview
    caption: 'Calendar: the month the field opens.'
  Variants: variants
  SmallToolbar: example
  DatePickerAnatomy: anatomy
  DatePickerPopupAnatomy: anatomy
  MeetingTime: example
  WithinRange: example
  PresetsAndBusyDays: example
---

# DatePicker

## Variants

```tsx figure=Variants

```

1. **A day**
2. **A day and a time**

### In a toolbar

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

```tsx figure=DatePickerPopupAnatomy open width="21"

```

1. **Popup** (`env-date-picker-popup`)
2. **Previous month** (`env-calendar-previous`)
3. **Month** (`env-calendar-title`)
4. **Next month** (`env-calendar-next`)
5. **Day** (`env-calendar-day:last-child`)
6. **Actions** (`env-date-picker-actions`)

## Behaviour

### States

<!-- specimen: States -->

### A date and a time

```tsx figure=MeetingTime motion

```

### Within a range

```tsx figure=WithinRange motion

```

### Presets and marked days

```tsx figure=PresetsAndBusyDays open

```

## Accessibility

### Keyboard

| Key                                                                         | Action                                          |
| --------------------------------------------------------------------------- | ----------------------------------------------- |
| <kbd>Enter</kbd>, <kbd>Space</kbd>, <kbd>↓</kbd>, <kbd>↑</kbd> on the field | Opens the calendar at the chosen day, or today. |
| <kbd>←</kbd>, <kbd>→</kbd>                                                  | Moves a day, in the reading direction.          |
| <kbd>↑</kbd>, <kbd>↓</kbd>                                                  | Moves a week.                                   |
| <kbd>Page Up</kbd>, <kbd>Page Down</kbd>                                    | Moves a month; with <kbd>Shift</kbd>, a year.   |
| <kbd>Home</kbd>, <kbd>End</kbd>                                             | Moves to the start or end of the week.          |
| <kbd>↑</kbd>, <kbd>↓</kbd> on a time wheel                                  | Chooses its previous or next value.             |
| <kbd>Backspace</kbd>, <kbd>Delete</kbd> on the field                        | Clears a clearable field.                       |
