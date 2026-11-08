import { useState } from 'react';
import OpenDocuments from '../../examples/document-tabs/OpenDocuments';
import { Example } from '../../figures/Example';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../motion/MotionStage';
import { Renew } from '../../motion/Renew';

const tab = (index: number) =>
  `.env-document-tabs-item:nth-child(${index} of .env-document-tabs-item)`;

/*
 * The pointer comes onto Decisions.md, and its close button shows, as the active tab's always
 * does. It moves on to Roadmap.md, the active tab, and presses its close button: the tab closes,
 * and Decisions.md, its neighbour, becomes active. Then the example starts anew,
 * and the tab is back.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: `${tab(2)} .env-document-tabs-tab`, x: 0.5, y: 1.8 },
  { to: `${tab(2)} .env-document-tabs-tab`, x: 0.5, y: 0.6, duration: 400 },
  { wait: 1000 },
  { to: `${tab(1)} .env-document-tabs-close`, x: 0.5, y: 0.5, duration: 600 },
  { wait: 400 },
  { click: true },
  { wait: 1700 },
  { leave: true },
  { cue: 'renew' },
  { wait: 700 },
];

function Closing() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    <div style={{ inlineSize: 'min(100%, 40rem)' }}>
      <Renew round={round}>
        <div style={{ inlineSize: '100%' }}>
          <OpenDocuments />
        </div>
      </Renew>
    </div>
  );
}

/** A tab closed by its close button, which shows under the pointer; its neighbour takes over. */
export default function ClosingMotion() {
  return (
    <Example>
      <MotionStage label="a tab closing and its neighbour becoming active">
        <Closing />
      </MotionStage>
    </Example>
  );
}
