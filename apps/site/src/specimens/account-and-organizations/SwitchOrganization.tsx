import { useState } from 'react';
import SwitchOrganization from '../../examples/account-and-organizations/SwitchOrganization';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';
import { Renew } from '../../motion/Renew';

const organization = (index: number) =>
  `[role="menuitemradio"]:nth-child(${index} of [role="menuitemradio"])`;

/** Opens the switcher and picks an organization, which closes it. */
const pick = (index: number): PointerStep[] => [
  { to: '.env-button', x: 0.5, y: 0.6, duration: 500 },
  { wait: 350 },
  { click: true },
  { wait: 1100 },
  { to: organization(index), x: 0.35, duration: 450 },
  { wait: 450 },
  { click: true },
  { wait: 1100 },
];

/*
 * The pointer opens the switcher, each organization with the person's role under it and Create
 * organization at the end, and picks Contoso: the button names it. Then it switches back, and the
 * example is drawn anew without the message the switch left.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: '.env-button', x: 0.5, y: 1.4 },
  ...pick(2),
  ...pick(1),
  // The switch's message goes, as the example is drawn anew.
  { cue: 'renew' },
  { leave: true },
  { wait: 700 },
];

function Switching() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    // The switcher at the top, with room below it for its menu.
    <div
      style={{ display: 'grid', justifyItems: 'center', inlineSize: '100%', blockSize: '24rem' }}
    >
      <Renew round={round}>
        <SwitchOrganization />
      </Renew>
    </div>
  );
}

/** The organization switcher, used by a pointer no one sees. */
export default function SwitchOrganizationMotion() {
  return (
    <MotionStage label="the organization switcher">
      <Switching />
    </MotionStage>
  );
}
