import PageProgress from '../../examples/loading/PageProgress';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { useStayOnPage } from '../navigation/StayOnPage';

const place = (href: string) => `.env-navigation-rail-item[href="${href}"]`;

/*
 * The pointer presses Projects in the rail: the top bar's progress runs while Home stays, and
 * Projects arrives. It presses Home, and the same happens on the way back. The example's load
 * takes 1.5 s.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: place('/projects'), x: 1.6, y: 0.5 },
  { to: place('/projects'), x: 0.5, y: 0.4, duration: 450 },
  { wait: 180 },
  { click: true },
  { wait: 2160 },
  { to: place('/'), x: 0.5, y: 0.4, duration: 450 },
  { wait: 180 },
  { click: true },
  { wait: 1920 },
  { to: place('/'), x: 1.6, y: 0.5, duration: 400 },
  { leave: true },
  { wait: 300 },
];

function Going() {
  usePointer(script);
  useStayOnPage();
  return <PageProgress />;
}

/** A whole page on its way, chosen in the rail by a pointer no one sees. */
export default function PageProgressMotion() {
  return (
    <MotionStage label="the next page loading under the top bar" stage="shaded">
      <Going />
    </MotionStage>
  );
}
