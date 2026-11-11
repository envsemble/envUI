import FittingColumns from '../../examples/grid/FittingColumns';
import { MotionStage } from '../../figures/MotionStage';
import { WidthSweep } from '../../motion/WidthSweep';
import { paneWidths, usePaneWidth } from './PaneWidth';

function Resizing() {
  return (
    <WidthSweep widths={paneWidths} at={usePaneWidth()} fit>
      <FittingColumns />
    </WidthSweep>
  );
}

/** The fitting grid in a pane that widens and narrows: it gains a column and drops it again. */
export default function FittingColumnsMotion() {
  return (
    <MotionStage label="the pane widening and narrowing">
      <Resizing />
    </MotionStage>
  );
}
