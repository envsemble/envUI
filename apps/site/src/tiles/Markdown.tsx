import { Markdown } from '@envsemble/envui/markdown';

const note = '## Launch\n- Review it\n- Ship `v2.0`';

export default function MarkdownTile() {
  return <Markdown>{note}</Markdown>;
}
