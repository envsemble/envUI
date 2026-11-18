import { Slider } from '@envsemble/envui';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';

const control = '.env-slider-control';

const script: PointerStep[] = [
  { wait: 180 },
  { to: control, x: 0.4 },
  { wait: 300 },
  { press: true },
  { to: control, x: 0.7, duration: 750 },
  { wait: 150 },
  { to: control, x: 0.2, duration: 1100 },
  { wait: 150 },
  { to: control, x: 0.4, duration: 700 },
  { release: true },
  { wait: 300 },
  { leave: true },
  { wait: 300 },
];

export default function SliderTile() {
  usePointer(script);
  return <Slider label="Volume" defaultValue={40} style={{ inlineSize: '9rem' }} />;
}
