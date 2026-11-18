import TopCenter from '../../examples/toast/TopCenter';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const dismiss = '.env-toast[data-tone="danger"] .env-toast-dismiss';

const script: PointerStep[] = [
  { wait: 240 },
  { to: '.env-button', x: 0.5, y: 1.8 },
  { to: '.env-button', x: 0.55, y: 0.55, duration: 450 },
  { wait: 120 },
  { click: true },
  { wait: 600 },
  { click: true },
  { wait: 600 },
  { click: true },
  { wait: 780 },
  { click: true },
  { wait: 1020 },
  { to: dismiss, duration: 600 },
  { wait: 180 },
  { click: true },
  { wait: 180 },
  { leave: true },
  { wait: 8700 },
];

function Reminding() {
  usePointer(script);
  return (
    <div
      style={{ display: 'grid', justifyItems: 'center', alignContent: 'end', blockSize: '16rem' }}
    >
      <TopCenter />
    </div>
  );
}

export default function TopCenterMotion() {
  return (
    <MotionStage label="notifications waiting behind a count" height="20rem">
      <Reminding />
    </MotionStage>
  );
}
