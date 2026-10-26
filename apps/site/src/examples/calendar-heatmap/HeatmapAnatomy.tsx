import { CalendarHeatmap, type CalendarHeatmapDay } from '@envsemble/envui';

const data: CalendarHeatmapDay[] = Array.from({ length: 63 }, (_, index) => ({
  date: new Date(Date.UTC(2026, 1, 2) + index * 86_400_000).toISOString().slice(0, 10),
  value: Math.round((Math.sin(index / 4) + 1) * 3),
}));

export default function HeatmapAnatomy() {
  return <CalendarHeatmap aria-label="Edits in nine weeks" data={data} levels={4} weekStart={1} />;
}
