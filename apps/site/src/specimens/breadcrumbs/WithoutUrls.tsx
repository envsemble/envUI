import WithoutUrls from '../../examples/breadcrumbs/WithoutUrls';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';

const crumb = (index: number) =>
  `.env-breadcrumbs-item:nth-child(${index} of .env-breadcrumbs-item) > :first-child`;

/*
 * The pointer presses Open beside Interviews: the trail grows by Interviews, its folder is empty.
 * It presses Research in the trail, and the trail shortens to where it began.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: '.env-list-item:nth-child(1 of .env-list-item) .env-button', x: 0.5, y: 0.6 },
  { wait: 400 },
  { click: true },
  { wait: 1700 },
  { to: crumb(3), x: 0.5, y: 0.6, duration: 600 },
  { wait: 400 },
  { click: true },
  { wait: 1300 },
  { leave: true },
  { wait: 700 },
];

function Opening() {
  usePointer(script);
  return (
    // As tall as a folder with its list, so the trail stays put as the folders change.
    <div style={{ inlineSize: 'min(100%, 24rem)', minBlockSize: '13.5rem' }}>
      <WithoutUrls />
    </div>
  );
}

/** A folder opened and left again by a pointer no one sees, the trail growing and shortening. */
export default function WithoutUrlsMotion() {
  return (
    <MotionStage label="the trail growing and shortening">
      <Opening />
    </MotionStage>
  );
}
