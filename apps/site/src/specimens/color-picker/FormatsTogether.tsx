import FormatsTogether from '../../examples/color-picker/FormatsTogether';
import { usePointer, type PointerStep } from '../../previews/Motion';
import { MotionStage } from '../../previews/MotionStage';

const area = '.env-color-picker-area';
const thumb = `${area} > .env-color-picker-thumb`;

/*
 * The pointer takes the area's thumb and drags it to a pale violet and on to a deep one: the hex,
 * RGB and HSL rows change together. It drags it back to where it began and lets go.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: thumb },
  { wait: 300 },
  { press: true },
  { to: area, x: 0.22, y: 0.14, duration: 900 },
  { wait: 300 },
  { to: area, x: 0.86, y: 0.52, duration: 1000 },
  { wait: 300 },
  { to: area, x: 0.52, y: 0.36, duration: 800 },
  { release: true },
  { wait: 500 },
  { leave: true },
  { wait: 900 },
];

function Dragging() {
  usePointer(script);
  return <FormatsTogether />;
}

/** The brand color's thumb dragged, and its hex, RGB and HSL rows following together. */
export default function FormatsTogetherMotion() {
  return (
    <MotionStage label="the rows following the dragged color">
      <Dragging />
    </MotionStage>
  );
}
