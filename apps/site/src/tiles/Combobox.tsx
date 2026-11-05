import { useState } from 'react';
import { Combobox, type ComboboxItem } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';
import { Renew } from '../motion/Renew';

const labels: ComboboxItem[] = ['Design', 'Docs'].map((name) => ({
  value: name.toLowerCase(),
  label: name,
}));

const input = '.env-combobox-input';

/**
 * A label typed after the chip already chosen, which narrows the list to one; chosen, it joins
 * the first as a second chip, and the two hold a while; then the field is drawn anew as it began, with
 * a short fade (Renew).
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: input, x: 0.3 },
  { wait: 300 },
  { click: true },
  { wait: 300 },
  { type: 'do', into: input, every: 260 },
  { wait: 700 },
  { to: '.env-combobox-item', duration: 400 },
  { wait: 300 },
  { click: true },
  { wait: 300 },
  { leave: true },
  { blur: true },
  { wait: 2000 },
  { cue: 'renew' },
  { wait: 500 },
];

/**
 * A combobox of two labels, several to choose, one already chosen as a chip beside the field's
 * text, so at rest it reads as a field to type in rather than a select; short labels, so two chips
 * share the field's one row, and its field and its open list show whole in a gallery's low tile.
 */
export default function ComboboxTile() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    <Renew round={round}>
      <Combobox
        multiple
        label="Labels"
        placeholder="Add a label"
        items={labels}
        defaultValue={['design']}
        style={{ inlineSize: '12rem' }}
      />
    </Renew>
  );
}
