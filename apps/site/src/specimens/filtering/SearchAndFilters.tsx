import SearchAndFilters from '../../examples/filtering/SearchAndFilters';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';

const search = '.env-page-header-toolbar input';
const status = '.env-page-header-toolbar .env-select-trigger';
const active = '.env-select-item:nth-child(2)';
const clear = '.env-page-header-toolbar .env-button[data-variant="text"]';

/*
 * The pointer types "web" into the search: the list narrows to two projects, "2 projects of 6". It
 * picks Active: one is left. Then it presses Clear filters, and all six are back.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: search, x: 0.45, y: 2.6 },
  { to: search, x: 0.45, y: 0.5, duration: 450 },
  { wait: 200 },
  { click: true },
  { wait: 150 },
  { type: 'web', into: search, every: 170 },
  { wait: 1200 },
  { to: status, x: 0.45, y: 0.55, duration: 550 },
  { wait: 200 },
  { click: true },
  { wait: 450 },
  { to: active, x: 0.4, y: 0.5, duration: 350 },
  { wait: 200 },
  { click: true },
  { wait: 1400 },
  { to: clear, x: 0.5, y: 0.55, duration: 550 },
  { wait: 250 },
  { click: true },
  { wait: 900 },
  { leave: true },
  { wait: 400 },
];

function Filtering() {
  usePointer(script);
  return (
    // A bounded view of the results, as tall as the header and three or four projects (taller in a
    // narrow window, where the toolbar wraps): the list narrowing leaves little room empty, and a
    // longer list runs on past the view's foot, fading out.
    <div
      style={{
        display: 'grid',
        alignContent: 'start',
        inlineSize: '100%',
        blockSize: 'max(21rem, 31rem - 10vw)',
        overflow: 'clip',
        maskImage: 'linear-gradient(to bottom, #000 calc(100% - 3rem), transparent)',
      }}
    >
      <SearchAndFilters />
    </div>
  );
}

/** The projects searched and filtered by a pointer no one sees, then cleared. */
export default function SearchAndFiltersMotion() {
  return (
    <MotionStage label="the projects searched, filtered and cleared">
      <Filtering />
    </MotionStage>
  );
}
