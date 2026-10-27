import { useState } from 'react';
import OpenDocuments from '../../examples/document-tabs/OpenDocuments';
import { Example } from '../../previews/Example';
import { usePointer, type PointerStep } from '../../previews/Motion';
import { MotionStage } from '../../previews/MotionStage';
import { Renew } from '../../previews/Renew';

const tab = (index: number) =>
  `.env-document-tabs-item:nth-child(${index} of .env-document-tabs-item) .env-document-tabs-tab`;

/*
 * Interviews.md is a preview, its label in italics. The pointer double-clicks it, and it is kept:
 * its label turns upright. Then the pointer drags Decisions.md past it, a marker showing where it
 * will land, and drops it there. Then the example starts anew.
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: tab(3), x: 0.5, y: 1.6 },
  { to: tab(3), x: 0.5, y: 0.6, duration: 450 },
  { wait: 450 },
  { click: true },
  { wait: 120 },
  { click: true },
  { wait: 1200 },
  { to: tab(2), x: 0.5, y: 0.6, duration: 550 },
  { wait: 300 },
  { press: true },
  { to: tab(3), x: 0.4, y: 0.6, duration: 600 },
  { to: tab(3), x: 0.85, y: 0.6, duration: 500 },
  { wait: 600 },
  { release: true },
  { wait: 1500 },
  { leave: true },
  { cue: 'renew' },
  { wait: 700 },
];

function Arranging() {
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

/** A preview tab kept by a double click, then a tab dragged into a new place. */
export default function PreviewAndReorderMotion() {
  return (
    <Example>
      <MotionStage label="a preview tab kept and a tab dragged into place">
        <Arranging />
      </MotionStage>
    </Example>
  );
}
