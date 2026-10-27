import LogoUpload from '../../examples/drop-zone/LogoUpload';
import { usePointer, type PointerStep } from '../../previews/Motion';
import { MotionStage } from '../../previews/MotionStage';

const zone = '.env-drop-zone-target';

/*
 * The pointer carries logo.png in from outside the stage: the zone lights up under it, and the
 * pointer drops it. A spinner takes the icon's place while it uploads, and then the logo shows
 * with Replace and Remove. The pointer presses Remove, and the zone is back.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { carry: 'logo.png', as: 'image/png' },
  { to: zone, x: 1.15, y: 1.3 },
  { to: zone, x: 0.55, y: 0.55, duration: 700 },
  { wait: 600 },
  { drop: true },
  { wait: 3300 },
  { to: '.env-button[data-variant="text"]', x: 0.5, y: 0.55, duration: 600 },
  { wait: 350 },
  { click: true },
  { wait: 700 },
  { leave: true },
  { wait: 600 },
];

function Uploading() {
  usePointer(script);
  return (
    // As tall as the zone, so the logo's row takes its place at its top.
    <div
      style={{
        display: 'grid',
        alignContent: 'start',
        inlineSize: '100%',
        minBlockSize: '9.5625rem',
      }}
    >
      <div style={{ display: 'grid', justifyItems: 'center' }}>
        <LogoUpload />
      </div>
    </div>
  );
}

/** A logo dropped on the zone by a pointer no one sees: it uploads, then shows. */
export default function LogoUploadMotion() {
  return (
    <MotionStage label="a logo dropped and uploaded">
      <Uploading />
    </MotionStage>
  );
}
