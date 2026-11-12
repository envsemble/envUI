import { useState } from 'react';
import FilterPanel from '../../examples/filtering/FilterPanel';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { Renew } from '../../motion/Renew';

const filters = '.env-button[aria-haspopup]';
const plans = '.env-popover .env-checkbox:nth-child(2 of .env-checkbox)';

/*
 * The pointer opens Filters and ticks Plans: the button's count reads 2 and the plans join the
 * reports behind the popover at once. It closes the popover, and the list starts anew.
 */
const script: PointerStep[] = [
  { wait: 240 },
  { to: filters, x: 0.5, y: 2.4 },
  { to: filters, x: 0.5, y: 0.55, duration: 450 },
  { wait: 120 },
  { click: true },
  { wait: 390 },
  { to: plans, x: 0.12, y: 0.5, duration: 500 },
  { wait: 150 },
  { click: true },
  { wait: 780 },
  { to: filters, x: 0.5, y: 0.55, duration: 600 },
  { wait: 120 },
  { click: true },
  { wait: 780 },
  { leave: true },
  { cue: 'renew' },
  { wait: 420 },
];

function Filtering() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    // As tall as the open popover, so the figure keeps its height as it opens and the list grows.
    <div
      style={{ display: 'grid', alignContent: 'start', inlineSize: '100%', minBlockSize: '27rem' }}
    >
      <Renew round={round}>
        <div style={{ inlineSize: '100%' }}>
          <FilterPanel />
        </div>
      </Renew>
    </div>
  );
}

/** Documents filtered in a popover by a pointer no one sees: the list behind it follows at once. */
export default function FilterPanelMotion() {
  return (
    <MotionStage label="the documents filtered in a popover">
      <Filtering />
    </MotionStage>
  );
}
