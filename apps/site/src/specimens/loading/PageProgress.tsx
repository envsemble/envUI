import PageProgress from '../../examples/loading/PageProgress';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';
import { useStayOnPage } from '../navigation/StayOnPage';

const place = (index: number) => `.env-rail-list > li:nth-child(${index}) .env-rail-item`;

/*
 * The pointer presses Projects in the rail: the top bar's progress runs while Home stays, and
 * Projects arrives. It presses Home, and the same happens on the way back. The example's load
 * takes 1.5 s; the waits here are paced to 0.6 of what they say.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: place(2), x: 1.6, y: 0.5 },
  { to: place(2), x: 0.5, y: 0.4, duration: 450 },
  { wait: 300 },
  { click: true },
  { wait: 3600 },
  { to: place(1), x: 0.5, y: 0.4, duration: 450 },
  { wait: 300 },
  { click: true },
  { wait: 3200 },
  { to: place(1), x: 1.6, y: 0.5, duration: 400 },
  { leave: true },
  { wait: 500 },
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
