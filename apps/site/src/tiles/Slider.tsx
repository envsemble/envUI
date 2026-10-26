import { Slider } from '@envsemble/envui';
import { useTimeline } from '../previews/Motion';

const steps = [500, 1200, 1200];
const values = [40, 80, 20];

/** A slider, its value moving up and down. */
export default function SliderTile() {
  const step = useTimeline(steps);
  return <Slider label="Volume" value={values[step]} style={{ inlineSize: '9rem' }} />;
}
