import { Markdown } from '@envsemble/envui/content';

/**
 * A short note: a heading over two items, the second a version in inline code, which renders as a
 * code chip. Its lines are short, the same at every width, so it is drawn at about its own size in
 * a phone's narrower and lower tile too and shows whole.
 */
const note = '## Launch\n- Review it\n- Ship `v2.0`';

/**
 * A note in Markdown, rendered as an application shows one, centred. It holds still as its tile
 * plays: Markdown only renders the text it is given, and a line changing with nobody writing it
 * would read as a glitch rather than an edit.
 */
export default function MarkdownTile() {
  return <Markdown>{note}</Markdown>;
}
