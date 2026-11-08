import { useState } from 'react';
import { ConfirmButton, List } from '@envsemble/envui';
import { useHeldView } from '../../motion/Playback';
import type { PointerStep } from '../../motion/PointerPlan';
import { usePointer } from '../../motion/PointerPlayback';
import { Renew } from '../../motion/Renew';

const people = ['Alex Morgan', 'Sam Lee'];

const remove = '.env-list-item:nth-child(2) button';

/**
 * Remove pressed once, which asks in place, Remove Sam; pressed again, and Sam leaves the list;
 * a while later the list is drawn anew as it began, with a short fade (Renew).
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: remove, x: 0.5 },
  { wait: 300 },
  { click: true },
  { wait: 1100 },
  { to: remove, x: 0.5, duration: 200 },
  { click: true },
  { wait: 300 },
  { leave: true },
  { wait: 1600 },
  { cue: 'renew' },
  { wait: 500 },
];

function Members() {
  const [members, setMembers] = useState(people);
  return (
    <List.Root aria-label="Members" density="sm" style={{ inlineSize: '13rem' }}>
      {members.map((name) => (
        <List.Item
          key={name}
          label={name}
          end={
            <ConfirmButton
              confirmLabel={`Remove ${name.split(' ')[0]}`}
              onConfirm={() => setMembers((current) => current.filter((member) => member !== name))}
            >
              Remove
            </ConfirmButton>
          }
        />
      ))}
    </List.Root>
  );
}

/** Two members with access, each with a button that removes them once confirmed in place. */
export default function ConfirmButtonTile() {
  const [round, setRound] = useState(0);
  useHeldView();
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    <Renew round={round}>
      <Members />
    </Renew>
  );
}
