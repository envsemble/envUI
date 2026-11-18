import { TextField } from '@envsemble/envui';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';

const input = '.env-text-field-input';

const script: PointerStep[] = [
  { wait: 180 },
  { to: input, x: 0.3 },
  { wait: 180 },
  { click: true },
  { wait: 180 },
  { type: 'Northwind', into: input, every: 110 },
  { wait: 1080 },
  { to: input, text: 'Northwind', x: 0.02, duration: 350 },
  { wait: 120 },
  { press: true },
  { to: input, text: 'Northwind', x: 1, duration: 450 },
  { release: true, stay: true },
  { wait: 840 },
  { erase: 1, into: input },
  { wait: 840 },
  { leave: true },
  { wait: 360 },
];

export default function TextFieldTile() {
  usePointer(script);
  return <TextField label="Project name" placeholder="Untitled" style={{ inlineSize: '9rem' }} />;
}
