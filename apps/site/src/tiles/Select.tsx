import { Select } from '@envsemble/envui';
import { useHeldView } from '../motion/Playback';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';

const options = [
  { value: 'team', label: 'Team' },
  { value: 'private', label: 'Private' },
];

const trigger = '.env-select-trigger';
const option = (index: number) => `.env-select-item:nth-child(${index})`;

/**
 * Moves down the open list and chooses Private, which closes it. Opens it again from its trigger
 * and chooses Team, then opens it once more, as it began. Each choice is held, closed, for about a
 * second, and the open list rests a while before the loop starts over.
 */
const script: PointerStep[] = [
  { wait: 180 },
  { to: option(1) },
  { wait: 240 },
  { to: option(2), duration: 400 },
  { wait: 240 },
  { click: true },
  { wait: 1020 },
  { to: trigger, duration: 400 },
  { wait: 120 },
  { click: true },
  { wait: 300 },
  { to: option(1), duration: 400 },
  { wait: 180 },
  { click: true },
  { wait: 1020 },
  { to: trigger, duration: 400 },
  { wait: 120 },
  { click: true },
  { wait: 360 },
  { leave: true },
  { wait: 960 },
];

/**
 * A select resting with its list open under it, framed on both, so while it plays the list closes
 * and opens again in place, and nothing in its tile moves.
 */
export default function SelectTile() {
  useHeldView();
  usePointer(script);
  return <Select aria-label="Visibility" items={options} defaultValue="team" defaultOpen />;
}
