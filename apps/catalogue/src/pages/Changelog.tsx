import changelog from '../../../../packages/ui/CHANGELOG.md?raw';
import { Documentation } from './Documentation';

/**
 * The package's changelog as the releases write it, without its own title, its headings with the
 * ids the release notes link to, such as #070--2026-10-15.
 */
export function Changelog() {
  return (
    <Documentation
      markdown={changelog.replace(/^# [^\n]*\n+/, '')}
      path="../packages/ui/CHANGELOG.md"
    />
  );
}
