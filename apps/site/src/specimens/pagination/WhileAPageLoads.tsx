import PagesOfAList from '../../examples/pagination/PagesOfAList';
import { SpecimenFrame } from '../../figures/SpecimenFrame';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const previous = '.env-pagination-button[data-direction="previous"]';
const next = '.env-pagination-button[data-direction="next"]';

const press = (button: string): PointerStep[] => [
  { click: true },
  { wait: 900 },
  { to: button, x: 0.5, y: 0.55 },
];

const script: PointerStep[] = [
  { wait: 300 },
  { to: next, x: 0.5, y: 0.55 },
  { wait: 240 },
  ...press(next),
  ...press(next),
  ...press(next),
  { click: true },
  { wait: 900 },
  { to: previous, x: 0.5, y: 0.55, duration: 450 },
  { wait: 180 },
  ...press(previous),
  ...press(previous),
  ...press(previous),
  { click: true },
  { wait: 780 },
  { leave: true },
  { wait: 480 },
];

const widestRangeWidth = '15rem';

function Paging() {
  usePointer(script);
  return (
    <div style={{ display: 'grid', justifyItems: 'end', inlineSize: widestRangeWidth }}>
      <PagesOfAList />
    </div>
  );
}

export default function WhileAPageLoads() {
  return (
    <SpecimenFrame>
      <MotionStage label="pages loading">
        <Paging />
      </MotionStage>
    </SpecimenFrame>
  );
}
