import RefreshInPlace from '../../examples/loading/RefreshInPlace';
import { MotionStage } from '../../previews/MotionStage';
import { Refreshing } from './Refresh';

/** The Rules' do: Refresh pressed, the activity stays with a spinner beside it, in step with the don't. */
export default function RefreshInPlaceMotion() {
  return (
    <MotionStage label="the activity refreshing in place">
      <Refreshing>
        <RefreshInPlace />
      </Refreshing>
    </MotionStage>
  );
}
