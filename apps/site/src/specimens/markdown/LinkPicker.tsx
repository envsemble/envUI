import { useState } from 'react';
import LinkPicker from '../../examples/markdown/LinkPicker';
import type { PointerStep } from '../../motion/pointer/PointerPlan';
import { usePointer } from '../../motion/pointer/PointerPlayback';
import { MotionStage } from '../../figures/MotionStage';
import { Renew } from '../../motion/Renew';

const source = 'textarea.env-markdown-editor-input';
const row = (index: number) => `.env-list-item:nth-child(${index} of .env-list-item) .env-button`;

/*
 * The pointer selects "launch plan" in the notes and presses Insert link: the application's picker
 * opens, and the pointer runs down its documents and chooses Launch plan. The picker closes, and
 * the link is in the source. The notes are then drawn anew as they began (Renew).
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: source, text: 'launch plan', x: 0.05 },
  { wait: 180 },
  { press: true },
  { to: source, text: 'launch plan', x: 0.95, duration: 450 },
  { release: true },
  { wait: 270 },
  { to: '[aria-label="Insert link"]', duration: 500 },
  { wait: 150 },
  { click: true },
  { wait: 420 },
  { to: row(2), x: 0.4, duration: 450 },
  { wait: 210 },
  { to: row(1), x: 0.4, duration: 300 },
  { wait: 270 },
  { click: true },
  { wait: 1320 },
  { leave: true },
  { cue: 'renew' },
  { wait: 360 },
];

function Linking() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    <div style={{ inlineSize: 'min(100%, 30rem)' }}>
      <Renew round={round}>
        <div style={{ inlineSize: '100%' }}>
          <LinkPicker />
        </div>
      </Renew>
    </div>
  );
}

/** A link inserted from the application's picker by a pointer no one sees. */
export default function LinkPickerMotion() {
  return (
    <MotionStage label="a link inserted from the picker" height="24rem">
      <Linking />
    </MotionStage>
  );
}
