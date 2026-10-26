import { useState } from 'react';
import { Button, Popover, Text } from '@envsemble/envui';
import { Info } from '@envsemble/envui/icons/Info';
import { usePointer, type PointerStep } from '../previews/Motion';

const trigger = '.env-button[aria-haspopup]';

/** Closed from its button, and opened again from it. */
const script: PointerStep[] = [
  { wait: 400 },
  { to: trigger, x: 0.6, y: 0.7 },
  { wait: 600 },
  { click: true },
  { wait: 900 },
  { click: true },
  { wait: 600 },
  { leave: true },
  { wait: 600 },
];

/**
 * A popover, open below its button. Stopped, it is open again rather than drawn anew, which would
 * bring it in again.
 */
export default function PopoverTile() {
  const [open, setOpen] = useState(true);
  usePointer(script, { onRest: () => setOpen(true) });
  return (
    <Popover
      open={open}
      onOpenChange={setOpen}
      title="Billing period"
      trigger={
        <Button variant="secondary" startIcon={<Info />}>
          Billing
        </Button>
      }
    >
      <Text>Monthly, from the 1st.</Text>
    </Popover>
  );
}
