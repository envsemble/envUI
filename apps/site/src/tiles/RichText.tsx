import { useState } from 'react';
import { RichTextEditor } from '@envsemble/envui/rich-text';
import { usePointer, type PointerStep } from '../motion/Motion';
import { Renew } from '../motion/Renew';

const line = '.ProseMirror p';
const bold = '[aria-label="Bold"]';

/*
 * A phrase is selected as a person selects it and Bold is pressed: the phrase turns bold in place,
 * as the editor shows it, with no markup to see; a phrase rather than a word, so the heavier weight
 * reads beside the plain words at a tile's size. A press after it lets the selection go, so the
 * bold phrase shows, and the line is drawn anew as it began, with a short fade (Renew).
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: line, text: 'launch plan', x: 0, duration: 0 },
  { wait: 250 },
  { press: true },
  { to: line, text: 'launch plan', x: 1, duration: 450 },
  { release: true },
  { wait: 300 },
  { to: bold, duration: 450 },
  { wait: 200 },
  { click: true },
  { wait: 450 },
  { to: line, text: 'plan', x: 1, duration: 400 },
  { click: true },
  { wait: 300 },
  { leave: true },
  { blur: true },
  { wait: 1400 },
  { cue: 'renew' },
  { wait: 500 },
];

/** A rich text editor: its formatting toolbar over a line whose phrase turns bold. */
export default function RichTextTile() {
  const [round, setRound] = useState(0);
  usePointer(script, { onCue: () => setRound((count) => count + 1) });
  return (
    <Renew round={round}>
      <RichTextEditor
        aria-label="Launch note"
        defaultValue="Share the launch plan"
        toolbar={['bold', 'italic']}
        style={{ inlineSize: '12.5rem' }}
      />
    </Renew>
  );
}
