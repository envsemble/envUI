import { Slider } from '@envsemble/envui';
import { usePointer, type PointerStep } from '../motion/Motion';

const control = '.env-slider-control';

/*
 * Hovered at its value, which shows the handle and the ruler; pressed there and dragged up, down
 * and back to where it began, and let go.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: control, x: 0.4 },
  { wait: 500 },
  { press: true },
  { to: control, x: 0.72, duration: 800 },
  { wait: 250 },
  { to: control, x: 0.2, duration: 1100 },
  { wait: 250 },
  { to: control, x: 0.4, duration: 700 },
  { release: true },
  { wait: 500 },
  { leave: true },
  { wait: 500 },
];

/** A slider. */
export default function SliderTile() {
  usePointer(script);
  return <Slider label="Volume" defaultValue={40} style={{ inlineSize: '9rem' }} />;
}
