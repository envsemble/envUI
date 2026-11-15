import changelog from '../../../../../packages/ui/CHANGELOG.md?raw';
import { PageMarkdown } from '../../markdown/PageMarkdown';

const withoutTitle = (markdown: string) => markdown.replace(/^# [^\n]*\n+/, '');
const headingsOneLevelLower = (markdown: string) => markdown.replace(/^(#{2,5}) /gm, '#$1 ');

export function Changelog() {
  return (
    <PageMarkdown
      markdown={headingsOneLevelLower(withoutTitle(changelog))}
      path="../packages/ui/CHANGELOG.md"
    />
  );
}
