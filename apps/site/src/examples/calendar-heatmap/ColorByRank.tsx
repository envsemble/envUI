import { CalendarHeatmap, type CalendarHeatmapDay } from '@envsemble/envui';

/** Stands in for sixteen weeks of edits: a few very busy days among quiet ones. */
const data: CalendarHeatmapDay[] = Array.from({ length: 112 }, (_, index) => {
  const time = Date.UTC(2025, 11, 10) + index * 86_400_000;
  const busy = index % 17 === 3 ? 40 : 0;
  return {
    date: new Date(time).toISOString().slice(0, 10),
    value: Math.max(0, Math.round(Math.sin(index / 5) * 4 + 3)) + busy,
  };
});

// Quantiles of the active days make each color step hold about as many days.
const active = data
  .map((day) => day.value)
  .filter((value) => value > 0)
  .sort((first, second) => first - second);
const quantile = (share: number) => active[Math.floor(share * (active.length - 1))] ?? 1;

export default function ColorByRank() {
  return (
    <CalendarHeatmap
      aria-label="Edits by rank"
      data={data}
      thresholds={[quantile(0), quantile(0.25), quantile(0.5), quantile(0.75)]}
    />
  );
}
