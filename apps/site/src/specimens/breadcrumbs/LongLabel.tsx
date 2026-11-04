import OneLine from '../../examples/breadcrumbs/OneLine';
import { Example } from '../../figures/Example';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';

/* The pointer rests on the current page, cut short, and its tooltip shows the whole name. */
const script: PointerStep[] = [
  { wait: 500 },
  { to: '.env-breadcrumbs-current', x: 0.45, y: 0.55 },
  { wait: 2800 },
  { leave: true },
  { wait: 1100 },
];

function Hovering() {
  usePointer(script);
  return <OneLine />;
}

/** A trail on one line, its cut-short current page shown whole in a tooltip on hover. */
export default function LongLabel() {
  return (
    <Example>
      <MotionStage label="the whole label in a tooltip" height="10rem">
        <Hovering />
      </MotionStage>
    </Example>
  );
}
