import { useState } from 'react';
import { RichTextEditor } from '@envsemble/envui/rich-text';
import { usePointer, type PointerStep } from '../motion/Motion';
import { Renew } from '../motion/Renew';

const line = '.ProseMirror p';
const bold = '[aria-label="Bold"]';

/*
 * A word is selected as a person selects it and Bold is pressed: the word turns bold in place, as
 * the editor shows it, with no markup to see. A press after it lets the selection go, so the bold
 * word shows, and the line is drawn anew as it began, with a short fade (Renew).
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: line, text: 'Friday', x: 0, duration: 0 },
  { wait: 250 },
  { press: true },
  { to: line, text: 'Friday', x: 1, duration: 400 },
  { release: true },
  { wait: 300 },
  { to: bold, duration: 450 },
  { wait: 200 },
  { click: true },
  { wait: 450 },
  { to: line, text: 'Friday', x: 1, duration: 400 },
  { click: true },
  { wait: 300 },
  { leave: true },
  { blur: true },
  { wait: 1400 },
  { cue: 'renew' },
  { wait: 500 },
];

/** A rich text editor: its formatting toolbar over a line whose word turns bold. */
export default function RichTextTile() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    <Renew round={round}>
      <RichTextEditor
        aria-label="Launch note"
        defaultValue="Launch on Friday"
        toolbar={['bold', 'italic']}
        style={{ inlineSize: '12.5rem' }}
      />
    </Renew>
  );
}
