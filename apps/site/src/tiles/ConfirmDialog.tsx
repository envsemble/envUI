import { useRef, useState } from 'react';
import { Button, ConfirmDialog } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';

/**
 * Confirmed, which waits for the action, pending, and closes; opened again from its button, which
 * it covers.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: '.env-dialog-popup .env-button[type="submit"]', x: 0.4, y: 0.6 },
  { wait: 700 },
  { click: true },
  { wait: 1900 },
  { to: '.env-button[aria-haspopup]', duration: 450 },
  { wait: 400 },
  { click: true },
  { wait: 500 },
  { leave: true },
  { wait: 600 },
];

/** How long deleting takes, pending. */
const deleting = 1000;

/**
 * A confirm dialog, open over the button that opens it. Stopped, it is open again rather than
 * drawn anew, which would bring it in again; a deletion still running then ends at once, and no
 * longer closes it.
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
      title="Delete Northwind?"
      description="It can’t be undone."
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
