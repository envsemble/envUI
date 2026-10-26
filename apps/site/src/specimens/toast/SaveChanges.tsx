import { PortalContainer } from '@envsemble/envui';
import SaveChanges from '../../examples/toast/SaveChanges';
import { usePointer, usePreviewLayer, type PointerStep } from '../../previews/Motion';
import { MotionStage } from '../../previews/MotionStage';

/*
 * The pointer presses Save changes: the button works a moment, and a notification arrives at the
 * stage's bottom end. The pointer rests on it, which keeps it, then leaves, and it closes by
 * itself.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: '.env-button', x: 0.55, y: 0.6 },
  { wait: 450 },
  { click: true },
  { wait: 2300 },
  { to: '.env-toast', x: 0.45, y: 0.55, duration: 600 },
  { wait: 1800 },
  { leave: true },
  // Its time runs on from where the pointer held it, and it is gone well before the loop ends.
  { wait: 8600 },
];

function Saving() {
  usePointer(script);
  const layer = usePreviewLayer();
  // The notifications render live in the stage's layer, as the Toast tile's do, rather than as
  // the picture a contained container shows, so they arrive, stay and leave with their own motion.
  if (!layer) return null;
  return (
    <PortalContainer container={layer}>
      <SaveChanges />
    </PortalContainer>
  );
}

/** The overview's Save changes, pressed by a pointer no one sees, and its notification. */
export default function SaveChangesMotion() {
  return (
    <MotionStage label="the notification arriving and closing" height="16rem">
      <Saving />
    </MotionStage>
  );
}
