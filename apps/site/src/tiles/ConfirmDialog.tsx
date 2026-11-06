import { useRef, useState } from 'react';
import { ConfirmDialog, IconButton } from '@envsemble/envui';
import { IconDelete } from '@envsemble/envui/icons/Delete';
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
 * The button, at the start of the screen the stage is, beside the dialog it opens rather than
 * under it, so it never shows through the dialog as it comes and goes; the dialog as narrow as its
 * actions allow, so they leave it room.
 */
const beside = { display: 'flex', inlineSize: '100%', paddingInline: '0.375rem' } as const;
const narrow = { inlineSize: '12rem' } as const;

/**
 * A confirm dialog, open beside the button that opens it, drawn whole: its question and its
 * actions, low enough to show whole at the overlays' scale (Tiles.ts). Stopped, it is open again rather than drawn anew, which would bring it
 * in again; a deletion still running then ends at once, and no longer closes it.
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
    <div style={beside}>
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
          confirmedIn.current = round.current;
          return new Promise<void>((resolve) => {
            done.current = resolve;
            setTimeout(resolve, deleting);
          });
        }}
      />
    </div>
  );
}
