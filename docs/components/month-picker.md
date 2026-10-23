---
title: MonthPicker
summary: A field that opens a year of months to choose a month, such as a billing or reporting period.
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
  - People choose a month of a year, such as the month a report covers or a billing period.
  - The day doesn't matter, only the month.
avoidWhen:
  - text: A day, or a day and a time.
    use: DatePicker
  - text: A choice among a few named periods, such as This month or Last month.
    use: SegmentedControl
  - text: Activity per day over months, shown as shades.
    use: CalendarHeatmap
related:
  - date-picker
  - time-picker
  - text-field
  - calendar-heatmap
components:
  - MonthPicker
---

# MonthPicker

## Overview

A month picker is a field that opens a year of months to choose one, in the reader's locale.

```tsx example=ReportMonth

```

### Within a fiscal year

Months outside `min` and `max` are unavailable, and the year buttons stop at them.

```tsx example=FiscalYear

```

### A short format

`formatOptions` changes how the field writes the month.

```tsx example=ShortFormat

```

### In a form

`name` submits the month as `YYYY-MM`, which sorts and compares as text.

```tsx example=ExpenseForm

```

## Variants

```tsx example=Variants

```

| Variant              | Use for                                                 |
| -------------------- | ------------------------------------------------------- |
| Default              | A month of a year; choosing one closes the popup.       |
| `variant="floating"` | A long form on a page, as TextField's floating variant. |

`sm`, `md` and `lg` set the field's height, the control heights of the [scale](../foundations/scale.md).

## When to use

```tsx do=LimitsExplained caption="Say which values can be chosen in the description."

```

```tsx dont=LimitsUnexplained caption="Unavailable values that people find only in the popup."

```

- Use `readOnly`, not `disabled`, to show a month people can't change.
- Use two fields for a range of months, such as From and To.

### Labels

```tsx do=NamedPeriod caption="A label that names the period."

```

```tsx dont=GenericLabel caption="Month, which says nothing about what the month is for."

```

## Anatomy

```tsx anatomy=MonthPickerAnatomy

```

1. **Field** (`env-month-picker`)
2. **Control** (`env-date-picker-control`)
3. **Label** (`env-date-picker-label`, `label`)
4. **Value** (`env-date-picker-value`)
5. **Clear** (`env-date-picker-clear`, `clearable`)
6. **Calendar icon** (`env-date-picker-icon`)
7. **Description** (`env-field-description`, `description`)

```tsx anatomy=MonthPickerPopupAnatomy open stage=raised

```

1. **Popup** (`env-month-picker-popup`)
2. **Previous year** (`env-month-picker-previous`)
3. **Year** (`env-month-picker-heading`)
4. **Next year** (`env-month-picker-next`)
5. **Month** (`env-month-picker-month`)
6. **Actions** (`env-date-picker-actions`)

## Accessibility

### Keyboard

| Key                                                                         | Action                                           |
| --------------------------------------------------------------------------- | ------------------------------------------------ |
| <kbd>Enter</kbd>, <kbd>Space</kbd>, <kbd>↓</kbd>, <kbd>↑</kbd> on the field | Opens the popup at the chosen value.             |
| Arrow keys                                                                  | Move between months.                             |
| <kbd>Page Up</kbd>, <kbd>Page Down</kbd>                                    | Moves a year.                                    |
| <kbd>Enter</kbd>, <kbd>Space</kbd> on a month                               | Chooses the month.                               |
| <kbd>Esc</kbd>                                                              | Closes the popup and returns focus to the field. |
| <kbd>Backspace</kbd>, <kbd>Delete</kbd> on the field                        | Clears a clearable field.                        |

### envUI provides

- The field as a `combobox` button named by its label, with its description and error.
- The year as a grid of months, each named by month and year, with one tab stop.

### You provide

- A `label`, or `aria-label` on a field without one.
- Validation and its `error`.
- The labels in the application's language.

## Changelog

- **1.0.0**: MonthPicker, for a month of a year, with `min` and `max`.
