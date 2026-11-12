import { CalendarHeatmap, type CalendarHeatmapDay } from '@envsemble/envui';

/** Stands in for a year of deployment counts: busier midweek, with quiet stretches. */
function deploymentsPerDay(): CalendarHeatmapDay[] {
  const end = Date.UTC(2026, 2, 31);
  return Array.from({ length: 365 }, (_, index) => {
    const time = end - (364 - index) * 86_400_000;
    const weekday = new Date(time).getUTCDay();
    const wave = Math.sin(index / 9) + Math.sin((index * 5) / 23) + 0.6;
    const count = Math.max(0, Math.round(wave * 3 * (weekday === 0 || weekday === 6 ? 0.3 : 1)));
    return {
      date: new Date(time).toISOString().slice(0, 10),
      value: count,
      label: `${count} ${count === 1 ? 'deployment' : 'deployments'}`,
    };
  });
}

const data = deploymentsPerDay();

export default function Deployments() {
  return <CalendarHeatmap aria-label="Deployments in the last year" data={data} tone="success" />;
}
