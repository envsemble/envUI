import { Markdown } from '@envsemble/envui/content';
import { useMedia } from '../motion/Autoplay';
import { useTimeline } from '../motion/Motion';
import { narrowGallery } from './Tiles';

/**
 * A short note as it is written: a heading, and a list with a version in inline code, which renders
 * as a code chip, a change that reads at a tile's size. A bold word renders in the medium weight
 * prose gives emphasis, too close to the words around it to see at that size.
 */
const note = '## Launch plan\n- Design review\n- Ship `v2.0` in May';

/** The note in a phone's narrower tile, its lines shorter, so it is drawn at about its own size. */
const shortNote = '## Launch\n- Review it\n- Ship `v2.0`';

/** A note's source, shown as it is written, in a code block of its own. */
const sourceOf = (text: string) => `\`\`\`md\n${text}\n\`\`\``;

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
 * A note in Markdown: rendered at rest, a heading over a list with a version in code; as it plays,
 * its source, with its marks, and the note rendered from it again.
 */
export default function MarkdownTile() {
  const rendered = useTimeline([400, 1800, 2600]) !== 1;
  const text = useMedia(narrowGallery) ? shortNote : note;
  return (
    <div style={{ display: 'grid', alignItems: 'center', inlineSize: 'max-content' }}>
      <Markdown aria-hidden={rendered} style={layer(!rendered)}>
        {sourceOf(text)}
      </Markdown>
      <Markdown aria-hidden={!rendered} style={layer(rendered)}>
        {text}
      </Markdown>
    </div>
  );
}
