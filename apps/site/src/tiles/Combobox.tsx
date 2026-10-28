import { Avatar, Combobox, type ComboboxItem } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';

const people: ComboboxItem[] = ['Alex Morgan', 'Priya Shah', 'Sam Lee'].map((name) => ({
  value: name.toLowerCase().replace(' ', '.'),
  label: name,
  start: <Avatar name={name} size="sm" />,
}));

const input = '.env-combobox-input';

/** A name typed, which narrows the list to one; chosen, then cleared again. */
const script: PointerStep[] = [
  { wait: 300 },
  { to: input, x: 0.3 },
  { wait: 300 },
  { click: true },
  { wait: 300 },
  { type: 'pr', into: input, every: 260 },
  { wait: 700 },
  { to: '.env-combobox-item', duration: 400 },
  { wait: 300 },
  { click: true },
  { wait: 1200 },
  { to: '.env-combobox-clear', duration: 400 },
  { wait: 200 },
  { click: true },
  { wait: 500 },
  { leave: true },
  { wait: 400 },
];

/** A combobox of people. */
export default function ComboboxTile() {
  usePointer(script);
  return (
    <Combobox
      label="Owner"
      placeholder="Choose a person"
      items={people}
      clearable
      style={{ inlineSize: '11rem' }}
    />
  );
}
