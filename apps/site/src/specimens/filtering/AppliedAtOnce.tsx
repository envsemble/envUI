import AppliedAtOnce from '../../examples/filtering/AppliedAtOnce';
import { usePointer } from '../../motion/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';
import { statusClock, statusScript } from './Status';

const script = statusScript(false);

function Picking() {
  // On one clock with the don't beside it, which waits for Apply.
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
      <AppliedAtOnce />
    </div>
  );
}

/** The Rules' do: picking Active narrows the list and its count at once. */
export default function AppliedAtOnceMotion() {
  return (
    <MotionStage label="the list narrowing as Active is picked" height="15rem">
      <Picking />
    </MotionStage>
  );
}
