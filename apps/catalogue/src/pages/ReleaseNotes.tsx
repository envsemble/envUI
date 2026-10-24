import { Fragment, type ReactNode } from 'react';
import { Column, Link, Text } from '@envsemble/envui';
import { Code } from '@envsemble/envui/content';
import releases from 'virtual:envui-release-notes';
import type { InlinePiece, Release } from './SiteData';

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(date));

/** A line of the release notes: its text, code and links to the Docs. */
function Pieces({ pieces }: { pieces: InlinePiece[] }): ReactNode {
  return pieces.map((piece, index) => (
    <Fragment key={index}>
      {piece.kind === 'text' && piece.text}
      {piece.kind === 'code' && <Code>{piece.text}</Code>}
      {piece.kind === 'link' && (
        <Link href={piece.href}>
          <Pieces pieces={piece.children} />
        </Link>
      )}
    </Fragment>
  ));
}

/** A release's highlights or breaking changes, in envUI's list style, which prose gives its lists. */
function ReleaseList({ items }: { items: InlinePiece[][] }) {
  return (
    <div className="env-prose docs-release-list">
      <ul>
        {items.map((item, index) => (
          <li key={index}>
            <Pieces pieces={item} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** A release's slug, which its heading takes as an id: 1-0-0-prerelease-1. */
const releaseId = (version: string) => `release-${version.replace(/[^\w]+/g, '-')}`;

/**
 * One release: its version and date as quiet labels, its highlights, then what it breaks, under the
 * page's Highlights heading.
 */
function ReleaseEntry({ release }: { release: Release }) {
  const id = releaseId(release.version);
  return (
    <Column gap={3} render={<section aria-labelledby={id} />} className="docs-release">
      <Text render={<h3 id={id} />} variant="body-sm" className="docs-release-label">
        <span className="docs-release-version">{release.version}</span>
        <span className="docs-release-date">
          {release.date ? (
            <time dateTime={release.date}>{formatDate(release.date)}</time>
          ) : (
            'Upcoming'
          )}
        </span>
      </Text>
      <ReleaseList items={release.highlights} />
      {release.breaking.length > 0 && (
        <Column gap={2}>
          <Text render={<h4 />} variant="body-sm" className="docs-release-label">
            Breaking changes
          </Text>
          <ReleaseList items={release.breaking} />
        </Column>
      )}
    </Column>
  );
}

/** The release notes: a few lines on each release, newest first. */
export function ReleaseNotes() {
  return (
    <Column gap={7} className="docs-releases">
      {releases.map((release) => (
        <ReleaseEntry key={release.version} release={release} />
      ))}
    </Column>
  );
}
