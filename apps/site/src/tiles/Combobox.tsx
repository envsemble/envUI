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
