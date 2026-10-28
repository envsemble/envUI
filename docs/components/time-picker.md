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
  - A time of day without a date, such as when a shift starts
  - Times on steps, such as every quarter or half hour
avoidWhen:
  - text: A date and a time together, such as when a meeting starts.
    use: DatePicker
  - text: A length of time, such as 45 minutes.
    use: TextField
  - text: A choice among a few named times of day, such as Morning or Evening.
    use: SegmentedControl
  - text: A few fixed times, such as on the hour.
    use: Select
components:
  - TimePicker
examples:
  StartTime:
    role: overview
    motion: true
    caption: Where people write AM and PM, a third wheel holds them.
  Variants: variants
  TimePickerAnatomy: anatomy
  TimePickerPopupAnatomy: anatomy
  ClockConventions: example
  OfficeHours: example
---

# TimePicker

## Variants

```tsx figure=Variants

```

1. **Outline**
2. **Floating**

| Variant  | Use for                                                 |
| -------- | ------------------------------------------------------- |
| Outline  | In forms, dialogs and panes. The default.               |
| Floating | A long form on a page, as TextField's floating variant. |

## Anatomy

```tsx figure=TimePickerAnatomy

```

1. **Field** (`env-time-picker`)
2. **Control** (`env-date-picker-control`)
3. **Label** (`env-date-picker-label`, `label`)
4. **Value** (`env-date-picker-value`)
5. **Clear** (`env-date-picker-clear`, `clearable`)
6. **Clock icon** (`env-date-picker-icon`)
7. **Description** (`env-field-description`, `description`)

```tsx figure=TimePickerPopupAnatomy open

```

1. **Popup** (`env-time-picker-popup`)
2. **Column** (`env-time-list-column`)
3. **Time** (`env-time-list-row[data-centred]`)
4. **Actions** (`env-date-picker-actions`)

## Behaviour

### The locale's clock

The same value on a 12-hour and a 24-hour clock, as people there write it. The value itself stays on the 24-hour clock.

```tsx figure=ClockConventions

```

## Rules

Offer only the times people can choose.

### Within office hours

Offer the times that can be booked: between an earliest and a latest time, on steps such as every half hour.

- A value between the steps still shows, in its place.

```tsx figure=OfficeHours motion

```

### A time that can't change

Show it read-only, not disabled.

## Accessibility

### Keyboard

| Key                                                                         | Action                                               |
| --------------------------------------------------------------------------- | ---------------------------------------------------- |
| <kbd>Enter</kbd>, <kbd>Space</kbd>, <kbd>↓</kbd>, <kbd>↑</kbd> on the field | Opens the popup at the chosen value.                 |
| <kbd>↑</kbd>, <kbd>↓</kbd> on a wheel                                       | Chooses its previous or next value, wrapping around. |
| <kbd>←</kbd>, <kbd>→</kbd>                                                  | Moves to the next wheel.                             |
| <kbd>Esc</kbd>                                                              | Closes the popup and returns focus to the field.     |
| <kbd>Backspace</kbd>, <kbd>Delete</kbd> on the field                        | Clears a clearable field.                            |

### envUI provides

- The field as a `combobox` button named by its label, with its description and error.
- Each wheel a `spinbutton` named Hours, Minutes or AM/PM, with the time as the locale writes it.

### You provide

- A `label`, or `aria-label` on a field without one.
- Validation and its `error`.
- The labels in the application's language.

## Compose

### Usage

```tsx
<TimePicker label="Starts at" value={start} onValueChange={setStart} clearable />
```

The value is a time of day as `HH:mm` on the 24-hour clock, or `null` for none: control it with `value` and `onValueChange`, which receives `HH:mm`, or `null` once the field is cleared, or leave it uncontrolled with `defaultValue`. It shows the value and its wheels on the clock of `locale`, EnvUIProvider's or else the browser's, and `formatOptions` sets how the field shows it, as `Intl.DateTimeFormat` options, by default the short time style. `label`, `description` and `error` work as on TextField. `clearable` adds a clear button to the field and the popup, named by `clearLabel`, and `nowLabel` names the popup's shortcut to the current time. The popup stays open as its wheels turn.

#### Available times

`min` and `max`, as `HH:mm`, are the earliest and latest times. `minuteStep` is the minutes between the times the list offers, from 1 to 60, 15 by default.

#### In a form

```tsx
<form onSubmit={submit}>
  <TimePicker label="From" name="from" defaultValue="09:00" required />
  <TimePicker label="To" name="to" defaultValue="17:00" required error={error} />
  <Button type="submit">Save shift</Button>
</form>
```

`name` submits the time as `HH:mm`, without a date or a zone, so two times compare as text; a form reset restores `defaultValue`, and `required` keeps an empty field's form from submitting and focuses it. Use `readOnly`, not `disabled`, to show a time people can't change. For one moment, a day and a time, use a single DatePicker with `granularity="minute"`.

#### Variants and sizes

`variant` is `outline`, the default, or `floating`, 3.5 rem tall with room for its label. `size` is `sm`, `md` or `lg`; without it, the field takes its container's control height. `showLabel={false}` hides the label, with a `placeholder` while the field is empty.

### Composition

TimePicker shares DatePicker's field and its picker card, `env-picker-popup` with `env-date-picker-popup` and `env-time-picker-popup`: the wheels in its body, `env-picker-popup-body`, and Now and Clear in its footer, `env-picker-popup-footer` with `env-date-picker-actions`. The wheels are for hours, minutes and, on a 12-hour clock, the day period, each row an `env-time-list-row`, the chosen one with `data-centred`. `className` and `style` reach the root, and `ref` the field's button.

### Customize

Its popup is frosted, as every popup is: `--env-popup-opacity`, `--env-popup-blur` and `--env-popup-shadow`, set on a theme, change it, as [Popover](popover.md#customize) describes.

## Changelog

- **1.0.0-prerelease.5**: The popup is frosted: the popup's color lets a little of what is behind through, blurred, with a soft shadow and no outline edge, and is solid with its edge at high contrast and with reduced transparency.
- **1.0.0**: TimePicker, for a time of day chosen on wheels of hours, minutes and day periods on the locale's clock, with `minuteStep`, `min` and `max`.
