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

A month picker is a field that shows a month in the reader's locale, such as October 2026, and opens a year of months to choose it from. Its value is a month without a day or a zone, as `YYYY-MM`. It shares DatePicker's field and popup, and its months follow the calendar's keys.

```tsx example=ReportMonth

```

## Anatomy

1. **Field**: a button in the shared text field's frame, with the floating `label`, `description` and `error`, showing the value or the `placeholder`.
2. **Clear button** (`clearable`): a text icon button named `clearLabel` (Clear), while there is a value.
3. **Calendar icon**: at the end of the field.
4. **Popup**: the Popover surface below the field, with the year and its footer.
5. **Year heading**: the year between the previous and next year buttons (`previousYearLabel`, `nextYearLabel`).
6. **Months**: the year's twelve months in four rows of three, each named as the locale shortens it; this month has a ring and the chosen month a solid fill.
7. **Footer**: This month at the start, and Clear with `clearable` at the end.

## Variants and sizes

| Variant              | Use for                                                                                                              |
| -------------------- | -------------------------------------------------------------------------------------------------------------------- |
| Month                | A month of a year. Choosing one closes the popup. The default.                                                       |
| `variant="floating"` | A long form on a page: the field 3.5 rem tall inside its border, whose label floats above the value, as TextField's. |

- A field fills its container's width.
- `size` sets the field's height, as on every control: `sm`, `md` or `lg` in the app's [scale](../foundations/scale.md); without it the field takes its container's control height. `showLabel={false}` hides the label in a toolbar, so a placeholder and an `aria-label` name it.
- The year is as wide as DatePicker's calendar; each month is as tall as a `md` control, and touch-tall on touch screens. The popup's buttons are `sm`.

## States and behaviour

- **Opening and closing**: pressing the field, its label or its icon opens the year, as does <kbd>↓</kbd> or <kbd>↑</kbd>; pressing the field or its label again, a press outside and <kbd>Esc</kbd> close it and return focus to the field. As it opens, focus moves to the chosen month, or this month. `open`, `defaultOpen` and `onOpenChange` control it.
- **Choosing**: choosing a month calls `onValueChange` with it and closes the popup; This month chooses the current month.
- **Clearing**: with `clearable`, the clear button, Clear in the popup and <kbd>Backspace</kbd> or <kbd>Delete</kbd> on the field remove the value, and `onValueChange` receives null.
- **Limits**: months outside `min` and `max` are unavailable and faded, the year buttons stop at them, This month is unavailable outside them, and values are kept within them.
- **Locale**: `locale` sets how the value, the year and the month names are written, the browser's by default; `formatOptions` changes the field's format, such as `{ month: '2-digit', year: '2-digit' }` for a card's expiry. Months are Gregorian, also in a locale with a calendar of its own.
- **Right to left**: a field in right-to-left text opens months that run right to left, where <kbd>←</kbd> and <kbd>→</kbd> follow the reading direction.
- **Read only and disabled**: a read-only field shows its value and can be focused, but its popup doesn't open; like a read-only input it isn't validated. A disabled field can't be focused and is left out of the form.
- **In forms**: `name` submits the value as `YYYY-MM`, `required` asks for one, and an empty required field takes focus when its form is submitted; a form reset restores an uncontrolled field's `defaultValue`. Validation and its `error` belong to the application.

## Content guidelines

- Name the field after the period, in sentence case: "Report month", "Billing period", "Expires".
- Use the description for the limits: "Any month of the fiscal year, April to March."
- Write an error that says how to correct the value: "Choose a month after the start."
- Translate `clearLabel`, `thisMonthLabel`, `previousYearLabel` and `nextYearLabel`, or EnvUIProvider's `messages.monthPicker`, where the interface is not in English.

## Do and don't

### Do

- Store and send the field's `YYYY-MM` value; it sorts and compares as text.
- Use `min` and `max` for the months that can be chosen, and say so in the description.

### Don't

- Don't ask for a day when only the month matters; a DatePicker makes people pick a day that means nothing.
- Don't use a month picker for a range of months in one field; use two fields, such as From and To.
- Don't disable a month picker to show a month; use `readOnly`, which people can still focus and read.

## Accessibility

### Keyboard

| Key                                                                           | Action                                                                                                                                                                                 |
| ----------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| <kbd>Tab</kbd>, <kbd>Shift</kbd>+<kbd>Tab</kbd>                               | Moves focus to the field, then its clear button. In an open popup, moves between the year buttons, the active month and the footer's buttons; moving focus out of the popup closes it. |
| <kbd>Enter</kbd>, <kbd>Space</kbd>, <kbd>↓</kbd> or <kbd>↑</kbd> on the field | Opens the year with focus on the chosen month, or this month.                                                                                                                          |
| <kbd>Backspace</kbd> or <kbd>Delete</kbd> on the field                        | Clears the value of a clearable field.                                                                                                                                                 |
| <kbd>←</kbd>, <kbd>→</kbd>                                                    | Moves to the previous or next month, in the reading direction, on into the previous or next year.                                                                                      |
| <kbd>↑</kbd>, <kbd>↓</kbd>                                                    | Moves to the month three before or after, a row up or down.                                                                                                                            |
| <kbd>Page Up</kbd>, <kbd>Page Down</kbd>                                      | Moves to the same month of the previous or next year.                                                                                                                                  |
| <kbd>Home</kbd>, <kbd>End</kbd>                                               | Moves to the first or last month of the row.                                                                                                                                           |
| <kbd>Enter</kbd> or <kbd>Space</kbd> on a month                               | Chooses the month and closes the popup.                                                                                                                                                |
| <kbd>Esc</kbd>                                                                | Closes the popup and returns focus to the field; in a dialog, the next <kbd>Esc</kbd> closes the dialog.                                                                               |

### envUI provides

- The field as a `combobox` button named by its label, with the description and error as its description, `aria-invalid`, `aria-required` and `aria-readonly`.
- The months as a grid named by the year, each named by its month and year, such as "October 2026", with the chosen month selected, this month marked as the current date and unavailable months disabled; the active month is the grid's one tab stop.
- Focus that moves into the year as it opens and back to the field as it closes, and stays where it was when a key doesn't move the month.
- The year heading as a polite live region, so the new year is announced as it changes, and year buttons that stay focusable at `min` and `max` and report `aria-disabled`.
- This month's ring and the chosen month's fill with at least 3:1 contrast, and system colors under forced colors.

### You provide

- A `label`, or `aria-label` or `aria-labelledby` on a field without one.
- Validation, such as the order of two months, and its `error`.
- The labels in the application's language.

## Examples

### Within a fiscal year

`min` and `max` make the months outside April to March unavailable, and the year buttons stop at them.

```tsx example=FiscalYear

```

### A short format

`formatOptions` writes the month and year as two digits each, as on a card.

```tsx example=ShortFormat

```

### In a form

A required field submits its `YYYY-MM` value, and Reset empties it again.

```tsx example=ExpenseForm

```

## Changelog

- **1.0.0**: MonthPicker, for a month of a year, with `min` and `max`.
