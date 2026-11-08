import NoResults from '../../examples/empty-states/NoResults';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage, roomFor } from '../../motion/MotionStage';

const search = 'input[type="search"]';

/*
 * Nothing matches "roadmap": the pointer presses Clear filters, and the projects come back. It
 * types "roadmap" into the search again, and the list empties into No matching projects.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: '.env-button', x: 0.5, y: 2 },
  { to: '.env-button', x: 0.5, y: 0.6, duration: 450 },
  { wait: 350 },
  { click: true },
  { wait: 1400 },
  { to: search, x: 0.4, y: 0.5, duration: 600 },
  { wait: 200 },
  { click: true },
  { type: 'roadmap', into: search, every: 110 },
  { wait: 900 },
  { leave: true },
  { wait: 600 },
];

function Searching() {
  usePointer(script);
  return (
    // As tall as the whole list, so the toolbar keeps its place as the list empties.
    <div
      style={{
        display: 'grid',
        alignContent: 'start',
        inlineSize: '100%',
        minBlockSize: roomFor(26, 28.5, 25.5),
      }}
    >
      <NoResults />
    </div>
  );
}

/** A search that matches nothing, cleared and typed again by a pointer no one sees. */
export default function NoResultsMotion() {
  return (
    <MotionStage label="the filters cleared and the search typed again">
      <Searching />
    </MotionStage>
  );
}
