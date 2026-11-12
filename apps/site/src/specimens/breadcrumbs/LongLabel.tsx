import OneLine from '../../examples/breadcrumbs/OneLine';
import { SpecimenFrame } from '../../figures/SpecimenFrame';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

/* The pointer rests on the current page, cut short, and its tooltip shows the whole name. */
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

/** A trail on one line, its cut-short current page shown whole in a tooltip on hover. */
export default function LongLabel() {
  return (
    <SpecimenFrame>
      <MotionStage label="the whole label in a tooltip" height="10rem">
        <Hovering />
      </MotionStage>
    </SpecimenFrame>
  );
}
