import OverflowActions from '../../examples/progressive-disclosure/OverflowActions';
import type { PointerStep } from '../../motion/PointerPlan';
import { usePointer } from '../../motion/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';

const more = '[aria-label="More actions"]';
const item = (index: number) => `.env-menu-item:nth-child(${index} of .env-menu-item)`;

/*
 * The pointer opens More actions, rests on its items one by one, and closes the menu with Escape,
 * choosing nothing.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: more, x: 0.5, y: 2.5 },
  { to: more, x: 0.5, y: 0.55, duration: 450 },
  { wait: 300 },
  { click: true },
  { wait: 700 },
  { to: item(1), x: 0.4, duration: 450 },
  { wait: 500 },
  { to: item(2), x: 0.4, duration: 250 },
  { wait: 500 },
  { to: item(3), x: 0.4, duration: 250 },
  { wait: 500 },
  { to: item(4), x: 0.4, duration: 300 },
  { wait: 600 },
  { key: 'Escape', on: item(4) },
  { wait: 300 },
  { leave: true },
  { wait: 900 },
];

function Opening() {
  usePointer(script);
  return (
    // The heading at the top, with room below it for the menu.
    <div
      style={{
        display: 'grid',
        alignContent: 'start',
        justifyItems: 'center',
        inlineSize: '100%',
        minBlockSize: '16rem',
      }}
    >
      <OverflowActions />
    </div>
  );
}

/** The document's actions: two in view, the rest in More actions, opened by a pointer no one sees. */
export default function OverflowActionsMotion() {
  return (
    <MotionStage label="the more actions menu opening">
      <Opening />
    </MotionStage>
  );
}
