import SkeletonOnRefresh from '../../examples/loading/SkeletonOnRefresh';
import { MotionStage } from '../../previews/MotionStage';
import { Refreshing } from './Refresh';

/** The Rules' don't: Refresh pressed, the activity turns back into a skeleton, in step with the do. */
export default function SkeletonOnRefreshMotion() {
  return (
    <MotionStage label="the activity turned back into a skeleton">
      <Refreshing>
        <SkeletonOnRefresh />
      </Refreshing>
    </MotionStage>
  );
}
