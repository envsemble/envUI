import IconSwapsPressed from '../../examples/toolbar/IconSwapsPressed';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { pressing, pressingClock } from './Pressing';

function Pressing() {
  usePointer(pressing, { clock: pressingClock });
  return <IconSwapsPressed />;
}

/** Bold let go and pressed again by a pointer no one sees, in step with the other figure. */
export default function IconSwapsPressedMotion() {
  return (
    <MotionStage label="Bold let go and pressed again">
      <Pressing />
    </MotionStage>
  );
}
