import SaveFailed from '../../examples/alert/SaveFailed';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const alertAndButtonHeight = '9.75rem';

const script: PointerStep[] = [
  { wait: 300 },
  { to: '.env-button', x: 0.55, y: 0.6 },
  { wait: 210 },
  { click: true },
  { wait: 1800 },
  { to: '.env-alert .env-icon-button', duration: 550 },
  { wait: 240 },
  { click: true },
  { wait: 360 },
  { leave: true },
  { wait: 540 },
];

function Saving() {
  usePointer(script);
  return (
    <div
      style={{
        display: 'grid',
        alignContent: 'end',
        inlineSize: 'min(100%, 32rem)',
        minBlockSize: alertAndButtonHeight,
      }}
    >
      <SaveFailed />
    </div>
  );
}

export default function SaveFailedMotion() {
  return (
    <MotionStage label="the alert announcing a failed save">
      <Saving />
    </MotionStage>
  );
}
