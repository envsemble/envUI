import ShortTabLabels from '../../examples/panel-dock/ShortTabLabels';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';

/* The pointer rests on the short tab, and its tooltip gives the full title. */
const script: PointerStep[] = [
  { wait: 500 },
  { to: '.env-panel-dock-tab-restore[aria-label="Show Budget"]', x: 0.45, y: 0.6 },
  { wait: 2600 },
  { leave: true },
  { wait: 1000 },
];

function Hovering() {
  usePointer(script);
  // As wide as the stage: the dock fills its region, which has no width of its own.
  return (
    <div style={{ inlineSize: '100%' }}>
      <ShortTabLabels />
    </div>
  );
}

/** The short tab, its full title in a tooltip as a pointer no one sees rests on it. */
export default function ShortTabLabelsMotion() {
  return (
    <MotionStage label="the full title in the tab's tooltip">
      <Hovering />
    </MotionStage>
  );
}
