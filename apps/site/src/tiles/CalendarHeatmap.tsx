import { CalendarHeatmap, type CalendarHeatmapDay } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import { useHeldView, usePointer, type PointerStep } from '../motion/Motion';
import { narrowGallery } from './Tiles';

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

/**
 * A calendar heatmap of nine weeks of edits; in a phone's tile eight, so it is drawn larger. Its
 * stage shows it from its months down past the days it hovers, the weekend's rows fading out at
 * its foot.
 */
export default function CalendarHeatmapTile() {
  const narrow = useMedia(narrowGallery);
  // Framed from its months down to the days it hovers, it holds that view as their tooltips open.
  useHeldView();
  usePointer(script);
  return (
    <CalendarHeatmap
      aria-label={narrow ? 'Edits in eight weeks' : 'Edits in nine weeks'}
      data={narrow ? data.slice(0, 56) : data}
      levels={4}
      weekStart={1}
      formatValue={edits}
      formatDate={dayOf}
    />
  );
}
