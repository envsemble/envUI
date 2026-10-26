import { Select } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../previews/Motion';

const options = [
  { value: 'team', label: 'Team' },
  { value: 'private', label: 'Private' },
];

const trigger = '.env-select-trigger';
const option = (index: number) => `.env-select-item:nth-child(${index})`;

/** Opened and Private chosen; opened again and Team chosen, as it began. */
const script: PointerStep[] = [
  { wait: 300 },
  { to: trigger },
  { wait: 400 },
  { click: true },
  { wait: 600 },
  { to: option(2), duration: 500 },
  { wait: 300 },
  { click: true },
  { wait: 1000 },
  { to: trigger, duration: 400 },
  { wait: 200 },
  { click: true },
  { wait: 600 },
  { to: option(1), duration: 500 },
  { wait: 300 },
  { click: true },
  { wait: 600 },
  { leave: true },
  { wait: 400 },
];

/** A select. */
export default function SelectTile() {
  usePointer(script);
  return (
    <Select
      aria-label="Visibility"
      items={options}
      defaultValue="team"
      style={{ inlineSize: '7.5rem' }}
    />
  );
}
