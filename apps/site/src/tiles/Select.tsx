import { Select } from '@envsemble/envui';
import { useHeldView, usePointer, type PointerStep } from '../motion/Motion';

const options = [
  { value: 'team', label: 'Team' },
  { value: 'private', label: 'Private' },
];

const trigger = '.env-select-trigger';
const option = (index: number) => `.env-select-item:nth-child(${index})`;

/**
 * Down the open list, Private chosen, which closes it; opened again from its trigger and Team
 * chosen; opened once more, as it began.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: option(1) },
  { wait: 400 },
  { to: option(2), duration: 400 },
  { wait: 400 },
  { click: true },
  { wait: 900 },
  { to: trigger, duration: 400 },
  { wait: 200 },
  { click: true },
  { wait: 500 },
  { to: option(1), duration: 400 },
  { wait: 300 },
  { click: true },
  { wait: 900 },
  { to: trigger, duration: 400 },
  { wait: 200 },
  { click: true },
  { wait: 600 },
  { leave: true },
  { wait: 400 },
];

/**
 * A select resting with its list open under it, framed on both, so as it plays the list closes and
 * opens again in place, and nothing in its tile moves.
 */
export default function SelectTile() {
  useHeldView();
  usePointer(script);
  return <Select aria-label="Visibility" items={options} defaultValue="team" defaultOpen />;
}
