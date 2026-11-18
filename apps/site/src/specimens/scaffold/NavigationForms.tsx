import NavigationForms from '../../examples/scaffold/NavigationForms';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const script: PointerStep[] = [
  { wait: 300 },
  { to: '.env-scaffold-body', x: 0.6, y: 0.45 },
  { wait: 240 },
  { wheel: 150, duration: 1600 },
  { wait: 720 },
  { wheel: -150, duration: 1600 },
  { wait: 360 },
  { leave: true },
  { wait: 420 },
];

function Scrolling() {
  usePointer(script);
  return (
    <div style={{ justifySelf: 'stretch' }}>
      <NavigationForms />
    </div>
  );
}

export default function NavigationFormsMotion() {
  return (
    <MotionStage label="the body scrolling under the bars" stage="shaded">
      <Scrolling />
    </MotionStage>
  );
}
