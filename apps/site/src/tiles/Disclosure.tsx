import { useState } from 'react';
import { Column, Disclosure, Text } from '@envsemble/envui';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';

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
 * A disclosure under the title of what it tells more about, open on its details, so closed it
 * still reads as a part of a page rather than a lone line. The column they stand in keeps its
 * height as the details hide, as a page's would, so the title and the summary stay where they are.
 * Stopped, it opens again rather than being drawn anew, which would fade its details in again.
 */
export default function DisclosureTile() {
  const [open, setOpen] = useState(true);
  usePointer(script, { onRest: () => setOpen(true) });
  return (
    <Column gap={2} align="start" style={{ inlineSize: '8.5rem', minBlockSize: '5.25rem' }}>
      <Text variant="title">Launch plan</Text>
      <Disclosure
        title="What changed"
        open={open}
        onOpenChange={setOpen}
        style={{ inlineSize: '100%' }}
      >
        It ships in May.
      </Disclosure>
    </Column>
  );
}
