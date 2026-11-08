import DetailsButton from '../../examples/panes/DetailsButton';
import { usePointer } from '../../motion/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';
import { WidthSweep } from '../../motion/WidthSweep';
import { opening, useNarrowing, widths } from './Details';

/** The pointer that opens the details, from the start of its script each time it comes. */
function Pressing() {
  usePointer(opening);
  return null;
}

function Narrowed() {
  const { at, narrow } = useNarrowing();
  return (
    <WidthSweep widths={widths} at={at} fit>
      {narrow && <Pressing />}
      <DetailsButton />
    </WidthSweep>
  );
}

/** The budget's panes narrowing, the details then a sheet that Details opens. */
export default function DetailsButtonMotion() {
  return (
    <MotionStage label="the panes narrowing, the details behind a button">
      <Narrowed />
    </MotionStage>
  );
}
