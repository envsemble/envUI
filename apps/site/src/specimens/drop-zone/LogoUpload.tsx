import LogoUpload from '../../examples/drop-zone/LogoUpload';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const zone = '.env-drop-zone-target';

const zoneHeight = '9.5625rem';

const script: PointerStep[] = [
  { wait: 300 },
  { carry: 'logo.png', as: 'image/png' },
  { to: zone, x: 1.15, y: 1.3 },
  { to: zone, x: 0.55, y: 0.55, duration: 700 },
  { wait: 360 },
  { drop: true },
  { wait: 1980 },
  { to: '.env-button[data-variant="text"]', x: 0.5, y: 0.55, duration: 600 },
  { wait: 210 },
  { click: true },
  { wait: 420 },
  { leave: true },
  { wait: 360 },
];

function Uploading() {
  usePointer(script);
  return (
    <div
      style={{
        display: 'grid',
        alignContent: 'start',
        inlineSize: '100%',
        minBlockSize: zoneHeight,
      }}
    >
      <div style={{ display: 'grid', justifyItems: 'center' }}>
        <LogoUpload />
      </div>
    </div>
  );
}

export default function LogoUploadMotion() {
  return (
    <MotionStage label="a logo dropped and uploaded">
      <Uploading />
    </MotionStage>
  );
}
