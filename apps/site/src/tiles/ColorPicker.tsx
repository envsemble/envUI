import { ColorPicker } from '@envsemble/envui/color';
import { usePointer, type PointerStep } from '../motion/Motion';

const area = '.env-color-picker-area';
const hue = '.env-color-picker-slider .env-color-picker-track';

/**
 * Dragged across the colors, then along the hue: each change shows in the area and its thumb, the
 * hue's thumb and the value under them.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: area, x: 0.72, y: 0.3 },
  { wait: 250 },
  { press: true },
  { to: area, x: 0.4, y: 0.5, duration: 600 },
  { to: area, x: 0.85, y: 0.2, duration: 600 },
  { release: true },
  { wait: 300 },
  { to: hue, y: 0.66, duration: 400 },
  { wait: 150 },
  { press: true },
  { to: hue, y: 0.9, duration: 600 },
  { release: true },
  { wait: 400 },
  { leave: true },
  { wait: 400 },
];

/**
 * A compact color picker: its colors and its hue whole in the tile, over the value they make. Its
 * square area is as tall as it is wide, so the picker is drawn a little smaller, as wide as leaves
 * the value its whole row under it in a gallery's low tile. Its label is left out of sight, as is
 * its copy button, so the value has the row; the label still names the picker.
 */
export default function ColorPickerTile() {
  usePointer(script);
  return (
    <ColorPicker
      label="Accent color"
      showLabel={false}
      defaultValue="#3b6fd4"
      formats={['hex']}
      copyable={false}
      style={{ inlineSize: '6rem', zoom: 0.86 }}
    />
  );
}
