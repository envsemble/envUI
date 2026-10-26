import CopyValue from '../../examples/button/CopyValue';
import { usePointer, type PointerStep } from '../../previews/Motion';
import { MotionStage } from '../../previews/MotionStage';

/*
 * The pointer presses Copy ID: it shows Copied for about two seconds, then comes back. A click by
 * the pointer no one sees never reaches the reader's clipboard. The waits here are paced to 0.6 of
 * what they say.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: '.env-copy-button:not([aria-label])', x: 0.55, y: 0.6 },
  { wait: 350 },
  { click: true },
  { wait: 900 },
  { leave: true },
  { wait: 4600 },
];

function Copying() {
  usePointer(script);
  return <CopyValue />;
}

/** Copy ID, pressed by a pointer no one sees, showing Copied and coming back. */
export default function CopyValueMotion() {
  return (
    <MotionStage label="the copy button showing Copied" height="13rem">
      <Copying />
    </MotionStage>
  );
}
