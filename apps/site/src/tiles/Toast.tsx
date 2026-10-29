import { useEffect, useRef } from 'react';
import { PortalContainer, ToastProvider, useToast } from '@envsemble/envui';
import { usePointer, usePreviewLayer, type PointerStep } from '../motion/Motion';

const invitation = '.env-toast[data-tone="success"] .env-toast-dismiss';

/*
 * A second notification arrives and stacks with the first; the pointer dismisses it, and the
 * first is alone again, as it began.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { cue: 'invite' },
  { wait: 1400 },
  { to: invitation },
  { wait: 500 },
  { click: true },
  { wait: 300 },
  { leave: true },
  { wait: 1000 },
];

/**
 * A notification of an archived project, with Undo, and an invitation sent, as cued. Stopped, it
 * dismisses the invitation rather than being drawn anew, which would bring the first in again.
 */
function Notices() {
  const toast = useToast();
  const invited = useRef<string | null>(null);
  usePointer(script, {
    onCue: (cue) => {
      if (cue === 'invite')
        invited.current = toast.show({
          tone: 'success',
          message: 'Invitation sent.',
          duration: Infinity,
        });
    },
    onRest: () => {
      if (invited.current) toast.dismiss(invited.current);
      invited.current = null;
    },
  });
  useEffect(() => {
    const id = toast.show({
      message: 'Project archived.',
      action: { label: 'Undo', onClick: () => {} },
    });
    return () => toast.dismiss(id);
  }, [toast]);
  return null;
}

/**
 * A notification, and another stacking with it, in the live region rather than a picture of one,
 * so they arrive, glide and leave with their own motion: the region renders into the tile's layer,
 * whose transform holds it in the tile's corner.
 */
export default function ToastTile() {
  const layer = usePreviewLayer();
  if (!layer) return null;
  return (
    <PortalContainer container={layer}>
      <ToastProvider>
        <Notices />
      </ToastProvider>
    </PortalContainer>
  );
}
