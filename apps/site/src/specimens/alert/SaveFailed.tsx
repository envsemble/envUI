import SaveFailed from '../../examples/alert/SaveFailed';
import { usePointer, type PointerStep } from '../../previews/Motion';
import { MotionStage } from '../../previews/MotionStage';

/*
 * The pointer presses Save draft: it works a moment, the save fails, and the danger alert appears
 * above it. The pointer dismisses the alert, and the button is as it began.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: '.env-button', x: 0.55, y: 0.6 },
  { wait: 350 },
  { click: true },
  { wait: 3000 },
  { to: '.env-alert .env-icon-button', duration: 550 },
  { wait: 400 },
  { click: true },
  { wait: 600 },
  { leave: true },
  { wait: 900 },
];

function Saving() {
  usePointer(script);
  return (
    // As tall as the alert and the button together, the button at its foot, so it stays put as
    // the alert comes and goes above it.
    <div
      style={{
        display: 'grid',
        alignContent: 'end',
        inlineSize: 'min(100%, 32rem)',
        minBlockSize: '9.75rem',
      }}
    >
      <SaveFailed />
    </div>
  );
}

/** Save draft, pressed by a pointer no one sees, failing with an alert that it dismisses. */
export default function SaveFailedMotion() {
  return (
    <MotionStage label="the alert announcing a failed save">
      <Saving />
    </MotionStage>
  );
}
