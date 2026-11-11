import { useLayoutEffect, useRef, useState } from 'react';
import { CalendarHeatmap, type CalendarHeatmapDay } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import { useHeldView } from '../motion/Playback';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import { narrowGallery } from './Tiles';
import { remeasure } from '../shared/Remeasure';

/** Nine weeks of edits from Monday 2 February 2026, busier in waves. */
const data: CalendarHeatmapDay[] = Array.from({ length: 63 }, (_, index) => ({
  date: new Date(Date.UTC(2026, 1, 2) + index * 86_400_000).toISOString().slice(0, 10),
  value: Math.round((Math.sin(index / 4) + 1) * 3),
}));

const day = (date: string) => `.env-calendar-heatmap-day[data-date="${date}"]`;

/*
 * Hovers a day, which shows its edits, then moves along the week and down the next; each day's
 * tooltip opens at once.
 */
const script: PointerStep[] = [
  { wait: 180 },
  { to: day('2026-02-25') },
  { wait: 600 },
  { to: day('2026-03-04'), duration: 350 },
  { wait: 420 },
  { to: day('2026-03-11'), duration: 350 },
  { wait: 420 },
  { to: day('2026-03-13'), duration: 400 },
  { wait: 540 },
  { leave: true },
  { wait: 360 },
];

const edits = (value: number) => `${value} ${value === 1 ? 'edit' : 'edits'}`;
const days = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
/** A day as its month and date, such as Mar 4, so its tooltip stays short. */
const dayOf = (date: string) => days.format(new Date(`${date}T00:00:00Z`));

/**
 * A calendar heatmap of nine weeks of edits, or eight in a phone's tile, so it is drawn larger. Its
 * stage shows it from the months down to Saturday's row, cropped there on a whole row rather than
 * fading out partway through Sunday's. A phone's lower stage shows it down to Friday's row, the
 * working week, so it keeps the inset from the stage's bottom that every tile keeps. The crop's
 * height is read from that row, so it follows the days' size, which grows on a touch screen.
 */
export default function CalendarHeatmapTile() {
  const narrow = useMedia(narrowGallery);
  const crop = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>();
  // Framed from its months down to the days it hovers, it holds that view while their tooltips
  // open.
  useHeldView();
  usePointer(script);
  useLayoutEffect(() => {
    const element = crop.current;
    const last = element?.querySelector(`tbody tr:nth-child(${narrow ? 5 : 6})`);
    if (!element || !last) return;
    const measure = () => {
      const box = element.getBoundingClientRect();
      const scale = box.width / element.offsetWidth || 1;
      setHeight(Math.ceil((last.getBoundingClientRect().bottom - box.top) / scale) + 1);
    };
    return remeasure(measure, { first: 'now', resize: [last] }).stop;
  }, [narrow]);
  return (
    <div ref={crop} style={{ blockSize: height, overflow: 'hidden' }}>
      <CalendarHeatmap
        aria-label={narrow ? 'Edits in eight weeks' : 'Edits in nine weeks'}
        data={narrow ? data.slice(0, 56) : data}
        levels={4}
        weekStart={1}
        formatValue={edits}
        formatDate={dayOf}
      />
    </div>
  );
}
