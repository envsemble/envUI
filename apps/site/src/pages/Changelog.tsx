import changelog from '../../../../packages/ui/CHANGELOG.md?raw';
import { Documentation } from './Documentation';

/**
 * The package's changelog as the releases write it, without its own title and a level lower, under
 * the page's Every change heading; its headings keep the ids the release notes link to, such as
 * #070--2026-10-15. Until it loads, ChangelogSkeleton (ChangelogOutline.tsx) holds its place.
 */
export function Changelog() {
  return (
    <Documentation
      markdown={changelog.replace(/^# [^\n]*\n+/, '').replace(/^(#{2,5}) /gm, '#$1 ')}
      path="../packages/ui/CHANGELOG.md"
    />
  );
}
