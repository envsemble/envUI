import { CalendarHeatmap, EnvUIProvider, type CalendarHeatmapDay } from '@envsemble/envui';

const data: CalendarHeatmapDay[] = Array.from({ length: 84 }, (_, index) => ({
  date: new Date(Date.UTC(2026, 0, 5) + index * 86_400_000).toISOString().slice(0, 10),
  value: (index * 7) % 11,
}));

// The legend in German; the month and weekday names, dates and numbers follow the locale.
const messages = { calendarHeatmap: { less: 'Weniger', more: 'Mehr' } };

export default function Localized() {
  return (
    <EnvUIProvider locale="de-DE" messages={messages}>
      <CalendarHeatmap
        aria-label="Aktivität im ersten Quartal"
        data={data}
        tone="done"
        weekStart={1}
        levels={4}
        formatValue={(value) => `${value.toLocaleString('de-DE')} Änderungen`}
      />
    </EnvUIProvider>
  );
}
