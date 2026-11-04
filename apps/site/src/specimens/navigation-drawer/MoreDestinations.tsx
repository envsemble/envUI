import MoreDestinations from '../../examples/navigation-drawer/MoreDestinations';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';

const place = (index: number) => `.env-navigation-bar-list > li:nth-child(${index}) > *`;

/*
 * Inbox is current. The pointer presses More: its menu opens with the other three destinations,
 * and the pointer picks Archive. More now holds the current page and takes the current fill.
 * Then the pointer presses Inbox, and the fill goes back to it.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: place(5), x: 0.5, y: 0.5 },
  { wait: 400 },
  { click: true },
  { wait: 800 },
  { to: '[role="menuitem"]:nth-child(2 of [role="menuitem"])', x: 0.4, y: 0.5, duration: 550 },
  { wait: 350 },
  { click: true },
  { wait: 1500 },
  { to: place(2), x: 0.5, y: 0.5, duration: 650 },
  { wait: 300 },
  { click: true },
  { wait: 900 },
  { leave: true },
  { wait: 600 },
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
