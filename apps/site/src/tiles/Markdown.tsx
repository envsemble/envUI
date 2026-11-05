import { Markdown } from '@envsemble/envui/content';
import { useMedia } from '../motion/Autoplay';
import { useTimeline } from '../motion/Motion';
import { narrowGallery } from './Tiles';

/**
 * A short note as it is written, step by step: a heading over a list of two, then a third item, a
 * version in inline code, which renders as a code chip, a change that reads at a tile's size.
 */
const notes = [
  '## Launch plan\n- Design review\n- Write the notes',
  '## Launch plan\n- Design review\n- Write the notes\n- Ship `v2.0` in May',
];

/**
 * The note in a phone's narrower and lower tile, its lines shorter and one fewer, so it is drawn at
 * about its own size there and shows whole: the item with the version comes as it plays.
 */
const shortNotes = ['## Launch\n- Review it', '## Launch\n- Review it\n- Ship `v2.0`'];

/**
 * A note in Markdown, rendered as an application shows one: as it plays, its text changes, as a
 * note does when someone edits it, and the one Markdown renders the new text.
 */
export default function MarkdownTile() {
  const step = useTimeline([1000, 4000]);
  const narrow = useMedia(narrowGallery);
  return <Markdown>{(narrow ? shortNotes : notes)[step]}</Markdown>;
}
