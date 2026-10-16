import { CalendarHeatmap, type CalendarHeatmapDay } from '@envsemble/envui';

const locale = 'de-DE';
// Names from Intl for the locale, starting from January and from Sunday as the heatmap expects.
const months = Array.from({ length: 12 }, (_, month) =>
  new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' }).format(
    new Date(Date.UTC(2026, month, 1)),
  ),
);
const weekdays = Array.from({ length: 7 }, (_, day) =>
  new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' }).format(
    new Date(Date.UTC(2026, 1, 1 + day)),
  ),
);
const dates = new Intl.DateTimeFormat(locale, { dateStyle: 'full', timeZone: 'UTC' });
const numbers = new Intl.NumberFormat(locale);

const data: CalendarHeatmapDay[] = Array.from({ length: 84 }, (_, index) => ({
  date: new Date(Date.UTC(2026, 0, 5) + index * 86_400_000).toISOString().slice(0, 10),
  value: (index * 7) % 11,
}));

export default function Localized() {
  return (
    <CalendarHeatmap
      aria-label="Aktivität im ersten Quartal"
      data={data}
      tone="done"
      weekStart={1}
      levels={4}
      monthLabels={months}
      weekdayLabels={weekdays}
      formatDate={(date) => dates.format(new Date(`${date}T00:00:00Z`))}
      formatValue={(value) => `${numbers.format(value)} Änderungen`}
      lessLabel="Weniger"
      moreLabel="Mehr"
    />
  );
}
