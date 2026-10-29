import { useState } from 'react';
import EditDescription from '../../examples/markdown/EditDescription';
import { usePointer, type PointerStep } from '../../motion/Motion';
import { MotionStage } from '../../motion/MotionStage';
import { Renew } from '../../motion/Renew';

const source = 'textarea.env-markdown-editor-input';
const tab = (index: number) => `[role="tab"]:nth-child(${index} of [role="tab"])`;

/*
 * The pointer types a line into the description, selects "review" and presses Bold, which wraps it
 * in asterisks. It switches to Preview, where the text reads as it will, bold included, and back
 * to Write. The editor is then drawn anew as it began, with a short fade (Renew).
 */
const script: PointerStep[] = [
  { wait: 500 },
  { to: source, x: 0.85, y: 0.75 },
  { wait: 300 },
  { click: true },
  { type: '\n\nAsk Sam Lee to review the copy.', into: source, every: 85 },
  { wait: 500 },
  { to: source, text: 'review', x: 0.1, duration: 450 },
  { wait: 200 },
  { press: true },
  { to: source, text: 'review', x: 0.9, duration: 350 },
  { release: true },
  { wait: 450 },
  { to: '[aria-label="Bold"]', duration: 500 },
  { wait: 250 },
  { click: true },
  { wait: 900 },
  { to: tab(2), duration: 450 },
  { wait: 250 },
  { click: true },
  { wait: 2200 },
  { to: tab(1), duration: 350 },
  { wait: 250 },
  { click: true },
  { wait: 900 },
  { leave: true },
  { cue: 'renew' },
  { wait: 600 },
];

function Writing() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    // As tall as the editor with the line typed, from the start, the editor at its top, so nothing
    // moves as it grows.
    <div style={{ inlineSize: 'min(100%, 30rem)', minBlockSize: '25rem' }}>
      <Renew round={round}>
        <div style={{ inlineSize: '100%' }}>
          <EditDescription />
        </div>
      </Renew>
    </div>
  );
}

/** The description written, formatted and previewed by a pointer no one sees. */
export default function EditDescriptionMotion() {
  return (
    <MotionStage label="the description written and previewed">
      <Writing />
    </MotionStage>
  );
}
