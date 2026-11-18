import { ColorPicker } from '@envsemble/envui/color';
import { useMedia } from '../motion/Autoplay';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import { narrowGallery } from './Tiles';

const area = '.env-color-picker-area';
const hue = '.env-color-picker-slider .env-color-picker-track';

const script: PointerStep[] = [
  { wait: 180 },
  { to: area, x: 0.72, y: 0.3 },
  { wait: 150 },
  { press: true },
  { to: area, x: 0.4, y: 0.5, duration: 600 },
  { to: area, x: 0.85, y: 0.2, duration: 600 },
  { release: true },
  { wait: 180 },
  { to: hue, y: 0.66, duration: 400 },
  { wait: 90 },
  { press: true },
  { to: hue, y: 0.9, duration: 600 },
  { release: true },
  { wait: 240 },
  { leave: true },
  { wait: 240 },
];

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
