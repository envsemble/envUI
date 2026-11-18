import { Checkbox, Column } from '@envsemble/envui';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';

const box = (index: number) =>
  `.env-checkbox:nth-child(${index} of .env-checkbox) .env-checkbox-input`;

const script: PointerStep[] = [
  { wait: 180 },
  { to: box(2) },
  { wait: 240 },
  { click: true },
  { wait: 420 },
  { to: box(1), duration: 350 },
  { wait: 120 },
  { click: true },
  { wait: 600 },
  { click: true },
  { wait: 180 },
  { to: box(2), duration: 350 },
  { click: true },
  { wait: 300 },
  { leave: true },
  { wait: 240 },
];

export default function CheckboxTile() {
  usePointer(script);
  return (
    <Column gap={3} align="start">
      <Checkbox label="Email" defaultChecked />
      <Checkbox label="Push" />
    </Column>
  );
}
