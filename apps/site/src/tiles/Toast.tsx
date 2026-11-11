import { useCallback, useEffect, useRef } from 'react';
import { PortalContainer, ToastProvider, useToast } from '@envsemble/envui';
import { useStageLayer } from '../motion/Playback';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import type { TileWindow } from './Tiles';

/*
 * Presses Undo on the notification of an archived project: it leaves, and a notification that the
 * project is restored takes its place. One shows at a time, so the tile never shows a half-hidden
 * stack.
 */
const script: PointerStep[] = [
  { wait: 240 },
  { to: '.env-toast-action' },
  { wait: 420 },
  { click: true },
  { wait: 180 },
  { leave: true },
  { wait: 1560 },
  { cue: 'again' },
  { wait: 1560 },
];

/**
 * How long after one notification starts to leave the next one comes: while it fades, so the stage
 * is never empty between them, but not before it has mostly gone, so the two never stack.
 */
const handover = 120;

/**
 * A notification of an archived project, short enough to show whole in a gallery's tile, with Undo,
 * which restores the project. When the tile stops, or at the end of a round, the restored
 * notification leaves and the archived one shows again.
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

/** The tiles' window (TileStage.css), as an overlay: drawn at the overlays' one scale. */
export const tileWindow: TileWindow = { overlay: true };

/**
 * A notification in the live region rather than a picture of one, so it arrives and leaves with its
 * own motion. The region renders into the tile's layer, whose transform keeps it in the tile's
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
