import FittingColumns from '../../examples/grid/FittingColumns';
import { MotionStage } from '../../previews/MotionStage';
import { WidthSweep } from '../../previews/WidthSweep';
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
