import WithoutUrls from '../../examples/breadcrumbs/WithoutUrls';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const crumbLinkOrCurrentPage = ':is(.env-breadcrumbs-link, .env-breadcrumbs-current)';
const crumb = (index: number) =>
  `.env-breadcrumbs-item:nth-child(${index} of .env-breadcrumbs-item) ${crumbLinkOrCurrentPage}`;

const folderWithListHeight = '13.5rem';

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
    <div style={{ inlineSize: 'min(100%, 24rem)', minBlockSize: folderWithListHeight }}>
      <WithoutUrls />
    </div>
  );
}

export default function WithoutUrlsMotion() {
  return (
    <MotionStage label="the trail growing and shortening">
      <Opening />
    </MotionStage>
  );
}
