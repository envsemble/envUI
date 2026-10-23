import { CalendarHeatmap, type CalendarHeatmapDay } from '@envsemble/envui';

const data: CalendarHeatmapDay[] = Array.from({ length: 70 }, (_, index) => ({
  date: new Date(Date.UTC(2026, 0, 19) + index * 86_400_000).toISOString().slice(0, 10),
  value: Math.round((Math.sin(index / 4) + 1) * 3),
}));

export default function IncidentsInSuccess() {
  return <CalendarHeatmap aria-label="Incidents in ten weeks" data={data} tone="success" />;
}
