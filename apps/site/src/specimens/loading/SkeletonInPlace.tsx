import SkeletonInPlace from '../../examples/loading/SkeletonInPlace';
import { useSharedTimeline } from '../../motion/Timeline';
import { MotionStage } from '../../figures/MotionStage';
import { members, membersClock, membersSteps } from './Members';

function Loading() {
  // One clock with the don't beside it, which waits for the same members with a spinner.
  const loaded = useSharedTimeline(membersClock, membersSteps) === 1;
  return (
    <div
      style={{ display: 'grid', justifyItems: 'center', inlineSize: '100%', minBlockSize: '15rem' }}
    >
      <SkeletonInPlace members={loaded ? members : undefined} />
    </div>
  );
}

/** The Rules' do: the list as its skeleton, the members landing in place, in step with the don't. */
export default function SkeletonInPlaceMotion() {
  return (
    <MotionStage label="the members landing in their skeleton">
      <Loading />
    </MotionStage>
  );
}
