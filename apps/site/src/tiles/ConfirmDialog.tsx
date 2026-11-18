import { useRef, useState } from 'react';
import { Button, ConfirmDialog, IconButton, Row, Text } from '@envsemble/envui';
import { IconDelete } from '@envsemble/envui/icons/Delete';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import type { TileWindow } from './Tiles';

const script: PointerStep[] = [
  { wait: 240 },
  { to: '.env-dialog .env-button[type="submit"]', x: 0.4, y: 0.6 },
  { wait: 360 },
  { click: true },
  { wait: 2160 },
  { to: '.env-button:not([aria-haspopup])', duration: 400 },
  { wait: 150 },
  { click: true },
  { wait: 300 },
  { to: '.env-button[aria-haspopup]', duration: 350 },
  { wait: 150 },
  { click: true },
  { wait: 540 },
  { leave: true },
  { wait: 540 },
];

const deletingMs = 1000;
const closingMs = 300;

const narrow = { inlineSize: '12rem' } as const;

export const tileWindow: TileWindow = { width: 15, height: 11.25, popupLeast: 0.56, overlay: true };

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
          setTimeout(() => {
            if (round.current === at) setDeleted(true);
          }, deletingMs + closingMs);
          return new Promise<void>((resolve) => {
            done.current = resolve;
            setTimeout(resolve, deletingMs);
          });
        }}
      />
    </Row>
  );
}
