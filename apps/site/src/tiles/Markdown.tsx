import { useLayoutEffect, useRef, useState } from 'react';
import { Markdown } from '@envsemble/envui/content';
import { usePointer, type PointerStep } from '../previews/Motion';

const word = '.md';
/** The source as it is written, step by step: the word, wrapped once, and wrapped twice. */
const sources = [word, `\\*${word}\\*`, `\\*\\*${word}\\*\\*`];

const text = '[data-view="source"] p';

/*
 * The word is selected as a person selects it, from just before it to its end, and wrapped in
 * asterisks one pair at a time, as an editor wraps a selection when an asterisk is typed: it reads
 * **.md**. The source then gives way to the word rendered, bold, and back to the word as it began.
 */
const script: PointerStep[] = [
  { wait: 300 },
  { to: text, text: word, x: 0, duration: 0 },
  { wait: 250 },
  { press: true },
  { to: text, text: word, x: 1, duration: 350 },
  { release: true },
  { leave: true },
  { wait: 350 },
  { cue: 'wrap' },
  { wait: 260 },
  { cue: 'wrap' },
  { wait: 750 },
  { cue: 'render' },
  { wait: 1600 },
  { cue: 'reset' },
  { wait: 700 },
];

/**
 * The source and the rendered word, one over the other, giving way to each other with a short
 * fade; the one not shown lets the pointer through to the other.
 */
const layer = { gridArea: '1 / 1', transition: 'opacity 300ms ease' };

/**
 * The word `.md` written in Markdown: selected, wrapped in `**` and rendered bold, through the
 * Markdown component in both views, one over the other, centred, so the word stays in place.
 */
export default function MarkdownTile() {
  const [wraps, setWraps] = useState(0);
  const [rendered, setRendered] = useState(false);
  const source = useRef<HTMLDivElement>(null);
  usePointer(script, {
    onCue: (cue) => {
      if (cue === 'wrap') setWraps((count) => Math.min(count + 1, 2));
      else if (cue === 'render') setRendered(true);
      else {
        setRendered(false);
        setWraps(0);
      }
    },
  });
  // The word stays selected as the asterisks go round it, as an editor keeps a selection it wraps.
  useLayoutEffect(() => {
    const node = source.current?.querySelector('p')?.firstChild;
    const highlights = typeof CSS !== 'undefined' && 'highlights' in CSS ? CSS.highlights : null;
    const shown = highlights?.get('catalogue-selection');
    if (!wraps || rendered || !node || !shown) return;
    const range = document.createRange();
    range.setStart(node, wraps);
    range.setEnd(node, wraps + word.length);
    shown.add(range);
    return () => void shown.delete(range);
  }, [wraps, rendered]);
  return (
    <div style={{ display: 'grid', justifyItems: 'center', textAlign: 'center' }}>
      <Markdown
        ref={source}
        data-view="source"
        style={{ ...layer, opacity: rendered ? 0 : 1, pointerEvents: rendered ? 'none' : 'auto' }}
      >
        {sources[wraps]!}
      </Markdown>
      <Markdown
        aria-hidden={!rendered}
        style={{ ...layer, opacity: rendered ? 1 : 0, pointerEvents: rendered ? 'auto' : 'none' }}
      >
        {`**${word}**`}
      </Markdown>
    </div>
  );
}
