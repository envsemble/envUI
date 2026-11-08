import NavigationForms from '../../examples/scaffold/NavigationForms';
import type { PointerStep } from '../../motion/PointerPlan';
import { usePointer } from '../../motion/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';

/*
 * The pointer turns the wheel over the body: the list scrolls under the top bar and beside the
 * navigation, which stay where they are, and back to its start. The pointer rests on the body
 * itself, not on a row, so it stays over the list as the rows move under it, and turns the wheel a
 * few rows' worth: the list is not much longer than the screen.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: '.env-scaffold-body', x: 0.6, y: 0.45 },
  { wait: 400 },
  { wheel: 150, duration: 1600 },
  { wait: 1200 },
  { wheel: -150, duration: 1600 },
  { wait: 600 },
  { leave: true },
  { wait: 700 },
];

function Scrolling() {
  usePointer(script);
  // The Scaffold fills the stage's width, as it fills a window.
  return (
    <div style={{ justifySelf: 'stretch' }}>
      <NavigationForms />
    </div>
  );
}

/** The overview's Scaffold, its body scrolled by a pointer no one sees under bars that stay. */
export default function NavigationFormsMotion() {
  return (
    <MotionStage label="the body scrolling under the bars" stage="shaded">
      <Scrolling />
    </MotionStage>
  );
}
