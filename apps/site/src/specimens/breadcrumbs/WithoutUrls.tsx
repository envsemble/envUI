import WithoutUrls from '../../examples/breadcrumbs/WithoutUrls';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

// What a crumb shows: a link, or the current page.
const crumbElement = ':is(.env-breadcrumbs-link, .env-breadcrumbs-current)';
const crumb = (index: number) =>
  `.env-breadcrumbs-item:nth-child(${index} of .env-breadcrumbs-item) ${crumbElement}`;

/*
 * The pointer presses Open beside Interviews: the trail grows by Interviews, its folder is empty.
 * It presses Research in the trail, and the trail shortens to where it began.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: '[aria-label="Open Interviews"]', x: 0.5, y: 0.6 },
  { wait: 240 },
  { click: true },
  { wait: 1020 },
  { to: crumb(3), x: 0.5, y: 0.6, duration: 600 },
  { wait: 240 },
  { click: true },
  { wait: 780 },
  { leave: true },
  { wait: 420 },
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
