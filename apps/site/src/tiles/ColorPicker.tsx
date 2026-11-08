import { ColorPicker } from '@envsemble/envui/color';
import { useMedia } from '../motion/Autoplay';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import { narrowGallery } from './Tiles';

const area = '.env-color-picker-area';
const hue = '.env-color-picker-slider .env-color-picker-track';

/**
 * Drags across the colors, then along the hue. Each change shows in the area and its thumb, the
 * hue's thumb and the value below them.
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
 * A compact color picker: its colors and its hue shown whole in the tile, above the value they
 * make. Its square area is as tall as it is wide, so the picker is drawn a little smaller, just
 * wide enough that the value keeps a whole row below it in a gallery's low tile. Its label and its
 * copy button are visually hidden, so the value has the row; the label still names the picker. In a
 * phone's lower tile its colors are smaller still and its eye dropper is left out, so the value
 * shows whole below them.
 */
export default function ColorPickerTile() {
  const narrow = useMedia(narrowGallery);
  usePointer(script);
  return (
    <ColorPicker
      label="Accent color"
      visibleLabel={false}
      defaultValue="#3b6fd4"
      formats={['hex']}
      copyable={false}
      eyeDropper={!narrow}
      style={{ inlineSize: narrow ? '4.5rem' : '6rem' }}
    />
  );
}
