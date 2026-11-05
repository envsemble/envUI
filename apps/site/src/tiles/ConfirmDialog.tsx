import { useRef, useState } from 'react';
import { Button, ConfirmDialog } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';

/**
 * Confirmed, which waits for the action, pending, and closes; its button shows a moment, and opens
 * it again, held open a while before the loop starts over.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: '.env-dialog .env-button[type="submit"]', x: 0.4, y: 0.6 },
  { wait: 600 },
  { click: true },
  { wait: 1300 },
  { to: '.env-button[aria-haspopup]', duration: 400 },
  { wait: 250 },
  { click: true },
  { wait: 900 },
  { leave: true },
  { wait: 900 },
];

/** How long deleting takes, pending. */
const deleting = 1000;

/**
 * A confirm dialog, open over the button that opens it: its question and its actions alone, so a
 * gallery's low tile shows them at about their own size. Stopped, it is open again rather than drawn anew,
 * which would bring it in again; a deletion still running then ends at once, and no longer closes
 * it.
 */
export default function ConfirmDialogTile() {
  const [open, setOpen] = useState(true);
  const round = useRef(0);
  const confirmedIn = useRef(-1);
  const done = useRef<(() => void) | null>(null);
  usePointer(script, {
    onRest: () => {
      round.current++;
      done.current?.();
      setOpen(true);
    },
  });
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={(next, { reason }) => {
        if (!next && reason === 'imperative-action' && confirmedIn.current !== round.current)
          return;
        setOpen(next);
      }}
      trigger={<Button variant="secondary">Delete</Button>}
      tone="danger"
      title="Delete plan?"
      confirmLabel="Delete"
      onConfirm={() => {
        confirmedIn.current = round.current;
        return new Promise<void>((resolve) => {
          done.current = resolve;
          setTimeout(resolve, deleting);
        });
      }}
    />
  );
}
