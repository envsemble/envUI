import { Column } from '@envsemble/envui';
import Choices from '../../examples/menu/Choices';
import { usePointer, type PointerStep } from '../../previews/Motion';
import { MotionStage } from '../../previews/MotionStage';

const radio = (index: number) =>
  `[role="menuitemradio"]:nth-child(${index} of [role="menuitemradio"])`;
const hiddenFiles = '[role="menuitemcheckbox"]';
const trigger = '.env-button';

/*
 * The pointer opens View and checks Hidden files: the menu stays open, and the line beside it
 * says so. It sorts by Date changed, which closes the menu. Then it puts both back, Hidden files
 * unchecked and the sort by Name, so the loop ends as it began.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: trigger, x: 0.6, y: 0.6 },
  { wait: 350 },
  { click: true },
  { wait: 450 },
  { to: hiddenFiles, x: 0.4, duration: 450 },
  { wait: 400 },
  { click: true },
  { wait: 900 },
  { to: radio(2), x: 0.4, y: 0.3, duration: 400 },
  { wait: 450 },
  { click: true },
  { wait: 1300 },
  { to: trigger, x: 0.6, y: 0.6, duration: 400 },
  { wait: 300 },
  { click: true },
  { wait: 450 },
  { to: hiddenFiles, x: 0.4, duration: 450 },
  { wait: 350 },
  { click: true },
  { wait: 800 },
  { to: radio(1), x: 0.4, duration: 400 },
  { wait: 400 },
  { click: true },
  { wait: 600 },
  { leave: true },
  { wait: 900 },
];

function Choosing() {
  usePointer(script);
  // The menu opens below its trigger, in the room below. The line beside it grows as it changes:
  // the two start at the start of a box as wide as the longest line, so neither moves.
  return (
    <Column style={{ blockSize: '19rem', inlineSize: 'min(100%, 33rem)' }}>
      <Choices />
    </Column>
  );
}

/** View's choices, checked and picked by a pointer no one sees. */
export default function ChoicesMotion() {
  return (
    <MotionStage label="the checkbox and radio items">
      <Choosing />
    </MotionStage>
  );
}
