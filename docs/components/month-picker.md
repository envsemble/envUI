---
title: MonthPicker
summary: A field that opens a year of months to choose a month.
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

The month shows in the reader's language, and choosing one closes the popup.

<!-- specimen: ChoosingAMonth -->

### Within a fiscal year

Months outside the range a field allows are unavailable, and the year buttons stop at them.

```tsx figure=FiscalYear motion

```

### A short format

The field can write the month in a shorter form, such as 07/28.

```tsx figure=ShortFormat

```

## Rules

A month picker is for a month where the day doesn't matter, one month to a field.

### Ranges

Use two fields for a range of months, such as From and To.

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

## Compose

### Usage

A MonthPicker takes its `label`, a `description` and an `error`, and its value is a month as `YYYY-MM`.

- Uncontrolled: `defaultValue`, which a form reset restores.
- Controlled: `value` and `onValueChange`, which receives the month, or `null` once the field is cleared.
- `clearable` adds a clear button to the field and the popup.

```tsx source=ReportMonth

```

#### Range and format

`min` and `max`, as `YYYY-MM`, make earlier and later months unavailable, as the FiscalYear example shows. `formatOptions` takes `Intl.DateTimeFormat` options for the shown value, by default the long month and the year, as the ShortFormat example shows; `locale` is EnvUIProvider's, else the browser's, and months are Gregorian, also in a locale with a calendar of its own.

```tsx
<MonthPicker label="Budget month" min="2026-04" max="2027-03" />
<MonthPicker label="Expires" formatOptions={{ month: '2-digit', year: '2-digit' }} />
```

#### In a form

`name` submits the month as `YYYY-MM`, and `required` keeps an empty field's form from submitting. Use `readOnly`, not `disabled`, for a month people can't change.

```tsx
<form onSubmit={submit}>
  <MonthPicker label="Period" name="period" placeholder="Choose a month" required />
  <Button type="submit">Submit expenses</Button>
</form>
```

#### Sizes and the popup

`size` is `sm`, `md` or `lg`; without it the field takes its container's control height. `showLabel={false}` hides the label for a field whose purpose is clear, and `placeholder` shows while it is empty. `open`, `defaultOpen` and `onOpenChange` control the popup; `onOpenChange` also receives why it opens or closes, `PickerOpenChangeDetails`. `clearLabel`, `thisMonthLabel`, `previousYearLabel` and `nextYearLabel` name its buttons.

### Composition

The field, `env-month-picker`, shares DatePicker's parts: the control, `env-date-picker-control`, with the label, `env-date-picker-label`, the value, `env-date-picker-value`, the clear button, `env-date-picker-clear`, and the calendar icon, `env-date-picker-icon`; then the description, `env-field-description`, and the error, `env-field-error`. The popup is DatePicker's picker card, `env-picker-popup` with `env-date-picker-popup` and `env-month-picker-popup`. Its body, `env-picker-popup-body`, has a header, `env-month-picker-header`, with the previous year, `env-month-picker-previous`, the year, `env-month-picker-title`, and the next year, `env-month-picker-next`; the year's grid, `env-month-picker-year` and `env-month-picker-grid`, of months, `env-month-picker-month`, each with `data-month` and a mark, `env-month-picker-month-mark`; and its footer, `env-picker-popup-footer` with `env-date-picker-actions`, the actions. `ref` reaches the field's button, and `className` and `style` its root.

### Customize

Its popup is frosted, as every popup is: `--env-popup-opacity`, `--env-popup-blur` and `--env-popup-shadow`, set on a theme, change it, as [Popover](popover.md#customize) describes.

## Changelog

- **1.0.0**: MonthPicker, for a month of a year, with `min` and `max`.
- **1.0.0-prerelease.6**: The year buttons show larger arrows, 1.25 rem, on slightly smaller buttons, and the header keeps a little room under it, as the calendar's.
- **1.0.0-prerelease.6**: The grid's month names keep one length where the locale makes nearly all of them that long, such as Sep rather than Sept among en-GB's three-letter months; names with punctuation, and locales whose names vary, keep the locale's own.
- **1.0.0-prerelease.6**: Months outside `min` and `max` take the disabled text color, faded, as a calendar's unavailable days do; this month keeps its accent color.
- **1.0.0-prerelease.6**: The `floating` variant and the `variant` prop are gone: the field is outlined, and takes `size="lg"` in a long form on a page. The field takes a text area's rounded corners rather than round ends. A small one with a visible label takes the medium height, so its floated label and its value each have room, and says so in the console while developing: `sm` is for a field with its label hidden.
- **1.0.0-prerelease.5**: The popup is frosted: the popup's color lets a little of what is behind through, blurred, with a soft shadow and no outline edge but a faint hairline in dark, and is solid with its edge at high contrast and with reduced transparency. Its inset is a panel's, as wide as a popup row's corner: 14 px, 11.2 px at the compact scale. The year leads its header, its buttons side by side at the end; this month is in the accent color rather than ringed, and a month under the pointer takes the neutral fill.
