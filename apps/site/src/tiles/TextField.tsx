import { TextField } from '@envsemble/envui';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';

const input = '.env-text-field-input';

/**
 * Clicks into the field and types a name. A while later it selects the name with a drag and deletes
 * it, so the field is empty again, as it began. Each state holds long enough to read.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: input, x: 0.3 },
  { wait: 300 },
  { click: true },
  { wait: 300 },
  { type: 'Northwind', into: input, every: 110 },
  { wait: 1800 },
  { to: input, text: 'Northwind', x: 0.02, duration: 350 },
  { wait: 200 },
  { press: true },
  { to: input, text: 'Northwind', x: 1, duration: 450 },
  { release: true, stay: true },
  { wait: 1400 },
  { erase: 1, into: input },
  { wait: 1400 },
  { leave: true },
  { wait: 600 },
];

/** A text field with its label. */
export default function TextFieldTile() {
  usePointer(script);
  return <TextField label="Project name" placeholder="Untitled" style={{ inlineSize: '9rem' }} />;
}
