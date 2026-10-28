import { Column } from '@envsemble/envui';
import IconsAndShortcuts from '../../examples/menu/IconsAndShortcuts';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';

const item = (index: number) => `.env-menu-item:nth-child(${index} of .env-menu-item)`;

/*
 * The pointer opens the menu from its button and runs down its items, with their icons and
 * shortcuts, past the one that is unavailable, to Delete; Esc closes it.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: '.env-icon-button', x: 0.6, y: 0.6 },
  { wait: 450 },
  { click: true },
  { wait: 500 },
  { to: item(1), x: 0.3, duration: 400 },
  { wait: 550 },
  { to: item(2), x: 0.3, duration: 260 },
  { wait: 550 },
  { to: item(3), x: 0.3, duration: 260 },
  { wait: 550 },
  { to: item(4), x: 0.3, duration: 260 },
  { wait: 650 },
  { to: item(5), x: 0.3, duration: 300 },
  { wait: 700 },
  { key: 'Escape', on: '.env-menu' },
  { wait: 300 },
  { leave: true },
  { wait: 900 },
];

function Running() {
  usePointer(script);
  // The menu opens below its button: the two together sit in the middle of the stage.
  return (
    <Column align="center" style={{ blockSize: '18rem' }}>
      <IconsAndShortcuts />
    </Column>
  );
}

/** The overview's menu, opened, run down and closed by a pointer no one sees. */
export default function IconsAndShortcutsMotion() {
  return (
    <MotionStage label="the menu opening and its items">
      <Running />
    </MotionStage>
  );
}
