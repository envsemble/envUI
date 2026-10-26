import WrappingActions from '../../examples/row/WrappingActions';
import { MotionStage } from '../../previews/MotionStage';
import { WidthSweep } from '../../previews/WidthSweep';
import { useNarrowing, widths } from './Narrowing';

function Narrowed() {
  const at = useNarrowing();
  return (
    <WidthSweep widths={widths} at={at}>
      <WrappingActions />
    </WidthSweep>
  );
}

/** The actions in a pane that narrows, in step with the other of the pair. */
export default function WrappingActionsMotion() {
  return (
    <MotionStage label="the pane narrowing, an action wrapping">
      <Narrowed />
    </MotionStage>
  );
}
