import NoWayToDetails from '../../examples/panes/NoWayToDetails';
import { MotionStage } from '../../motion/MotionStage';
import { WidthSweep } from '../../motion/WidthSweep';
import { useNarrowing, widths } from './Details';

function Narrowed() {
  const { at } = useNarrowing();
  return (
    <WidthSweep widths={widths} at={at} fit>
      <NoWayToDetails />
    </WidthSweep>
  );
}

/** The roadmap's panes narrowing in step with the do, the details gone with no way back. */
export default function NoWayToDetailsMotion() {
  return (
    <MotionStage label="the panes narrowing, the details gone">
      <Narrowed />
    </MotionStage>
  );
}
