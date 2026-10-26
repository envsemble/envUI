import { CalendarHeatmap, type CalendarHeatmapDay } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../previews/Motion';

/** Nine weeks of edits from Monday 2 February 2026, busier in waves. */
const data: CalendarHeatmapDay[] = Array.from({ length: 63 }, (_, index) => ({
  date: new Date(Date.UTC(2026, 1, 2) + index * 86_400_000).toISOString().slice(0, 10),
  value: Math.round((Math.sin(index / 4) + 1) * 3),
}));

const day = (date: string) => `.env-calendar-heatmap-day[data-date="${date}"]`;

/* A day hovered shows its edits; along the week and down the next, each day's at once. */
const script: PointerStep[] = [
  { wait: 300 },
  { to: day('2026-02-25') },
  { wait: 1000 },
  { to: day('2026-03-04'), duration: 350 },
  { wait: 700 },
  { to: day('2026-03-11'), duration: 350 },
  { wait: 700 },
  { to: day('2026-03-13'), duration: 400 },
  { wait: 900 },
  { leave: true },
  { wait: 600 },
];

const edits = (value: number) => `${value} ${value === 1 ? 'edit' : 'edits'}`;
const days = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
/** A day as its month and date, such as Mar 4, so its tooltip stays short. */
const dayOf = (date: string) => days.format(new Date(`${date}T00:00:00Z`));

/** A calendar heatmap of nine weeks of edits. */
export default function CalendarHeatmapTile() {
  usePointer(script);
  return (
    <CalendarHeatmap
      aria-label="Edits in nine weeks"
      data={data}
      levels={4}
      weekStart={1}
      formatValue={edits}
      formatDate={dayOf}
    />
  );
}
