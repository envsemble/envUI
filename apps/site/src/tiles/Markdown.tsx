import { Markdown } from '@envsemble/envui/content';
import { useTimeline } from '../motion/Motion';

/** A short note as it is written: a heading, a list and a bold word. */
const note = '## Launch plan\n- **Design** review\n- Ship in May';

/** The note's source, shown as it is written, in a code block of its own. */
const source = `\`\`\`md\n${note}\n\`\`\``;

/**
 * One view over the other, the one leaving fading out before the one coming fades in, so the two
 * never show at once; the one not shown lets the pointer through to the other.
 */
const layer = (shown: boolean) => ({
  gridArea: '1 / 1',
  opacity: shown ? 1 : 0,
  pointerEvents: shown ? ('auto' as const) : ('none' as const),
  transition: `opacity 220ms ease ${shown ? '220ms' : '0ms'}`,
});

/**
 * A note in Markdown: its source at rest, with its marks, which gives way to the note rendered, a
 * heading over a list with a bold word, and back.
 */
export default function MarkdownTile() {
  const rendered = useTimeline([1000, 2600]) === 1;
  return (
    <div style={{ display: 'grid', alignItems: 'center', inlineSize: 'max-content' }}>
      <Markdown aria-hidden={rendered} style={layer(!rendered)}>
        {source}
      </Markdown>
      <Markdown aria-hidden={!rendered} style={layer(rendered)}>
        {note}
      </Markdown>
    </div>
  );
}
