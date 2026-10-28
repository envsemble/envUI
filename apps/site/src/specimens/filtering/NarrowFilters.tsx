import { useState } from 'react';
import NarrowFilters from '../../examples/filtering/NarrowFilters';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';
import { WidthSweep } from '../../motion/WidthSweep';

const filters = '.catalogue-width-sweep-frame .env-button[data-variant="secondary"]';
const show = '.env-sheet-popup .env-button[data-variant="primary"]';

/*
 * At 24 rem the filters are folded into a Filters button beside the search: the pointer opens
 * the sheet and closes it with Show 5 projects. Then the frame widens to 44 rem, where the
 * filters sit in the toolbar, and narrows again.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: filters, x: 0.5, y: 2.4 },
  { to: filters, x: 0.5, y: 0.55, duration: 450 },
  { wait: 200 },
  { click: true },
  { wait: 1700 },
  { to: show, x: 0.5, y: 0.55, duration: 600 },
  { wait: 250 },
  { click: true },
  { wait: 500 },
  { leave: true },
  { wait: 300 },
  { cue: 'wide' },
  // The frame's travel and its hold at 44 rem, then the way back and a moment at 24 rem.
  { wait: 5300 },
  { cue: 'narrow' },
  { wait: 4300 },
];

function Sweeping() {
  const [at, setAt] = useState(0);
  usePointer(script, { onCue: (cue) => setAt(cue === 'wide' ? 1 : 0) });
  return (
    <WidthSweep widths={[24, 44]} at={at} classes>
      <NarrowFilters />
    </WidthSweep>
  );
}

/** The toolbar folding its filters into a sheet in a narrow frame, which a pointer opens. */
export default function NarrowFiltersMotion() {
  return (
    <MotionStage label="the filters folding into a sheet as the width changes" height="34rem">
      <Sweeping />
    </MotionStage>
  );
}
