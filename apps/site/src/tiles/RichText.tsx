import { useState } from 'react';
import { RichTextEditor } from '@envsemble/envui/rich-text';
import { useMedia } from '../motion/Autoplay';
import type { PointerStep } from '../motion/pointer/PointerPlan';
import { usePointer } from '../motion/pointer/PointerPlayback';
import { Renew } from '../motion/Renew';
import { narrowGallery } from './Tiles';

const line = '.ProseMirror p';
const words = { text: 'Ship the plan', phrase: 'the plan', last: 'plan' };
const bold = '[aria-label="Bold"]';

const { phrase, last } = words;
const script: PointerStep[] = [
  { wait: 180 },
  { to: line, text: phrase, x: 0, duration: 0 },
  { wait: 150 },
  { press: true },
  { to: line, text: phrase, x: 1, duration: 450 },
  { release: true },
  { wait: 180 },
  { to: bold, duration: 450 },
  { wait: 120 },
  { click: true },
  { wait: 270 },
  { to: line, text: last, x: 1, duration: 400 },
  { click: true },
  { wait: 180 },
  { leave: true },
  { blur: true },
  { wait: 840 },
  { cue: 'renew' },
  { wait: 300 },
];

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
