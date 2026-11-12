import { Radio, RadioGroup } from '@envsemble/envui';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';

const option = (index: number) => `.env-radio:nth-child(${index} of .env-radio) .env-radio-input`;

/** Chooses Private, then Team again. */
const script: PointerStep[] = [
  { wait: 180 },
  { to: option(2) },
  { wait: 240 },
  { click: true },
  { wait: 660 },
  { to: option(1), duration: 350 },
  { wait: 120 },
  { click: true },
  { wait: 360 },
  { leave: true },
  { wait: 240 },
];

/** A choice of two, with Team chosen. */
export default function RadioTile() {
  usePointer(script);
  return (
    <RadioGroup orientation="vertical" aria-label="Visibility" defaultValue="team">
      <Radio value="team" label="Team" />
      <Radio value="private" label="Private" />
    </RadioGroup>
  );
}
