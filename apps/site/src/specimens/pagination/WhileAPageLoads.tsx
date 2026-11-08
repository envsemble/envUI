import PagesOfAList from '../../examples/pagination/PagesOfAList';
import { SpecimenFrame } from '../../figures/SpecimenFrame';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';

const previous = '.env-pagination-button[data-direction="previous"]';
const next = '.env-pagination-button[data-direction="next"]';

const press = (button: string): PointerStep[] => [
  { click: true },
  { wait: 1500 },
  { to: button, x: 0.5, y: 0.55 },
];

/*
 * The pointer presses Next: a spinner shows on it while the page loads, and the range moves on,
 * 61–120 and so on to the last page, where Next is unavailable. Then it pages back with Previous
 * to the first.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: next, x: 0.5, y: 0.55 },
  { wait: 400 },
  ...press(next),
  ...press(next),
  ...press(next),
  { click: true },
  { wait: 1500 },
  { to: previous, x: 0.5, y: 0.55, duration: 450 },
  { wait: 300 },
  ...press(previous),
  ...press(previous),
  ...press(previous),
  { click: true },
  { wait: 1300 },
  { leave: true },
  { wait: 800 },
];

function Paging() {
  usePointer(script);
  return (
    // The range grows and shrinks as it moves, such as 1–60 and 121–180: the pager sits at the end
    // of a box as wide as the widest, so the buttons under the pointer keep still.
    <div style={{ display: 'grid', justifyItems: 'end', inlineSize: '15rem' }}>
      <PagesOfAList />
    </div>
  );
}

/** The report's pages, loaded one by one by a pointer no one sees, to the end and back. */
export default function WhileAPageLoads() {
  return (
    <SpecimenFrame>
      <MotionStage label="pages loading">
        <Paging />
      </MotionStage>
    </SpecimenFrame>
  );
}
