import { ColorPicker } from '@envsemble/envui/color';
import { usePointer, type PointerStep } from '../motion/Motion';

const area = '.env-color-picker-area';
const swatch = (index: number) =>
  `.env-color-picker-swatch:nth-child(${index} of .env-color-picker-swatch)`;

/** Dragged across the colors, a swatch chosen, and the first swatch, its color at the start. */
const script: PointerStep[] = [
  { wait: 300 },
  { to: area, x: 0.72, y: 0.3 },
  { wait: 300 },
  { press: true },
  { to: area, x: 0.35, y: 0.55, duration: 700 },
  { to: area, x: 0.85, y: 0.15, duration: 800 },
  { release: true },
  { wait: 500 },
  { to: swatch(2), duration: 450 },
  { wait: 200 },
  { click: true },
  { wait: 900 },
  { to: swatch(1), duration: 400 },
  { wait: 200 },
  { click: true },
  { wait: 600 },
  { leave: true },
  { wait: 400 },
];

/** A color picker: its colors, its hue and a few swatches. */
export default function ColorPickerTile() {
  usePointer(script);
  return (
    <ColorPicker
      label="Accent color"
      defaultValue="#3b6fd4"
      formats={['hex']}
      swatches={['#3b6fd4', '#2f6f62', '#c2413b']}
      style={{ inlineSize: '12rem' }}
    />
  );
}
