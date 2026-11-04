import { CalendarHeatmap, type CalendarHeatmapDay } from '@envsemble/envui';

const data: CalendarHeatmapDay[] = Array.from({ length: 182 }, (_, index) => ({
  date: new Date(Date.UTC(2025, 9, 6) + index * 86_400_000).toISOString().slice(0, 10),
  value: Math.round((Math.sin(index / 4) + 1) * 3),
}));

export default function ScrollingWeeks() {
  return <CalendarHeatmap aria-label="Deployments in six months" data={data} tone="success" />;
}
