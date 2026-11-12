import RefreshInPlace from '../../examples/loading/RefreshInPlace';
import { MotionStage } from '../../figures/MotionStage';
import { useRefreshPress } from './Refresh';

function Refreshing() {
  const box = useRefreshPress();
  return (
    <div ref={box} style={{ inlineSize: 'min(100%, 22rem)' }}>
      <RefreshInPlace />
    </div>
  );
}

/** The Rules' do: Refresh pressed, the activity stays with a spinner beside it, in step with the don't. */
export default function RefreshInPlaceMotion() {
  return (
    <MotionStage label="the activity refreshing in place">
      <Refreshing />
    </MotionStage>
  );
}
