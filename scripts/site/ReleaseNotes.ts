// The release notes, apps/site/src/releases/release-notes.md, the highlights on the Docs'
// Changelog page: one entry per release, newest first, with up to five highlights and the breaking
// changes, each linking to the migration guide or the full changelog below them. The catalogue reads them when it builds, through the
// virtual module in apps/site/vite.config.ts, and the checks below hold them to that shape.
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { headingsOf } from '../docs/MarkdownHeadings.ts';

const releaseNotesFile = fileURLToPath(
  new URL('../../apps/site/src/releases/release-notes.md', import.meta.url),
);
const migrationFile = fileURLToPath(new URL('../../docs/migration.md', import.meta.url));
const changelogFile = fileURLToPath(new URL('../../packages/ui/CHANGELOG.md', import.meta.url));

/** The most highlights an entry has. */
const highlightLimit = 5;

/**
 * A line of inline Markdown as pieces the page renders: text, `code` and [links](href), whose
 * text may hold code too.
 */
/** A piece of a line of the release notes: text, code, or a link whose text has pieces of its own. */
export type InlinePiece =
  | { kind: 'text'; text: string }
  | { kind: 'code'; text: string }
  | { kind: 'link'; href: string; children: InlinePiece[] };

/** One release's entry in the release notes. */
export interface ReleaseEntry {
  version: string;
  date: string | null;
  upcoming: boolean;
  highlights: InlinePiece[][];
  breaking: InlinePiece[][];
}

export function inlinePieces(text: string): InlinePiece[] {
  const pieces: InlinePiece[] = [];
  const pattern = /\[([^\]]+)\]\(([^)\s]+)\)|`([^`]+)`/g;
  let last = 0;
  for (const match of text.matchAll(pattern)) {
    if (match.index > last) pieces.push({ kind: 'text', text: text.slice(last, match.index) });
    if (match[1] !== undefined)
      pieces.push({ kind: 'link', href: match[2], children: inlinePieces(match[1]) });
    else pieces.push({ kind: 'code', text: match[3] });
    last = match.index + match[0].length;
  }
  if (last < text.length) pieces.push({ kind: 'text', text: text.slice(last) });
  return pieces;
}

/** Reads the release notes' Markdown into entries, in the file's order. */
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

/** A version's parts, for ordering: 1.0.0-prerelease.2 is [1, 0, 0, 2], a release [x, y, z, ∞]. */
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

/** Every link in an entry's pieces. */
const linksOf = (pieces: InlinePiece[]): string[] =>
  pieces.flatMap((piece) =>
    piece.kind === 'link' ? [piece.href, ...linksOf(piece.children)] : [],
  );

/** The pages of the Docs the notes may link to, each with its heading ids. */
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
    '/docs/migration': ids(migrationFile),
    '/docs/changelog': ids(changelogFile),
  } as Record<string, Set<string>>;
}

/**
 * The problems of the release notes: an entry with too many highlights, versions out of order,
 * a breaking change without a link, or a link to a section the Docs don't have.
 */
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
      if (!ids)
        problems.push(`${name} links to ${href}, which is not the migration guide or changelog.`);
      else if (!section || !ids.has(section))
        problems.push(`${name} links to ${href}, a section that page doesn't have.`);
    }
  });
  return problems;
}

/** The release notes, checked; a problem stops the build. */
export function readReleaseNotes(file = releaseNotesFile) {
  const releases = parseReleaseNotes(readFileSync(file, 'utf8'));
  const problems = releaseNotesProblems(releases);
  if (problems.length)
    throw new Error(`The release notes in ${file} need fixing:\n- ${problems.join('\n- ')}`);
  return releases;
}

/** The files the release notes depend on, which the catalogue watches while it runs. */
export const releaseNotesSources = [releaseNotesFile, migrationFile, changelogFile];
