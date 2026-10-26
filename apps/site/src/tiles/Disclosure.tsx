import { useState } from 'react';
import { Disclosure } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../previews/Motion';

const summary = '.env-disclosure > summary';

/** Its summary pressed, which hides the details; pressed again, they come back. */
const script: PointerStep[] = [
  { wait: 400 },
  { to: '.env-disclosure-panel', x: 0.7, y: 0.5 },
  { wait: 150 },
  { to: summary, x: 0.45, duration: 450 },
  { wait: 300 },
  { click: true },
  { wait: 1100 },
  { click: true },
  { wait: 700 },
  { leave: true },
  { wait: 600 },
];

/**
 * A disclosure, open on its details. Its box keeps one size open or closed, so its summary stays
 * where it is as the details hide. Stopped, it opens again rather than being drawn anew, which
 * would fade its details in again.
 */
export default function DisclosureTile() {
  const [open, setOpen] = useState(true);
  usePointer(script, { onRest: () => setOpen(true) });
  return (
    <Disclosure
      title="Who can see it"
      open={open}
      onOpenChange={setOpen}
      style={{ inlineSize: '8.5rem', blockSize: '5rem' }}
    >
      Only people you invite.
    </Disclosure>
  );
}
