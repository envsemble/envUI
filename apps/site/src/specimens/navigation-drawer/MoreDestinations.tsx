import MoreDestinations from '../../examples/navigation-drawer/MoreDestinations';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const more = '.env-navigation-bar-more';
const inbox = '.env-navigation-bar-item[aria-label="Inbox, 4 new"]';

const script: PointerStep[] = [
  { wait: 300 },
  { to: more, x: 0.5, y: 0.5 },
  { wait: 240 },
  { click: true },
  { wait: 480 },
  { to: '[role="menuitem"]:nth-child(2 of [role="menuitem"])', x: 0.4, y: 0.5, duration: 550 },
  { wait: 210 },
  { click: true },
  { wait: 900 },
  { to: inbox, x: 0.5, y: 0.5, duration: 650 },
  { wait: 180 },
  { click: true },
  { wait: 540 },
  { leave: true },
  { wait: 360 },
];

function Picking() {
  usePointer(script);
  return (
    <div
      style={{ display: 'grid', alignContent: 'end', inlineSize: '100%', minBlockSize: '14rem' }}
    >
      <div style={{ display: 'grid', justifyItems: 'center' }}>
        <MoreDestinations />
      </div>
    </div>
  );
}

export default function MoreDestinationsMotion() {
  return (
    <MotionStage label="More opening and taking the current fill" stage="shaded">
      <Picking />
    </MotionStage>
  );
}
