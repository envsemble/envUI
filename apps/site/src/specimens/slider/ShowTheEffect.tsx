import ShowTheEffect from '../../examples/slider/ShowTheEffect';
import { usePointer, type PointerStep } from '../../previews/Motion';
import { MotionStage } from '../../previews/MotionStage';

const control = '.env-slider-control';

/*
 * The pointer drags the layer's opacity down from 60%, the layer fading with it, then up past where
 * it began, the layer filling in, and back to 60%.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: control, x: 0.6 },
  { wait: 300 },
  { press: true },
  { to: control, x: 0.15, duration: 1100 },
  { wait: 400 },
  { to: control, x: 0.95, duration: 1400 },
  { wait: 400 },
  { to: control, x: 0.6, duration: 800 },
  { release: true },
  { wait: 600 },
  { leave: true },
  { wait: 700 },
];

function Dragging() {
  usePointer(script);
  return <ShowTheEffect />;
}

/** The layer's opacity dragged by a pointer no one sees, the layer fading and filling in with it. */
export default function ShowTheEffectMotion() {
  return (
    <MotionStage label="the layer fading as the slider moves">
      <Dragging />
    </MotionStage>
  );
}
