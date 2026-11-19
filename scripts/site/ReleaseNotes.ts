import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { headingsOf } from '../docs/MarkdownHeadings.ts';
import { libraryChangelogFile, repositoryRoot } from '../RepositoryPaths.ts';
import { inlinePieces, type InlinePiece } from '../../apps/site/src/documentation/InlinePieces.ts';

const releaseNotesFile = resolve(repositoryRoot, 'apps/site/src/releases/release-notes.md');

const highlightLimit = 5;

export interface ReleaseEntry {
  version: string;
  date: string | null;
  upcoming: boolean;
  highlights: InlinePiece[][];
  breaking: InlinePiece[][];
}

export function parseReleaseNotes(markdown: string): ReleaseEntry[] {
  const releases: ReleaseEntry[] = [];
  let list: 'highlights' | 'breaking' = 'highlights';
  const source = markdown.replace(/\r\n?/g, '\n').replace(/<!--[\s\S]*?-->/g, '');
  for (const line of source.split('\n')) {
    const heading = /^## (\S+) — (.+)$/.exec(line);
    if (heading) {
      const [, version, when] = heading;
      const upcoming = when.trim() === 'Upcoming';
      if (!upcoming && !/^\d{4}-\d{2}-\d{2}$/.test(when.trim()))
        throw new Error(`Release ${version}: write its date as YYYY-MM-DD, or Upcoming.`);
      releases.push({
        version,
        date: upcoming ? null : when.trim(),
        upcoming,
        highlights: [],
        breaking: [],
      });
      list = 'highlights';
      continue;
    }
    if (/^### Breaking changes\s*$/.test(line)) {
      if (!releases.length) throw new Error('Breaking changes before the first release heading.');
      list = 'breaking';
      continue;
    }
    if (/^#{2,} /.test(line)) throw new Error(`Unexpected heading in the release notes: ${line}`);
    const item = /^- (.+)$/.exec(line);
    if (item) {
      if (!releases.length) throw new Error(`An item before the first release heading: ${line}`);
      releases.at(-1)![list].push(inlinePieces(item[1].trim()));
    }
  }
  return releases;
}

function versionKey(version: string) {
  const [core, pre] = version.split('-') as [string, string | undefined];
  const preNumber = pre ? Number(pre.split('.').at(-1)) : Infinity;
  return [...core.split('.').map(Number), preNumber];
}

function compareVersions(a: string, b: string) {
  const [left, right] = [versionKey(a), versionKey(b)];
  for (let index = 0; index < left.length; index += 1)
    if (left[index] !== right[index]) return left[index] < right[index] ? -1 : 1;
  return 0;
}

const linksOf = (pieces: InlinePiece[]): string[] =>
  pieces.flatMap((piece) =>
    piece.kind === 'link' ? [piece.href, ...linksOf(piece.children)] : [],
  );

function linkTargets() {
  const ids = (file: string) =>
    new Set(
      headingsOf(
        readFileSync(file, 'utf8')
          .replace(/\r\n?/g, '\n')
          .replace(/^# [^\n]+\n\s*/, ''),
      ).map(({ id }) => id),
    );
  return {
    '/docs/changelog': ids(libraryChangelogFile),
  } as Record<string, Set<string>>;
}

export function releaseNotesProblems(releases: ReleaseEntry[], targets = linkTargets()) {
  const problems: string[] = [];
  releases.forEach((release, index) => {
    const name = `Release ${release.version}`;
    if (!release.highlights.length) problems.push(`${name} has no highlights.`);
    if (release.highlights.length > highlightLimit)
      problems.push(`${name} has ${release.highlights.length} highlights; keep ${highlightLimit}.`);
    const next = releases[index + 1];
    if (next && compareVersions(release.version, next.version) <= 0)
      problems.push(`${name} comes before ${next.version}; list the newest first.`);
    if (release.upcoming && index > 0) problems.push(`${name} is upcoming but not the newest.`);
    for (const change of release.breaking)
      if (!linksOf(change).length) problems.push(`${name} has a breaking change without a link.`);
    for (const href of [...release.highlights, ...release.breaking].flatMap(linksOf)) {
      const [path, section] = href.split('#');
      const ids = targets[path];
      if (!ids) problems.push(`${name} links to ${href}, which is not the changelog.`);
      else if (!section || !ids.has(section))
        problems.push(`${name} links to ${href}, a section that page doesn't have.`);
    }
  });
  return problems;
}

export function readReleaseNotes(file = releaseNotesFile) {
  const releases = parseReleaseNotes(readFileSync(file, 'utf8'));
  const problems = releaseNotesProblems(releases);
  if (problems.length)
    throw new Error(`The release notes in ${file} need fixing:\n- ${problems.join('\n- ')}`);
  return releases;
}

export const releaseNotesSources = [releaseNotesFile, libraryChangelogFile];
