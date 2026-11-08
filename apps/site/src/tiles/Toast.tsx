import { useCallback, useEffect, useRef } from 'react';
import { PortalContainer, ToastProvider, useToast } from '@envsemble/envui';
import { usePointer, useStageLayer, type PointerStep } from '../motion/Motion';

/*
 * Undo pressed on the notification of an archived project: it leaves, and a notification that the
 * project is restored takes its place, one at a time, so the tile never shows a stack half hidden.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: '.env-toast-action' },
  { wait: 700 },
  { click: true },
  { wait: 300 },
  { leave: true },
  { wait: 2600 },
  { cue: 'again' },
  { wait: 2600 },
];

/**
 * How long after one notification starts to leave the next comes: as it fades, so the stage is
 * never empty between them, but not before it has mostly gone, so the two never stack.
 */
const handover = 120;

/**
 * A notification of an archived project, short enough to show whole in a gallery's tile, with
 * Undo, which restores it. Stopped, or at the end of a round, the restored notification leaves
 * and the archived one is shown again.
 */
function Notices() {
  const toast = useToast();
  const shown = useRef<string | null>(null);
  /** Whether the archived notification is the one shown, as at rest. */
  const archived = useRef(false);
  const timer = useRef(0);
  const archive = useCallback(() => {
    archived.current = true;
    shown.current = toast.show({
      message: 'Archived.',
      action: {
        label: 'Undo',
        onClick: () => {
          if (shown.current) toast.dismiss(shown.current);
          shown.current = null;
          archived.current = false;
          timer.current = window.setTimeout(() => {
            shown.current = toast.show({
              tone: 'success',
              message: 'Restored.',
              duration: Infinity,
            });
          }, handover);
        },
      },
    });
  }, [toast]);
  const again = () => {
    if (archived.current) return;
    archived.current = true;
    window.clearTimeout(timer.current);
    if (shown.current) toast.dismiss(shown.current);
    shown.current = null;
    timer.current = window.setTimeout(archive, handover);
  };
  usePointer(script, { onCue: again, onRest: again });
  useEffect(() => {
    archive();
    return () => {
      window.clearTimeout(timer.current);
      if (shown.current) toast.dismiss(shown.current);
      shown.current = null;
    };
  }, [archive, toast]);
  return null;
}

/**
 * A notification in the live region rather than a picture of one, so it arrives and leaves with
 * its own motion: the region renders into the tile's layer, whose transform holds it in the tile's
 * corner.
 */
export default function ToastTile() {
  const layer = useStageLayer();
  if (!layer) return null;
  return (
    <PortalContainer container={layer}>
      <ToastProvider>
        <Notices />
      </ToastProvider>
    </PortalContainer>
  );
}
