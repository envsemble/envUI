import { Markdown } from '@envsemble/envui/content';
import changelog from '../../../../packages/ui/CHANGELOG.md?raw';

/** The package's changelog as the releases write it, without its own title. */
export function Changelog() {
  return <Markdown codeCopyable>{changelog.replace(/^# [^\n]*\n+/, '')}</Markdown>;
}
