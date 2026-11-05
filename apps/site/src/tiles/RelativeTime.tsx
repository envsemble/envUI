import { useState } from 'react';
import { RelativeTime, Text } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';

/** When the draft was saved: a fixed moment, so the tooltip's date is always the same. */
const saved = Date.UTC(2026, 9, 14, 9, 41);
const minute = 60_000;

/*
 * The minutes since the save tick on; hovered, the time shows its date; the draft saved again,
 * just now, and a minute later as it began.
 */
const script: PointerStep[] = [
  { wait: 900 },
  { cue: 'tick' },
  { wait: 900 },
  { cue: 'tick' },
  { wait: 400 },
  { to: '.env-relative-time', x: 0.6 },
  { wait: 1900 },
  { leave: true },
  { wait: 500 },
  { cue: 'save' },
  { wait: 1100 },
  { cue: 'tick' },
  { wait: 400 },
];

/** When a draft was saved, a minute ago, as a time that keeps itself current. */
export default function RelativeTimeTile() {
  const [minutes, setMinutes] = useState(1);
  usePointer(script, {
    onCue: (cue) => setMinutes((current) => (cue === 'save' ? 0 : current + 1)),
  });
  return (
    <Text>
      <RelativeTime value={saved} now={saved + minutes * minute} />
    </Text>
  );
}
