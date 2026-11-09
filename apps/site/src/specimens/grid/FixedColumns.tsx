import FixedColumns from '../../examples/grid/FixedColumns';
import { MotionStage } from '../../figures/MotionStage';
import { WidthSweep } from '../../motion/WidthSweep';
import { paneWidths, usePaneWidth } from './PaneWidth';

function Resizing() {
  return (
    <WidthSweep widths={paneWidths} at={usePaneWidth()} fit>
      <FixedColumns />
    </WidthSweep>
  );
}

/** Three fixed columns in a pane that widens and narrows: narrow, their titles break mid-word. */
export default function FixedColumnsMotion() {
  return (
    <MotionStage label="the pane widening and narrowing">
      <Resizing />
    </MotionStage>
  );
}
