import { useState } from 'react';
import { RelativeTime, Text } from '@envsemble/envui';
import { useMedia } from '../motion/Autoplay';
import { usePointer, type PointerStep } from '../motion/Motion';
import { narrowGallery } from './Tiles';

/** The moment the tile's clock reads: fixed, so the times and the tooltip's date never change. */
const now = Date.UTC(2026, 9, 14, 9, 41, 30);
const minute = 60_000;

/** A document's recent events, each when it happened. */
const events = [
  { label: 'Saved', at: now - 20_000 },
  { label: 'Edited', at: now - 3 * 60 * minute },
  { label: 'Shared', at: now - 2 * 24 * 60 * minute },
];

/*
 * A minute on, the save that was just now is a minute ago, as the shared clock moves each time on
 * once a minute; hovered, that time shows its date and time, its tooltip above the list, where
 * it covers no other time.
 */
const script: PointerStep[] = [
  { wait: 1000 },
  { cue: 'minute' },
  { wait: 900 },
  { to: '[data-event="Saved"] .env-relative-time', x: 0.5 },
  { wait: 2800 },
  { leave: true },
  { wait: 600 },
];

/**
 * In a phone's narrower tile, the minute on alone: a time's tooltip, as wide as its date, would
 * run past the stage's end from the times' column there.
 */
const narrowScript: PointerStep[] = [{ wait: 1000 }, { cue: 'minute' }, { wait: 4000 }];

/**
 * When a document's last events happened, each as a time relative to now beside what happened. In a
 * phone's narrower tile, the times take their short format, so the list is drawn at about its own
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
          <Text style={{ justifySelf: 'end' }}>
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
