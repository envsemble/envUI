import { useState } from 'react';
import { RelativeTime, Text } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import { narrowGallery } from './Tiles';

/** The time the tile's clock reads: fixed, so the times and the tooltip's date never change. */
const now = Date.UTC(2026, 9, 14, 9, 41, 30);
const minute = 60_000;

/**
 * A document's recent events, each with when it happened. There are two, so the stage has room
 * above them for a time's tooltip at their own size, and nothing moves as it opens.
 */
const events = [
  { label: 'Saved', at: now - 20_000 },
  { label: 'Shared', at: now - 2 * 24 * 60 * minute },
];

/*
 * A minute later, the save that was "just now" is "a minute ago", as the shared clock moves every
 * time on once a minute. On hover, that time shows its date and time, in a tooltip above the list
 * where it covers no other time.
 */
const script: PointerStep[] = [
  { wait: 600 },
  { cue: 'minute' },
  { wait: 540 },
  { to: '[data-event="Saved"] .env-relative-time', x: 0.5 },
  { wait: 1680 },
  { leave: true },
  { wait: 360 },
];

/**
 * In a phone's narrower tile, only the minute passing: a time's tooltip, as wide as its date, would
 * run past the stage's end from the times' column there.
 */
const narrowScript: PointerStep[] = [{ wait: 600 }, { cue: 'minute' }, { wait: 2400 }];

/**
 * When a document's last events happened, each as a time relative to now beside what happened. In a
 * phone's narrower tile the times take their short format, so the list is drawn at about its own
 * size there.
 */
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
              now={now + (later ? minute : 0)}
              format={narrow ? 'short' : 'long'}
            />
          </Text>
        </div>
      ))}
    </div>
  );
}
