import { CalendarHeatmap, type CalendarHeatmapDay } from '@envsemble/envui';

const data: CalendarHeatmapDay[] = Array.from({ length: 70 }, (_, index) => ({
  date: new Date(Date.UTC(2026, 0, 19) + index * 86_400_000).toISOString().slice(0, 10),
  value: Math.round((Math.sin(index / 4) + 1) * 3),
}));
const dates = new Intl.DateTimeFormat('en-GB', { dateStyle: 'long', timeZone: 'UTC' });
const reviews = (value: number) => `${value} ${value === 1 ? 'review' : 'reviews'}`;

export default function CustomTooltip() {
  return (
    <CalendarHeatmap
      aria-label="Reviews in ten weeks"
      data={data}
      tone="warning"
      formatValue={reviews}
      renderTooltip={({ date, value }) => (
        // The tooltip's own text color and type; the day's accessible name stays date and value.
        <>
          <strong>{reviews(value)}</strong>
          <br />
          {dates.format(new Date(`${date}T00:00:00Z`))}
        </>
      )}
    />
  );
}
