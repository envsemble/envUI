# Relative time

## React usage

```tsx
import { RelativeTime, Text } from '@envsemble/envui';

<Text>
  Updated <RelativeTime value={report.updatedAt} />
</Text>

<RelativeTime value={review.dueAt} format="short" locale="en-GB" />
```

### Props & contracts

| Name              | Contract                                                                                                                                       |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| value             | The moment: a Date, milliseconds since 1970 or a date string such as an ISO 8601 timestamp; an invalid moment renders nothing                  |
| format            | long 3 hours ago (default), short 3 hr. ago or narrow 3h ago                                                                                   |
| locale            | Language of the text and the tooltip, such as en-GB or de; the browser's language by default                                                   |
| now               | A fixed moment to compare with, for tests and server rendering; the text then stays as it is                                                   |
| nowLabel          | Text for a moment less than 45 seconds away; just now for past moments and now for coming ones in English, the locale's word for now in others |
| tooltip           | The date and time in a Tooltip on hover, such as Oct 14, 2026, 9:41 AM; true by default                                                        |
| Native time props | ref, className, style and accessible attributes; dateTime is always the moment in ISO 8601                                                     |

`formatRelativeTime(value, { now, locale, format, nowLabel })` returns the same text for places that take a string, such as an accessible name. An invalid moment gives an empty string.

## Guidelines

- Use relative time where how long ago or how soon matters more than the exact moment, such as when a report changed or when a review is due. Show the date itself where it must be exact, such as a deadline or a record's date.
- The text rounds to the nearest unit and changes halfway between counts. Less than 45 seconds away is just now, or now for a moment ahead; then minutes below 45, hours below 22, days below a week, weeks below 26 days, months below 11, and years. Counts stay numbers, such as 1 day ago rather than yesterday, since 24 hours ago is not always yesterday by the calendar.
- One shared clock keeps every RelativeTime on the page current. It wakes every second while a moment is less than a minute away, every minute while one is less than a day away and every hour beyond, and reads the time again when a hidden page shows. Only times whose text changed render again. A time with now stays as it is.
- The element is a time element whose dateTime holds the exact moment. The tooltip shows the date and time in the reader's time zone and language on hover; the time is not a tab stop, so keep the relative text meaningful on its own, and set `tooltip={false}` where the exact moment shows nearby.
- On the server the text follows the server's clock and language. Hydration keeps that text without a mismatch error, then shows the browser's own, so a page rendered earlier, or in another language, corrects itself at once. Pass the same now on the server and in the browser for identical output, as tests need.
- Localize with locale: the text and the tooltip come from Intl in that language, and nowLabel replaces the one phrase English needs beyond Intl. The digits are tabular, so a changing count does not move the text beside it. The text keeps its own direction, so English stays in order inside right-to-left text.

TypeScript declarations provide the complete public API.

## Related topics

- [Tooltips](../components/tooltip.md)
- [Animated numbers](../components/animated-number.md)
- [Tables](../components/tables.md)
