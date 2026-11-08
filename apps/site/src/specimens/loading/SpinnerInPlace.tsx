import SpinnerInPlace from '../../examples/loading/SpinnerInPlace';
import { useSharedTimeline } from '../../motion/Timeline';
import { MotionStage } from '../../motion/MotionStage';
import { members, membersClock, membersSteps } from './Members';

function Loading() {
  // On the do's clock: a spinner while the do shows its skeleton, then the members, all at once.
  const loaded = useSharedTimeline(membersClock, membersSteps) === 1;
  return (
    <div
      style={{ display: 'grid', justifyItems: 'center', inlineSize: '100%', minBlockSize: '15rem' }}
    >
      <SpinnerInPlace members={loaded ? members : undefined} />
    </div>
  );
}

/** The Rules' don't: a spinner where the members will be, which jumps as they land. */
export default function SpinnerInPlaceMotion() {
  return (
    <MotionStage label="the members landing where a spinner was">
      <Loading />
    </MotionStage>
  );
}
