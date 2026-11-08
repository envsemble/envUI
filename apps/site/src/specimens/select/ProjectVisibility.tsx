import ProjectVisibility from '../../examples/select/ProjectVisibility';
import type { PointerStep } from '../../motion/PointerPlan';
import { usePointer } from '../../motion/PointerPlayback';
import { MotionStage, rowsAnd } from '../../motion/MotionStage';

const highlighted = '.env-select-item[data-highlighted]';
const item = (index: number) => `.env-select-item:nth-child(${index} of .env-select-item)`;

/*
 * The pointer opens the list; "pr" typed there jumps to Private, and Enter chooses it. The pointer
 * opens the list again and chooses Team, as it began.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: '.env-select-trigger', x: 0.8, y: 0.55 },
  { wait: 400 },
  { click: true },
  { wait: 900 },
  { key: 'p', on: highlighted },
  { wait: 180 },
  { key: 'r', on: highlighted },
  { wait: 1000 },
  { key: 'Enter', on: highlighted },
  { wait: 1300 },
  { click: true },
  { wait: 800 },
  { to: item(1), x: 0.3, y: 0.5, duration: 450 },
  { wait: 400 },
  { click: true },
  { wait: 700 },
  { leave: true },
  { wait: 900 },
];

function Choosing() {
  usePointer(script);
  return <ProjectVisibility />;
}

/** The overview's select, opened, typed into and chosen from by a pointer no one sees. */
export default function ProjectVisibilityMotion() {
  return (
    // As tall as the select with its list open, so the two sit in the middle of the stage.
    <MotionStage
      label="typing in the open list to jump to an option"
      height={rowsAnd(4.375, 4.875)}
      top
    >
      <Choosing />
    </MotionStage>
  );
}
