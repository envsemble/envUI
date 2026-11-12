import { useState } from 'react';
import { Column, Disclosure, Text } from '@envsemble/envui';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';

const summary = '.env-disclosure > summary';

/** Presses its summary, which hides the details; pressing it again brings them back. */
const script: PointerStep[] = [
  { wait: 240 },
  { to: '.env-disclosure-panel', x: 0.7, y: 0.5 },
  { wait: 90 },
  { to: summary, x: 0.45, duration: 450 },
  { wait: 180 },
  { click: true },
  { wait: 660 },
  { click: true },
  { wait: 420 },
  { leave: true },
  { wait: 360 },
];

/**
 * A disclosure under the title of what it tells more about, open on its details, so even closed it
 * reads as part of a page rather than a lone line. The column it stands in keeps its height as the
 * details hide, as a page's would, so the title and the summary stay where they are. When the tile
 * stops, the disclosure opens again rather than being drawn again, which would fade its details in
 * again.
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
