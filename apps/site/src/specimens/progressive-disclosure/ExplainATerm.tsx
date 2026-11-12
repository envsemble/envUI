import ExplainATerm from '../../examples/progressive-disclosure/ExplainATerm';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const help = '[aria-label="About billable hours"]';
const popover = '.env-popover';

/*
 * The pointer presses the help button: the popover shows the definition and its link, a while to
 * read it, and Escape closes it.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: help, x: 0.5, y: 2.5 },
  { to: help, x: 0.5, y: 0.55, duration: 450 },
  { wait: 180 },
  { click: true },
  { wait: 240 },
  { to: popover, x: 0.6, y: 0.45, duration: 500 },
  { wait: 1560 },
  { key: 'Escape', on: popover },
  { wait: 240 },
  { leave: true },
  { wait: 540 },
];

function Explaining() {
  usePointer(script);
  return (
    // The figure at the top, with room below it for the popover, and the figure and the popover
    // that opens to its end centred together where the stage is wide enough, so the popover and
    // its shadow stay clear of the stage's edge.
    <div
      style={{
        display: 'grid',
        alignContent: 'start',
        justifyItems: 'center',
        inlineSize: '100%',
        minBlockSize: '15rem',
        paddingInlineEnd: 'clamp(0rem, 100% - 26rem, 18rem)',
        boxSizing: 'border-box',
      }}
    >
      <ExplainATerm />
    </div>
  );
}

/** A term's definition in a popover, opened by a pointer no one sees and closed again. */
export default function ExplainATermMotion() {
  return (
    <MotionStage label="the explanation of a term opening">
      <Explaining />
    </MotionStage>
  );
}
