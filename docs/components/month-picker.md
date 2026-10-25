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
  - A month of a year, such as the month a report covers
  - A period where the day doesn't matter, such as a billing period
avoidWhen:
  - text: A day, or a day and a time.
    use: DatePicker
  - text: A choice among a few named periods, such as This month or Last month.
    use: SegmentedControl
components:
  - MonthPicker
---

# MonthPicker

## Overview

The month shows in the reader's language, and choosing one closes the popup.

```tsx example=ReportMonth

```

### Within a fiscal year

Months outside the range a field allows are unavailable, and the year buttons stop at them.

```tsx example=FiscalYear

```

### A short format

The field can write the month in a shorter form, such as 07/28.

```tsx example=ShortFormat

```

## Variants

```tsx variants=Variants

```

1. **Outline**
2. **Floating**

| Variant  | Use for                                                 |
| -------- | ------------------------------------------------------- |
| Outline  | In forms, dialogs and panes. The default.               |
| Floating | A long form on a page, as TextField's floating variant. |

## When to use

### Ranges

Use two fields for a range of months, such as From and To.

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

```tsx anatomy=MonthPickerPopupAnatomy open

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

## In code

### Usage

A MonthPicker takes its `label`, a `description` and an `error`, and its value is a month as `YYYY-MM`. Leave it uncontrolled, with `defaultValue`, which a form reset restores, or control it with `value` and `onValueChange`, which receives the month, or `null` once the field is cleared. `clearable` adds a clear button to the field and the popup.

```tsx source=ReportMonth

```

#### Range and format

`min` and `max`, as `YYYY-MM`, make earlier and later months unavailable. `formatOptions` takes `Intl.DateTimeFormat` options for the shown value, by default the long month and the year; `locale` is EnvUIProvider's, else the browser's, and months are Gregorian, also in a locale with a calendar of its own.

```tsx source=FiscalYear

```

```tsx source=ShortFormat

```

#### In a form

`name` submits the month as `YYYY-MM`, and `required` keeps an empty field's form from submitting. Use `readOnly`, not `disabled`, for a month people can't change.

```tsx
import { useState, type FormEvent } from 'react';
import { Button, MonthPicker, Column, Row, Text } from '@envsemble/envui';

export default function ExpenseForm() {
  const [sent, setSent] = useState('');
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setSent(`Expenses for ${String(data.get('period'))} submitted.`);
  };
  return (
    <form onSubmit={submit} onReset={() => setSent('')} style={{ inlineSize: 'min(100%, 16rem)' }}>
      <Column gap={4}>
        <MonthPicker label="Period" name="period" placeholder="Choose a month" required />
        <Row wrap align="center" gap={4}>
          <Button type="submit">Submit expenses</Button>
          <Button type="reset" variant="secondary">
            Reset
          </Button>
        </Row>
        <Text variant="caption" emphasis="muted" role="status">
          {sent}
        </Text>
      </Column>
    </form>
  );
}
```

#### Variants, sizes and the popup

`variant` is `outline`, the default, at the control height, or `floating`, 3.5 rem tall with room for its label. `size` is `sm`, `md` or `lg`; without it the field takes its container's control height. `showLabel={false}` hides the label for a field whose purpose is clear, and `placeholder` shows while it is empty. `open`, `defaultOpen` and `onOpenChange` control the popup. `clearLabel`, `thisMonthLabel`, `previousYearLabel` and `nextYearLabel` name its buttons, or EnvUIProvider's `messages.monthPicker` does for the whole application.

### Composition

The field, `env-month-picker`, shares DatePicker's parts: the control, `env-date-picker-control`, with the label, `env-date-picker-label`, the value, `env-date-picker-value`, the clear button, `env-date-picker-clear`, and the calendar icon, `env-date-picker-icon`; then the description, `env-field-description`, and the error, `env-field-error`. The popup, `env-month-picker-popup`, has a header, `env-month-picker-header`, with the previous year, `env-month-picker-previous`, the year, `env-month-picker-heading`, and the next year, `env-month-picker-next`; the year's grid, `env-month-picker-year` and `env-month-picker-grid`, of months, `env-month-picker-month`, each with `data-month` and a mark, `env-month-picker-month-mark`; and the actions, `env-date-picker-actions`. `ref` reaches the field's button, and `className` and `style` its root.

## Changelog

- **1.0.0**: MonthPicker, for a month of a year, with `min` and `max`.
