import FormatsTogether from '../../examples/color-picker/FormatsTogether';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const area = '.env-color-picker-area';
const thumb = `${area} .env-color-picker-thumb`;

const script: PointerStep[] = [
  { wait: 240 },
  { to: thumb },
  { wait: 180 },
  { press: true },
  { to: area, x: 0.22, y: 0.14, duration: 900 },
  { wait: 180 },
  { to: area, x: 0.86, y: 0.52, duration: 1000 },
  { wait: 180 },
  { to: area, x: 0.52, y: 0.36, duration: 800 },
  { release: true },
  { wait: 300 },
  { leave: true },
  { wait: 540 },
];

function Dragging() {
  usePointer(script);
  return <FormatsTogether />;
}

export default function FormatsTogetherMotion() {
  return (
    <MotionStage label="the rows following the dragged color">
      <Dragging />
    </MotionStage>
  );
}
