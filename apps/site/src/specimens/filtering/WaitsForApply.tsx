import WaitsForApply from '../../examples/filtering/WaitsForApply';
import { usePointer } from '../../motion/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';
import { statusClock, statusScript } from './Status';

const script = statusScript(true);

function Picking() {
  // On the do's clock: the same choice changes nothing until the pointer presses Apply.
  usePointer(script, { clock: statusClock });
  return (
    // As tall as the longer list, and the same in the do and the don't, so both keep still and in line.
    <div
      style={{
        display: 'grid',
        alignContent: 'start',
        justifyItems: 'center',
        inlineSize: '100%',
        minBlockSize: '14.75rem',
      }}
    >
      <WaitsForApply />
    </div>
  );
}

/** The Rules' don't: the list changes only once Apply is pressed. */
export default function WaitsForApplyMotion() {
  return (
    <MotionStage label="the list waiting for Apply" height="15rem">
      <Picking />
    </MotionStage>
  );
}
