import WrappingActions from '../../examples/row/WrappingActions';
import { MotionStage } from '../../previews/MotionStage';
import { Narrowing } from './Narrowing';

/** The actions in a pane that narrows, in step with the other of the pair. */
export default function WrappingActionsMotion() {
  return (
    <MotionStage label="the pane narrowing, an action wrapping">
      <Narrowing>
        <WrappingActions />
      </Narrowing>
    </MotionStage>
  );
}
