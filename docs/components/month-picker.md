---
title: MonthPicker
summary: A field for picking a month from a view of the year.
status: beta
since: 1.0.0
category: Forms & selection
aliases:
  - month picker
  - month field
  - month input
  - month and year
  - period picker
  - billing period
useWhen:
  - A month of a year, such as the month a report covers
avoidWhen:
  - text: A day, or a day and a time.
    use: DatePicker
  - text: A choice among a few named periods, such as This month or Last month.
    use: SegmentedControl
components:
  - MonthPicker
examples:
  ReportMonth:
    role: overview
    open: true
  MonthPickerAnatomy: anatomy
  MonthPickerPopupAnatomy: anatomy
  FiscalYear: example
  ShortFormat: example
---

# MonthPicker

## Anatomy

```tsx figure=MonthPickerAnatomy

```

1. **Field** (`env-month-picker`)
2. **Control** (`env-date-picker-control`)
3. **Label** (`env-date-picker-label`, `label`)
4. **Value** (`env-date-picker-value`)
5. **Clear** (`env-date-picker-clear`, `clearable`)
6. **Calendar icon** (`env-date-picker-icon`)
7. **Description** (`env-field-description`, `description`)

```tsx figure=MonthPickerPopupAnatomy open

```

1. **Popup** (`env-month-picker-popup`)
2. **Previous year** (`env-month-picker-previous`)
3. **Year** (`env-month-picker-title::text`)
4. **Next year** (`env-month-picker-next`)
5. **Month** (`env-month-picker-month`)
6. **Actions** (`env-date-picker-actions`)

## Behaviour

### Choosing a month

<!-- specimen: ChoosingAMonth -->

### Within a fiscal year

```tsx figure=FiscalYear motion

```

### A short format

```tsx figure=ShortFormat

```

## Accessibility

### Keyboard

| Key                                                                         | Action                               |
| --------------------------------------------------------------------------- | ------------------------------------ |
| <kbd>Enter</kbd>, <kbd>Space</kbd>, <kbd>↓</kbd>, <kbd>↑</kbd> on the field | Opens the popup at the chosen value. |
| Arrow keys                                                                  | Move between months.                 |
| <kbd>Page Up</kbd>, <kbd>Page Down</kbd>                                    | Moves a year.                        |
| <kbd>Backspace</kbd>, <kbd>Delete</kbd> on the field                        | Clears a clearable field.            |
