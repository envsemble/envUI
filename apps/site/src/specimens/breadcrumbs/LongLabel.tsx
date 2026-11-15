import OneLine from '../../examples/breadcrumbs/OneLine';
import { SpecimenFrame } from '../../figures/SpecimenFrame';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const script: PointerStep[] = [
  { wait: 300 },
  { to: '.env-breadcrumbs-current', x: 0.45, y: 0.55 },
  { wait: 1680 },
  { leave: true },
  { wait: 660 },
];

function Hovering() {
  usePointer(script);
  return <OneLine />;
}

export default function LongLabel() {
  return (
    <SpecimenFrame>
      <MotionStage label="the whole label in a tooltip" height="10rem">
        <Hovering />
      </MotionStage>
    </SpecimenFrame>
  );
}
