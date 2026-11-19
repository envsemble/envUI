import { useCallback, useEffect, useRef } from 'react';
import { PortalContainer, ToastProvider, useToast } from '@envsemble/envui';
import { useStageLayer } from '../motion/Playback';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import type { TileWindow } from './Tiles';

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

const handoverMs = 120;

function Notices() {
  const toast = useToast();
  const shown = useRef<string | null>(null);
  const archivedShown = useRef(false);
  const timer = useRef(0);
  const archive = useCallback(() => {
    archivedShown.current = true;
    shown.current = toast.show({
      message: 'Archived.',
      actions: [
        {
          label: 'Undo',
          onClick: () => {
            if (shown.current) toast.dismiss(shown.current);
            shown.current = null;
            archivedShown.current = false;
            timer.current = window.setTimeout(() => {
              shown.current = toast.show({
                tone: 'success',
                message: 'Restored.',
                duration: Infinity,
              });
            }, handoverMs);
          },
        },
      ],
    });
  }, [toast]);
  const again = () => {
    if (archivedShown.current) return;
    archivedShown.current = true;
    window.clearTimeout(timer.current);
    if (shown.current) toast.dismiss(shown.current);
    shown.current = null;
    timer.current = window.setTimeout(archive, handoverMs);
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

export const tileWindow: TileWindow = { overlay: true };

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
