import SqueezedActions from '../../examples/row/SqueezedActions';
import { MotionStage } from '../../motion/MotionStage';
import { WidthSweep } from '../../motion/WidthSweep';
import { useNarrowing, widths } from './Narrowing';

function Narrowed() {
  const at = useNarrowing();
  return (
    <WidthSweep widths={widths} at={at}>
      <SqueezedActions />
    </WidthSweep>
  );
}

/** The actions in a pane that narrows, in step with the other of the pair. */
export default function SqueezedActionsMotion() {
  return (
    <MotionStage label="the pane narrowing, the labels breaking">
      <Narrowed />
    </MotionStage>
  );
}
