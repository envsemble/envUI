import SkeletonOnRefresh from '../../examples/loading/SkeletonOnRefresh';
import { MotionStage } from '../../motion/MotionStage';
import { useRefreshPress } from './Refresh';

function Refreshing() {
  const box = useRefreshPress();
  return (
    <div ref={box} style={{ inlineSize: 'min(100%, 22rem)' }}>
      <SkeletonOnRefresh />
    </div>
  );
}

/** The Rules' don't: Refresh pressed, the activity turns back into a skeleton, in step with the do. */
export default function SkeletonOnRefreshMotion() {
  return (
    <MotionStage label="the activity turned back into a skeleton">
      <Refreshing />
    </MotionStage>
  );
}
