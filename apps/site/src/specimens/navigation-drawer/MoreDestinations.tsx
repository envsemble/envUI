import MoreDestinations from '../../examples/navigation-drawer/MoreDestinations';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const more = '.env-navigation-bar-more';
const inbox = '.env-navigation-bar-item[aria-label="Inbox, 4 new"]';

/*
 * Inbox is current. The pointer presses More: its menu opens with the other three destinations,
 * and the pointer picks Archive. More now holds the current page and takes the current fill.
 * Then the pointer presses Inbox, and the fill goes back to it.
 */
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
    // Its menu opens above the bar, as at the bottom of a phone's screen.
    <div
      style={{ display: 'grid', alignContent: 'end', inlineSize: '100%', minBlockSize: '14rem' }}
    >
      <div style={{ display: 'grid', justifyItems: 'center' }}>
        <MoreDestinations />
      </div>
    </div>
  );
}

/** More, opened by a pointer no one sees, which picks a destination from it. */
export default function MoreDestinationsMotion() {
  return (
    <MotionStage label="More opening and taking the current fill" stage="shaded">
      <Picking />
    </MotionStage>
  );
}
