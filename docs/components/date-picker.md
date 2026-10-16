# DatePicker

## DatePicker

```tsx
import { DatePicker } from '@envsemble/envui';

<DatePicker
  label="Publish on"
  name="publish"
  value={publishOn}
  onValueChange={setPublishOn}
  clearable
/>

<DatePicker
  label="Meeting"
  name="meeting"
  withTime
  defaultTime="09:00"
  min="2026-10-01"
  value={meeting}
  onValueChange={setMeeting}
/>

<DatePicker density="compact" aria-label="Due" placeholder="Due" withTime clearable />;
```

### Props & contracts

| Name                              | Contract                                                                                                             |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| value / defaultValue              | A day as YYYY-MM-DD, or with withTime a local date and time as YYYY-MM-DDTHH:mm; null or an empty string for none    |
| onValueChange                     | Receives the new value, or null once the field is cleared                                                            |
| withTime                          | Choose a time as well, in the calendar below the days                                                                |
| min / max                         | The earliest and latest value, as YYYY-MM-DD or YYYY-MM-DDTHH:mm; days outside are unavailable                       |
| defaultTime                       | The time a newly chosen day starts with, as HH:mm; 00:00 by default                                                  |
| locale                            | The locale of the shown value and the calendar's names and numbers; the browser's by default                         |
| formatOptions                     | Intl.DateTimeFormat options for the shown value; the medium date style, and the short time style with withTime       |
| aria-label / aria-labelledby      | Name a field without a label; aria-labelledby also takes the place of a label                                        |
| weekStart                         | The calendar's first day of the week, 0 for Sunday to 6 for Saturday; the locale's by default                        |
| label / hint / error              | Floating label, guidance and validation like TextField; hint and error are linked to the field                       |
| density / showLabel               | standard (default) or compact, 2 rem; the label shows inside the field unless the field is compact                   |
| placeholder                       | Shown while the field is empty and its label floats or is hidden, or the field has no label                          |
| clearable                         | A clear button in the field and in the calendar removes the value                                                    |
| open / defaultOpen / onOpenChange | Optional control of the calendar                                                                                     |
| Labels                            | clearLabel, todayLabel, nowLabel, doneLabel, timeLabel, previousMonthLabel and nextMonthLabel, in English by default |
| Native participation              | name, form, required, disabled and readOnly; a form reset restores an uncontrolled field's defaultValue              |
| Native button props               | ref and other attributes of the field's button                                                                       |

## Calendar

```tsx
import { Calendar } from '@envsemble/envui';

<Calendar
  aria-label="Planning"
  value={day}
  onValueChange={setDay}
  min="2026-01-01"
  max="2026-12-31"
  locale="en-GB"
/>;
```

### Props & contracts

| Name                                | Contract                                                                                         |
| ----------------------------------- | ------------------------------------------------------------------------------------------------ |
| value / defaultValue                | The chosen day as YYYY-MM-DD, or null                                                            |
| onValueChange                       | Receives the chosen day as YYYY-MM-DD                                                            |
| min / max                           | The earliest and latest day that can be chosen; the month buttons stop at them                   |
| weekStart                           | 0 for Sunday to 6 for Saturday; by default the locale's, or Monday where the browser cannot tell |
| locale                              | The locale of the month and weekday names and the day numbers; the browser's by default          |
| previousMonthLabel / nextMonthLabel | Accessible names of the month buttons; Previous month and Next month by default                  |
| aria-label / aria-labelledby        | Name the calendar, which is then a group around the month's grid                                 |
| Native div props                    | className, ref and other attributes of the calendar's root                                       |

## Guidelines

- Use a date field for a day, or with withTime a day and time, such as when something is due or a meeting starts. Values are local dates and times without a zone; converting them to and from a moment in time belongs to the application.
- The field shows the value in the reader's locale, such as 20 Oct 2026 or Oct 20, 2026, 9:30 AM. Pressing it, its label or its calendar icon opens the calendar on the Popover surface, as does <kbd>↓</kbd>; pressing the field or its label again closes it. With clearable, the clear button and <kbd>Backspace</kbd> or <kbd>Delete</kbd> on the field remove the value.
- The calendar follows the WAI-ARIA date picker: focus moves to the chosen day, or today, as it opens. <kbd>←</kbd> and <kbd>→</kbd> move by a day, <kbd>↑</kbd> and <kbd>↓</kbd> by a week, <kbd>Page Up</kbd> and <kbd>Page Down</kbd> by a month and with <kbd>Shift</kbd> by a year, <kbd>Home</kbd> and <kbd>End</kbd> to the start and end of the week, and <kbd>Enter</kbd> or <kbd>Space</kbd> chooses the day. <kbd>Esc</kbd> closes the calendar and returns focus to the field. A field in right-to-left text opens a calendar that runs right to left, where <kbd>←</kbd> and <kbd>→</kbd> follow the reading direction.
- Choosing a day closes a date field's calendar. With withTime it stays open: below the days a time field sets the hours and minutes, Now chooses the current date and time, and Done closes it. Today or Now, and Clear when clearable, sit in the calendar's footer; values outside min and max are kept within them.
- Days are round marks, each named by its full date. Today has a ring and the chosen day a solid fill, blue with white text in the light theme and light blue with dark text in the dark theme, with their own color roles and at least 3:1 against the surface; unavailable days are faded. The calendar keeps six weeks, so its size stays the same from month to month, and empty cells before and after the month keep each day under its weekday, also for assistive technology.
- The calendar is Gregorian. Its month and weekday names and day numbers come from the locale, also from one with a calendar of its own, such as Persian, which then names the Gregorian months.
- The calendar is as wide as seven days, 2.5 rem each and 2.25 rem in a compact field's popup; on touch screens days are 2.75 rem, and the calendar fits a phone's width.
- The field is the shared text field, with TextField's label, guidance, invalid and disabled states, compact height and touch sizes. Read-only fields show the value and cannot open the calendar; like read-only inputs they are not validated, so an empty required one never keeps its form from submitting.
- Native forms submit the value under name, and a form reset restores an uncontrolled field's defaultValue. required asks for a value, and an empty field takes focus when the form is submitted. Validation stays with the application.
- Use Calendar on its own to choose a day within a page or panel, such as a planning view; it has the same keyboard and appearance. Name it with aria-label or aria-labelledby: it is then a group around the month's grid, so calendars showing the same month stay apart.
- Rendered on a server, a field or calendar without locale writes British English, and a calendar without a value leaves its days empty and its month buttons available, as only the reader's clock knows today and so the month that min and max limit. Once the page hydrates, they show the reader's language, week and today, without a mismatch error. Pass locale, such as the language the server chose for the request, and weekStart for server output in the reader's language.

TypeScript declarations provide the complete public API.

## Related topics

- [TextField](../components/text-field.md)
- [Popover](../components/popover.md)
- [Combobox](../components/combobox.md)
- [CalendarHeatmap](../components/calendar-heatmap.md)
- [Accessibility](../foundations/accessibility.md)
