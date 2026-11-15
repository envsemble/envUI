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

export default function SelectTile() {
  useHeldView();
  usePointer(script);
  return <Select aria-label="Visibility" items={options} defaultValue="team" defaultOpen />;
}
