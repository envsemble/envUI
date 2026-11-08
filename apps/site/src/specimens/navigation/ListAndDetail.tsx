import ListAndDetail from '../../examples/navigation/ListAndDetail';
import type { PointerStep } from '../../motion/PointerPlan';
import { usePointer } from '../../motion/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';
import { useStayOnPage } from './StayOnPage';

const project = '.env-list-item:nth-child(1 of .env-list-item) a';
const back = '.env-panes-back .env-button';

/*
 * The pointer opens Website refresh: its detail takes the list's place, with a back button that
 * names where it goes. It presses back, and the list returns.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: project, x: 0.5, y: 2.5 },
  { to: project, x: 0.5, y: 0.6, duration: 450 },
  { wait: 300 },
  { click: true },
  { wait: 1900 },
  { to: back, x: 0.5, y: 0.6, duration: 550 },
  { wait: 300 },
  { click: true },
  { wait: 900 },
  { leave: true },
  { wait: 800 },
];

function Opening() {
  usePointer(script);
  useStayOnPage();
  return <ListAndDetail />;
}

/** A list as narrow as a phone, whose detail a pointer no one sees opens in its place and leaves. */
export default function ListAndDetailMotion() {
  return (
    <MotionStage label="the detail opening in the list's place">
      <Opening />
    </MotionStage>
  );
}
