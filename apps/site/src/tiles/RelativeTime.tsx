import { useState } from 'react';
import { RelativeTime, Text } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import { narrowGallery } from './Tiles';

const now = Date.UTC(2026, 9, 14, 9, 41, 30);
const minuteMs = 60_000;

const events = [
  { label: 'Saved', at: now - 20_000 },
  { label: 'Shared', at: now - 2 * 24 * 60 * minuteMs },
];

const script: PointerStep[] = [
  { wait: 600 },
  { cue: 'minute' },
  { wait: 540 },
  { to: '[data-event="Saved"] .env-relative-time', x: 0.5 },
  { wait: 1680 },
  { leave: true },
  { wait: 360 },
];

const narrowScript: PointerStep[] = [{ wait: 600 }, { cue: 'minute' }, { wait: 2400 }];

export default function RelativeTimeTile() {
  const narrow = useMedia(narrowGallery);
  return <Events key={String(narrow)} narrow={narrow} />;
}

function Events({ narrow }: { narrow: boolean }) {
  const [later, setLater] = useState(false);
  usePointer(narrow ? narrowScript : script, { onCue: () => setLater(true) });
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'auto auto',
        alignItems: 'center',
        columnGap: 'var(--env-space-6)',
        rowGap: 'var(--env-space-3)',
      }}
    >
      {events.map(({ label, at }) => (
        <div key={label} data-event={label} style={{ display: 'contents' }}>
          <Text emphasis="muted">{label}</Text>
          <Text>
            <RelativeTime
              value={at}
              now={now + (later ? minuteMs : 0)}
              format={narrow ? 'short' : 'long'}
            />
          </Text>
        </div>
      ))}
    </div>
  );
}
