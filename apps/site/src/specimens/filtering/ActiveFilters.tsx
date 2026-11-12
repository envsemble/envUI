import ActiveFilters from '../../examples/filtering/ActiveFilters';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const token = '[aria-label="Remove filter Assignee: Sam Lee"]';
const add = '.env-button[aria-haspopup="menu"]';
const samLee = '.env-menu-item:nth-child(1 of .env-menu-item)';

/*
 * The pointer removes "Assignee: Sam Lee" with its cross: the open tasks of everyone show, and the
 * count follows. Then it adds the filter back through Add filter, and the list narrows again.
 */
const script: PointerStep[] = [
  { wait: 240 },
  { to: token, x: 0.88, y: 2.6 },
  { to: token, x: 0.88, y: 0.5, duration: 450 },
  { wait: 150 },
  { click: true },
  { wait: 840 },
  { to: add, x: 0.5, y: 0.55, duration: 500 },
  { wait: 120 },
  { click: true },
  { wait: 300 },
  { to: samLee, x: 0.35, y: 0.5, duration: 400 },
  { wait: 150 },
  { click: true },
  { wait: 780 },
  { leave: true },
  { wait: 240 },
];

function Removing() {
  usePointer(script);
  return (
    // As tall as the longer list, so the figure keeps its height as the filter goes and comes back.
    <div
      style={{
        display: 'grid',
        alignContent: 'start',
        inlineSize: '100%',
        minBlockSize: '21.5rem',
      }}
    >
      <ActiveFilters />
    </div>
  );
}

/** A filter removed by its token and added back by a pointer no one sees. */
export default function ActiveFiltersMotion() {
  return (
    <MotionStage label="a filter removed and added back">
      <Removing />
    </MotionStage>
  );
}
