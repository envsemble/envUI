import { useState } from 'react';
import ProjectHealth from '../../examples/key-figures/ProjectHealth';
import { usePointer, type PointerStep } from '../../previews/Motion';
import { MotionStage } from '../../previews/MotionStage';
import { Renew } from '../../previews/Renew';

const add = '.env-button';

/*
 * The pointer presses Add a project twice: Active projects rolls from 128 to 129 and then to 130,
 * and its trend reads +13%, then +14%. Then the figures start anew.
 */
const script: PointerStep[] = [
  { wait: 400 },
  { to: add, x: 0.5, y: 2.2 },
  { to: add, x: 0.5, y: 0.55, duration: 450 },
  { wait: 250 },
  { click: true },
  { wait: 1300 },
  { click: true },
  { wait: 1600 },
  { leave: true },
  { cue: 'renew' },
  { wait: 700 },
];

function Adding() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    <Renew round={round}>
      <div style={{ inlineSize: '100%' }}>
        <ProjectHealth />
      </div>
    </Renew>
  );
}

/** Two projects added by a pointer no one sees: the figure rolls to each new count. */
export default function ProjectHealthMotion() {
  return (
    <MotionStage label="the figure rolling as projects are added">
      <Adding />
    </MotionStage>
  );
}
