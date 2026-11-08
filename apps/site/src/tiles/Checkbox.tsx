import { Checkbox, Column } from '@envsemble/envui';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';

const box = (index: number) =>
  `.env-checkbox:nth-child(${index} of .env-checkbox) .env-checkbox-input`;

/** The second checked, the first cleared, and both put back. */
const script: PointerStep[] = [
  { wait: 300 },
  { to: box(2) },
  { wait: 400 },
  { click: true },
  { wait: 700 },
  { to: box(1), duration: 350 },
  { wait: 200 },
  { click: true },
  { wait: 1000 },
  { click: true },
  { wait: 300 },
  { to: box(2), duration: 350 },
  { click: true },
  { wait: 500 },
  { leave: true },
  { wait: 400 },
];

/** Two checkboxes, one checked. */
export default function CheckboxTile() {
  usePointer(script);
  return (
    <Column gap={3} align="start">
      <Checkbox label="Email" defaultChecked />
      <Checkbox label="Push" />
    </Column>
  );
}
