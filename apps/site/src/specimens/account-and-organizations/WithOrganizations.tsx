import WithOrganizations from '../../examples/account-and-organizations/WithOrganizations';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';

const organization = (index: number) =>
  `[role="menuitemradio"]:nth-child(${index} of [role="menuitemradio"])`;

/** Opens the menu, then Organization, and picks an organization, which closes the menu. */
const pick = (index: number): PointerStep[] => [
  // Pressed as it arrives, before the avatar's tooltip would open.
  { to: '.env-avatar-button', x: 0.55, y: 0.6, duration: 500 },
  { click: true },
  { wait: 900 },
  { to: '.env-menu-submenu-trigger', x: 0.4, duration: 450 },
  { wait: 700 },
  { to: '.env-menu-submenu-trigger', x: 0.92, duration: 200 },
  { to: organization(index), x: 0.4, duration: 350 },
  { wait: 400 },
  { click: true },
  { wait: 700 },
];

/*
 * The pointer opens the account menu and its Organization submenu, the current one checked, and
 * picks Contoso: the menu closes. Opened again, the menu names Contoso; the pointer switches back
 * to Northwind.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: '.env-avatar-button', x: 0.3, y: 0.9 },
  ...pick(2),
  ...pick(1),
  { leave: true },
  { wait: 700 },
];

function Switching() {
  usePointer(script);
  return (
    // The avatar at the top, with room below it for the menu and beside it for the submenu: the
    // menu and its submenu, rather than the avatar alone, centred, so the submenu and its shadow
    // stay clear of the stage's edge and its pause button.
    <div
      style={{
        inlineSize: 'min(100%, 16rem)',
        blockSize: '17rem',
        marginInlineEnd: 'clamp(0px, 100% - 16rem, 9rem)',
      }}
    >
      <WithOrganizations />
    </div>
  );
}

/** The account menu's Organization submenu, used by a pointer no one sees. */
export default function WithOrganizationsMotion() {
  return (
    <MotionStage label="the organization switching in the account menu">
      <Switching />
    </MotionStage>
  );
}
