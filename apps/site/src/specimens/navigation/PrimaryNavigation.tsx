import PrimaryNavigation from '../../examples/navigation/PrimaryNavigation';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { useStayOnPage } from './StayOnPage';

/** A destination in the navigation the frame shows at its width: the rail, or the bar. */
const place = (href: string) =>
  `:is(.env-navigation-rail-item, .env-navigation-bar-item)[href="${href}"]`;

/*
 * The pointer taps Inbox, then Documents, then Projects again: the current marker and its filled
 * icon move with each tap, and the page's title changes with it.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: place('/inbox'), x: 1.8, y: 0.5 },
  { to: place('/inbox'), x: 0.5, y: 0.4, duration: 450 },
  { wait: 150 },
  { click: true },
  { wait: 780 },
  { to: place('/documents'), x: 0.5, y: 0.4, duration: 500 },
  { wait: 150 },
  { click: true },
  { wait: 780 },
  { to: place('/projects'), x: 0.5, y: 0.4, duration: 450 },
  { wait: 150 },
  { click: true },
  { wait: 540 },
  { to: place('/projects'), x: 1.8, y: 0.5, duration: 400 },
  { leave: true },
  { wait: 540 },
];

function Moving() {
  usePointer(script);
  useStayOnPage();
  return <PrimaryNavigation />;
}

/** The one primary navigation, its current place moved by a pointer no one sees. */
export default function PrimaryNavigationMotion() {
  return (
    <MotionStage label="the current place moving in the navigation" stage="shaded">
      <Moving />
    </MotionStage>
  );
}
