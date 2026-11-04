import { TextField } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';

const input = '.env-text-field-input';

/** Clicked into, a name typed and, a moment later, erased again. */
const script: PointerStep[] = [
  { wait: 300 },
  { to: input, x: 0.3 },
  { wait: 300 },
  { click: true },
  { wait: 300 },
  { type: 'Northwind', into: input, every: 110 },
  { wait: 1200 },
  { erase: 9, into: input, every: 50 },
  { wait: 300 },
  { leave: true },
  { wait: 500 },
];

/** A text field with its label. */
export default function TextFieldTile() {
  usePointer(script);
  return <TextField label="Project name" placeholder="Untitled" style={{ inlineSize: '9rem' }} />;
}
