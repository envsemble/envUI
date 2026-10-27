import Sticky from '../../examples/page/Sticky';
import { usePointer, type PointerStep } from '../../previews/Motion';
import { MotionStage } from '../../previews/MotionStage';

/*
 * The pointer comes over the report and turns the wheel: the sections scroll up under the header,
 * which stays at the top. It scrolls back to the start, and leaves.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: '.env-page-content', x: 0.5, y: 0.4 },
  { wait: 400 },
  { wheel: 260, duration: 1600 },
  { wait: 1300 },
  { wheel: -260, duration: 1300 },
  { wait: 500 },
  { leave: true },
  { wait: 800 },
];

function Scrolling() {
  usePointer(script);
  return (
    // As wide as the stage, as the example is on its own.
    <div style={{ inlineSize: '100%' }}>
      <Sticky />
    </div>
  );
}

/** The annual report, scrolled under its sticky header by a pointer no one sees. */
export default function StickyMotion() {
  return (
    <MotionStage label="the content scrolling under the header">
      <Scrolling />
    </MotionStage>
  );
}
