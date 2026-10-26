import SqueezedActions from '../../examples/row/SqueezedActions';
import { MotionStage } from '../../previews/MotionStage';
import { Narrowing } from './Narrowing';

/** The actions in a pane that narrows, in step with the other of the pair. */
export default function SqueezedActionsMotion() {
  return (
    <MotionStage label="the pane narrowing, the labels breaking">
      <Narrowing>
        <SqueezedActions />
      </Narrowing>
    </MotionStage>
  );
}
