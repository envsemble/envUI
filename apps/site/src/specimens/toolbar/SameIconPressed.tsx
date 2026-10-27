import SameIconPressed from '../../examples/toolbar/SameIconPressed';
import { usePointer } from '../../previews/Motion';
import { MotionStage } from '../../previews/MotionStage';
import { pressing, pressingClock } from './Pressing';

function Pressing() {
  usePointer(pressing, { clock: pressingClock });
  return <SameIconPressed />;
}

/** Bold let go and pressed again by a pointer no one sees, in step with the other figure. */
export default function SameIconPressedMotion() {
  return (
    <MotionStage label="Bold let go and pressed again">
      <Pressing />
    </MotionStage>
  );
}
