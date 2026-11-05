import { Markdown } from '@envsemble/envui/content';
import { useTimeline } from '../motion/Motion';

/**
 * A short note as it is written, step by step: a heading over one item, then a second, a version
 * in inline code, which renders as a code chip, a change that reads at a tile's size. Its lines are
 * short, the same at every width, so it is drawn at about its own size in a phone's narrower and
 * lower tile too and shows whole.
 */
const notes = ['## Launch\n- Review it', '## Launch\n- Review it\n- Ship `v2.0`'];

/**
 * A note in Markdown, rendered as an application shows one: as it plays, its text changes, as a
 * note does when someone edits it, and the one Markdown renders the new text.
 */
export default function MarkdownTile() {
  const step = useTimeline([1000, 4000]);
  return <Markdown>{notes[step]}</Markdown>;
}
