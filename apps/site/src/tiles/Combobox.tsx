import { useState } from 'react';
import { Combobox, type ComboboxItem } from '@envsemble/envui';
import { useHeldView } from '../motion/Playback';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import { Renew } from '../motion/Renew';

const labels: ComboboxItem[] = ['Bug', 'Docs'].map((name) => ({
  value: name.toLowerCase(),
  label: name,
}));

const input = '.env-combobox-input';

/**
 * Types a label after the chip already chosen, which narrows the open list to one. Choosing it adds
 * it as a second chip, and the two hold a while; then the field is drawn again as it began, its
 * list open, with a short fade (Renew).
 */
const script: PointerStep[] = [
  { wait: 180 },
  { to: input, x: 0.3 },
  { wait: 180 },
  { click: true },
  { wait: 180 },
  { type: 'do', into: input, every: 260 },
  { wait: 420 },
  { to: '.env-combobox-item', duration: 400 },
  { wait: 180 },
  { click: true },
  { wait: 180 },
  { leave: true },
  { blur: true },
  { wait: 1200 },
  { cue: 'renew' },
  { wait: 300 },
];

/**
 * A combobox of two labels, where several can be chosen, with one already chosen as a chip beside
 * the field's text, so at rest it reads as a field to type in rather than a select. The labels are
 * short enough that two chips share the field's one row, on a phone's narrower tile too. It rests
 * with its list open, framed on the field and the list, so while it plays the list narrows, closes
 * and opens again in place, and nothing in its tile moves.
 */
export default function ComboboxTile() {
  const [round, setRound] = useState(0);
  useHeldView();
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    <Renew round={round}>
      <Combobox
        multiple
        label="Labels"
        placeholder="Add a label"
        items={labels}
        defaultValue={['bug']}
        defaultOpen
        style={{ inlineSize: 'min(12rem, 100%)' }}
      />
    </Renew>
  );
}
