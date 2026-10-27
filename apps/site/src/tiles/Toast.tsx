import { useEffect, useRef } from 'react';
import { Toast, useToast } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../previews/Motion';

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
 * A notification, and another stacking with it, as the tile's contained notices, which arrive,
 * glide and leave with their own motion in the tile's corner, as an animated figure's do.
 */
export default function ToastTile() {
  return (
    <Toast.Provider>
      <Notices />
    </Toast.Provider>
  );
}
