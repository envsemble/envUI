import { useRef, useState } from 'react';
import { Button, ConfirmDialog, IconButton, Row, Text } from '@envsemble/envui';
import { IconDelete } from '@envsemble/envui/icons/Delete';
import { usePointer, type PointerStep } from '../motion/Motion';

/**
 * Confirmed, which waits for the action, pending, and closes on the plan's row, which offers to
 * undo it; undone, and the dialog opened again from the row's button, held open a while before
 * the loop starts over.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: '.env-dialog .env-button[type="submit"]', x: 0.4, y: 0.6 },
  { wait: 600 },
  { click: true },
  { wait: 2100 },
  { to: '.env-button:not([aria-haspopup])', duration: 400 },
  { wait: 250 },
  { click: true },
  { wait: 500 },
  { to: '.env-button[aria-haspopup]', duration: 350 },
  { wait: 250 },
  { click: true },
  { wait: 900 },
  { leave: true },
  { wait: 900 },
];

/** How long deleting takes, pending, and the dialog then takes to close. */
const deleting = 1000;
const closing = 300;

/** The dialog as narrow as its actions allow, so they leave it room. */
const narrow = { inlineSize: '12rem' } as const;

/**
 * A confirm dialog, open over the row of the plan it deletes, its name and the button that opens
 * it, in the middle of the screen the stage is: its question and its actions, low enough to show
 * whole at the overlays' scale (Tiles.ts). Deleted, the row offers Undo in its place. Stopped, it
 * is open again rather than drawn anew, which would bring it in again; a deletion still running
 * then ends at once, and no longer closes it.
 */
export default function ConfirmDialogTile() {
  const [open, setOpen] = useState(true);
  const [deleted, setDeleted] = useState(false);
  const round = useRef(0);
  const confirmedIn = useRef(-1);
  const done = useRef<(() => void) | null>(null);
  usePointer(script, {
    onRest: () => {
      round.current++;
      done.current?.();
      setDeleted(false);
      setOpen(true);
    },
  });
  if (deleted)
    return (
      <Row gap={2} align="center">
        <Text variant="body-sm" emphasis="muted">
          Plan deleted
        </Text>
        <Button variant="ghost" size="sm" onClick={() => setDeleted(false)}>
          Undo
        </Button>
      </Row>
    );
  return (
    <Row gap={1} align="center">
      <Text variant="body-sm">Starter plan</Text>
      <ConfirmDialog
        open={open}
        onOpenChange={(next, { reason }) => {
          if (!next && reason === 'imperative-action' && confirmedIn.current !== round.current)
            return;
          setOpen(next);
        }}
        trigger={<IconButton variant="secondary" icon={<IconDelete />} aria-label="Delete plan" />}
        tone="danger"
        title="Delete plan?"
        style={narrow}
        confirmLabel="Delete"
        onConfirm={() => {
          const at = round.current;
          confirmedIn.current = at;
          // Deleted once the dialog has closed over the row, not under it as it fades.
          setTimeout(() => {
            if (round.current === at) setDeleted(true);
          }, deleting + closing);
          return new Promise<void>((resolve) => {
            done.current = resolve;
            setTimeout(resolve, deleting);
          });
        }}
      />
    </Row>
  );
}
