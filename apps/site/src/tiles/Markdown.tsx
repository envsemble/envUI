import { Markdown } from '@envsemble/envui/content';
import { useHeldView, useTimeline } from '../motion/Motion';

/**
 * A short note as it is written, step by step: a heading over two items, the second a version in
 * inline code, which renders as a code chip, a change that reads at a tile's size; as it plays, the
 * note is a moment without its second item, which then comes back. Its lines are short, the same
 * at every width, so it is drawn at about its own size in a phone's narrower and lower tile too
 * and shows whole.
 */
const notes = ['## Launch\n- Review it\n- Ship `v2.0`', '## Launch\n- Review it'];

/**
 * A note in Markdown, rendered as an application shows one: it rests on the whole note, centred;
 * as it plays, its text changes, as a note does when someone edits it, and the one Markdown renders
 * the new text: the last line is written again, briefly gone and back, and holds.
 */
export default function MarkdownTile() {
  const step = useTimeline([2200, 900]);
  // Its still is its largest state, laid out from the top: the heading and first item hold still
  // as the last item goes and comes back.
  useHeldView(true);
  return <Markdown>{notes[step]}</Markdown>;
}
