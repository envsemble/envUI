import { useRef, useState } from 'react';
import { Button, ConfirmDialog, IconButton, Row, Text } from '@envsemble/envui';
import { IconDelete } from '@envsemble/envui/icons/Delete';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import type { TileWindow } from './Tiles';

/**
 * Confirms, which waits for the action, pending, then closes on the plan's row, which says the plan
 * is deleted and offers to undo it, held a while so it can be read. Then undoes it and opens the
 * dialog again from the row's button, held open a while before the loop starts over.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: '.env-dialog .env-button[type="submit"]', x: 0.4, y: 0.6 },
  { wait: 600 },
  { click: true },
  { wait: 3600 },
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

/** How long deleting takes, pending, and how long the dialog then takes to close. */
const deleting = 1000;
const closing = 300;

/** The dialog as narrow as its actions allow, so they still fit. */
const narrow = { inlineSize: '12rem' } as const;

/**
 * A larger window than the tiles' (Tile.css), as an overlay, with a lower least scale for its
 * popup: a confirm dialog with its button beside it is wider than a tile's stage at a popup's
 * least.
 */
export const tileWindow: TileWindow = { width: 15, height: 11.25, popupLeast: 0.56, overlay: true };

/**
 * A confirm dialog, open over the row of the plan it deletes (the plan's name and the button that
 * opens the dialog), in the middle of the stage, which stands in for the screen. It holds its
 * question and its actions, low enough to show whole at the overlays' scale (tileWindow). Once the
 * plan is deleted, the row offers Undo in its place. When the tile stops, the dialog is open again
 * rather than drawn again, which would make it appear with motion again; a deletion still running
 * then ends at once, and no longer closes the dialog.
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
          // Deleted once the dialog has closed over the row, not while it fades out over it.
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
