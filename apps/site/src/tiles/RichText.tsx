import { useState } from 'react';
import { RichTextEditor } from '@envsemble/envui/rich-text';
import { useMedia } from '../motion/Autoplay';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import { Renew } from '../motion/Renew';
import { narrowGallery } from './Tiles';

const line = '.ProseMirror p';
/** The line, and the phrase in it that turns bold: short, the same at every width. */
const words = { text: 'Ship the plan', phrase: 'the plan', last: 'plan' };
const bold = '[aria-label="Bold"]';

/*
 * A phrase is selected as a person selects it and Bold is pressed: the phrase turns bold in place,
 * as the editor shows it, with no markup to see; a phrase rather than a word, so the heavier weight
 * reads beside the plain words at a tile's size. A press after it lets the selection go, so the
 * bold phrase shows, and the line is drawn anew as it began, with a short fade (Renew).
 */
const { phrase, last } = words;
const script: PointerStep[] = [
  { wait: 300 },
  { to: line, text: phrase, x: 0, duration: 0 },
  { wait: 250 },
  { press: true },
  { to: line, text: phrase, x: 1, duration: 450 },
  { release: true },
  { wait: 300 },
  { to: bold, duration: 450 },
  { wait: 200 },
  { click: true },
  { wait: 450 },
  { to: line, text: last, x: 1, duration: 400 },
  { click: true },
  { wait: 300 },
  { leave: true },
  { blur: true },
  { wait: 1400 },
  { cue: 'renew' },
  { wait: 500 },
];

/**
 * A rich text editor with its fewest tools, Bold beside undo and redo, over a line whose phrase
 * turns bold; in a phone's tile narrower, its line still one line. Its document is as tall as two
 * lines, as a short note's editor is, and on a phone's lower stage as its one line, so the editor
 * shows whole in a gallery's stage, its edge and focus ring closed below the line.
 */
export default function RichTextTile() {
  const [round, setRound] = useState(0);
  const narrow = useMedia(narrowGallery);
  usePointer(script, {
    onCue: () => setRound((count) => count + 1),
  });
  return (
    <Renew round={round}>
      <RichTextEditor
        aria-label="Launch note"
        defaultValue={words.text}
        toolbar={['bold']}
        variant="ghost"
        minRows={narrow ? 1 : 2}
        style={{ inlineSize: narrow ? '8.5rem' : '12.5rem' }}
      />
    </Renew>
  );
}
