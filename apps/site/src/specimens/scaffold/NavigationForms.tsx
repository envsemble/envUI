import NavigationForms from '../../examples/scaffold/NavigationForms';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';

/*
 * The pointer turns the wheel over the body: the list scrolls under the top bar and beside the
 * navigation, which stay where they are, and back to its start.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: '.env-list-item:nth-child(2 of .env-list-item)', x: 0.6, y: 0.5 },
  { wait: 400 },
  { wheel: 220, duration: 1300 },
  { wait: 1100 },
  { wheel: -220, duration: 1300 },
  { wait: 500 },
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
