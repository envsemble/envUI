# Heatmap

## React usage

```tsx
import { Heatmap } from '@envsemble/envui';

<Heatmap
  aria-label="Deployments in the last year"
  data={deployments.map(({ day, count }) => ({
    date: day,
    value: count,
    label: `${count} ${count === 1 ? 'deployment' : 'deployments'}`,
  }))}
  startDate="2025-10-11"
  endDate="2026-10-10"
  tone="success"
/>;

<Heatmap
  aria-labelledby="activity-heading"
  data={activity}
  weekStart={1}
  formatValue={(value) => value.toLocaleString(locale)}
  formatDate={(date) => dateFormatter.format(new Date(`${date}T12:00`))}
  monthLabels={monthNames}
  weekdayLabels={weekdayNames}
  lessLabel={lessText}
  moreLabel={moreText}
/>;
```

### Color by rank

`thresholds` sets where each color step starts, instead of steps of the same size up to the largest value. Quantiles of the data make every step hold about the same number of active days, so a few busy days do not leave the rest pale.

```tsx
const active = activity
  .map((day) => day.value)
  .filter((value) => value > 0)
  .sort((first, second) => first - second);
const quantile = (share: number) => active[Math.floor(share * (active.length - 1))] ?? 1;

<Heatmap
  aria-label="Activity by rank"
  data={activity}
  thresholds={[quantile(0), quantile(0.25), quantile(0.5), quantile(0.75)]}
/>;
```

### Props & contracts

| Name                         | Contract                                                                                                                                                 |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| aria-label / aria-labelledby | Required name of the grid of days                                                                                                                        |
| data                         | `{ date, value, label? }` per day, with the date as YYYY-MM-DD; days without an entry count as 0                                                         |
| label                        | A day's value in words, such as 4 deployments; replaces formatValue's text for that day                                                                  |
| startDate / endDate          | The first and last day shown, as YYYY-MM-DD; the range covered by data by default                                                                        |
| levels                       | Color steps including the empty step, 2 to 10; 5 by default                                                                                              |
| maxValue                     | The value that takes the strongest color; the largest value shown by default                                                                             |
| weekStart                    | 0 starts each week column on Sunday (default), 1 on Monday                                                                                               |
| tone                         | accent (default), success, warning, danger, done or neutral: the tone the colors are mixed from                                                          |
| thresholds                   | The lowest value of each step above the empty one, up to nine, such as quantiles; replaces levels and maxValue, and a day below the first shows as empty |
| formatValue / formatDate     | Text for values and dates in each day's name and the default tooltip; English by default                                                                 |
| formatTooltip                | Tooltip content from `{ date, value, label, level }`; the day's name by default                                                                          |
| monthLabels / weekdayLabels  | Twelve month names from January and seven weekday names from Sunday; English abbreviations by default                                                    |
| lessLabel / moreLabel        | Legend text around the color steps; Less and More by default                                                                                             |
| Native div props             | className, style, ref and other attributes on the heatmap                                                                                                |

## Guidelines

- Use a heatmap for a count per day over weeks or months, such as activity or deployments, where the pattern matters more than each number. Use a Table or Stats for exact figures.
- Weeks are columns and weekdays rows, with month names above the weeks and every other weekday name beside the rows. A month shorter than two weeks at the edge of the range leaves its name out, so names never overlap.
- Each step mixes the tone into the canvas: higher values stand out more in both themes, and the strongest step is the tone itself. Empty days use the translucent fill. The legend shows the steps from Less to More. By default the steps are equal parts of the range up to maxValue; when a few large values would leave most days pale, set thresholds from quantiles of the data to color by rank.
- Every day is a grid cell named with its date and value, such as Tue 3 Mar 2026: 4 deployments. The grid is one tab stop: <kbd>↑</kbd> and <kbd>↓</kbd> move by day, <kbd>←</kbd> and <kbd>→</kbd> by week, and <kbd>Home</kbd> and <kbd>End</kbd> reach the first and the most recent day. In right-to-left text the weeks run from the right and the arrow keys follow.
- One tooltip shows the hovered or focused day: at once on focus and on a tap, after a short delay on hover, then from day to day without waiting. <kbd>Esc</kbd> hides it, and so do leaving the days with the pointer and, for a focused day, moving the pointer elsewhere. Like every tooltip it never takes the pointer, so it never blocks a press on what lies under it. It leaves nothing in the document at rest, so a year renders and updates quickly.
- Narrow containers scroll the weeks inside the heatmap, starting at the most recent weeks; keyboard focus scrolls its day into view. On touch screens the days grow to 1 rem.
- Localize with monthLabels, weekdayLabels, formatDate, formatValue and the legend labels; the defaults are English. Dates are calendar days, independent of time zones.

TypeScript declarations provide the complete public API.

## Related topics

- [Stats](../components/stats.md)
- [Tooltips](../components/tooltip.md)
- [Colors & themes](../foundations/colors.md)
- [Accessibility](../foundations/accessibility.md)
