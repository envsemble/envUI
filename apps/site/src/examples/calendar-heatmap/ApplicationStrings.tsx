import { CalendarHeatmap, EnvUIProvider, type CalendarHeatmapDay } from '@envsemble/envui';

const data: CalendarHeatmapDay[] = Array.from({ length: 84 }, (_, index) => ({
  date: new Date(Date.UTC(2026, 0, 5) + index * 86_400_000).toISOString().slice(0, 10),
  value: (index * 7) % 11,
}));

// The legend in the application's own words, in the page's language; the month and weekday names,
// dates and numbers follow the locale the provider inherits from the page.
const messages = { calendarHeatmap: { less: 'Quieter', more: 'Busier' } };

export default function ApplicationStrings() {
  return (
    <EnvUIProvider messages={messages}>
      <CalendarHeatmap
        aria-label="Activity in the first quarter"
        data={data}
        tone="done"
        weekStart={1}
        levels={4}
        formatValue={(value) => `${value} ${value === 1 ? 'change' : 'changes'}`}
      />
    </EnvUIProvider>
  );
}
