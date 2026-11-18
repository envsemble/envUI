import { useLayoutEffect, useRef, useState } from 'react';
import { CalendarHeatmap, type CalendarHeatmapDay } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import { useHeldView } from '../motion/Playback';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import { narrowGallery } from './Tiles';
import { remeasure } from '../shared/Remeasure';

const dayMs = 86_400_000;

const data: CalendarHeatmapDay[] = Array.from({ length: 63 }, (_, index) => ({
  date: new Date(Date.UTC(2026, 1, 2) + index * dayMs).toISOString().slice(0, 10),
  value: Math.round((Math.sin(index / 4) + 1) * 3),
}));

const day = (date: string) => `.env-calendar-heatmap-day[data-date="${date}"]`;

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
const dayOf = (date: string) => days.format(new Date(`${date}T00:00:00Z`));

export default function CalendarHeatmapTile() {
  const narrow = useMedia(narrowGallery);
  const crop = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>();
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
