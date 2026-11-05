import { useState } from 'react';
import { RichTextEditor } from '@envsemble/envui/rich-text';
import { useMedia } from '../motion/Autoplay';
import { usePointer, type PointerStep } from '../motion/Motion';
import { Renew } from '../motion/Renew';
import { narrowGallery } from './Tiles';

const line = '.ProseMirror p';
/** The line, and the phrase in it that turns bold: on a phone's narrower tile, a shorter line. */
const wide = { text: 'Share the launch plan', phrase: 'launch plan', last: 'plan' };
const short = { text: 'Ship the plan', phrase: 'the plan', last: 'plan' };
const bold = '[aria-label="Bold"]';

/*
 * A phrase is selected as a person selects it and Bold is pressed: the phrase turns bold in place,
 * as the editor shows it, with no markup to see; a phrase rather than a word, so the heavier weight
 * reads beside the plain words at a tile's size. A press after it lets the selection go, so the
 * bold phrase shows, and the line is drawn anew as it began, with a short fade (Renew).
 */
const scriptOf = ({ phrase, last }: typeof wide): PointerStep[] => [
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
const scripts = { wide: scriptOf(wide), short: scriptOf(short) };

/**
 * A rich text editor: its formatting toolbar over a line whose phrase turns bold; in a phone's
 * tile narrower, with Bold alone beside undo and redo, on a shorter line that stays one line, so it
 * is drawn whole at its own size there too.
 */
export default function RichTextTile() {
  const [round, setRound] = useState(0);
  const narrow = useMedia(narrowGallery);
  const words = narrow ? short : wide;
  usePointer(narrow ? scripts.short : scripts.wide, {
    onCue: () => setRound((count) => count + 1),
  });
  return (
    <Renew round={round}>
      <RichTextEditor
        aria-label="Launch note"
        key={words.text}
        defaultValue={words.text}
        toolbar={narrow ? ['bold'] : ['bold', 'italic']}
        style={{ inlineSize: narrow ? '8.5rem' : '12.5rem' }}
      />
    </Renew>
  );
}
