import AvatarMenu from '../../examples/account-and-organizations/AvatarMenu';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';

const item = (index: number) => `.env-menu-item:nth-child(${index} of .env-menu-item)`;

/*
 * The pointer presses the avatar: the account menu opens below it, who is signed in first. The
 * pointer runs down its items to Sign out without pressing, and the menu closes.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: '.env-avatar-button', x: 0.55, y: 0.6 },
  { wait: 450 },
  { click: true },
  { wait: 900 },
  { to: item(1), x: 0.4, duration: 450 },
  { wait: 500 },
  // Past Theme in one move, too quick for its submenu to open.
  { to: item(3), x: 0.4, duration: 400 },
  { wait: 900 },
  { key: 'Escape', on: '.env-menu' },
  { wait: 300 },
  { leave: true },
  { wait: 500 },
];

function Opening() {
  usePointer(script);
  return (
    // The top bar at the stage's top, as in a window, with the room the menu opens into below it.
    <div style={{ inlineSize: '100%', blockSize: '19rem' }}>
      <AvatarMenu />
    </div>
  );
}

/** The overview's top bar, whose avatar opens the account menu for a pointer no one sees. */
export default function AvatarMenuMotion() {
  return (
    <MotionStage label="the account menu opening">
      <Opening />
    </MotionStage>
  );
}
