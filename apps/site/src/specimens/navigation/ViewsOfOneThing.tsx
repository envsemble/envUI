import ViewsOfOneThing from '../../examples/navigation/ViewsOfOneThing';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const tab = (index: number) => `.env-tabs-tab:nth-child(${index} of .env-tabs-tab)`;

/*
 * The pointer switches the project's views, Overview, Tasks and Files: each shows in place under
 * the same header, and Overview again ends the round.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: tab(2), x: 0.5, y: 2.2 },
  { to: tab(2), x: 0.5, y: 0.6, duration: 450 },
  { wait: 250 },
  { click: true },
  { wait: 1500 },
  { to: tab(3), x: 0.5, y: 0.6, duration: 400 },
  { wait: 250 },
  { click: true },
  { wait: 1500 },
  { to: tab(1), x: 0.5, y: 0.6, duration: 550 },
  { wait: 250 },
  { click: true },
  { wait: 600 },
  { leave: true },
  { wait: 900 },
];

function Switching() {
  usePointer(script);
  return (
    // As tall as the project with its longest view, so the header keeps its place as views change.
    <div
      style={{
        display: 'grid',
        alignContent: 'start',
        inlineSize: '100%',
        minBlockSize: '19.6rem',
      }}
    >
      <ViewsOfOneThing />
    </div>
  );
}

/** The views of one project, switched in place by a pointer no one sees. */
export default function ViewsOfOneThingMotion() {
  return (
    <MotionStage label="the project's views switching in place">
      <Switching />
    </MotionStage>
  );
}
