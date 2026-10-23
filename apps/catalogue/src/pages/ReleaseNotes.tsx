import { Fragment, type ReactNode } from 'react';
import { Column, Link, Text } from '@envsemble/envui';
import { Code } from '@envsemble/envui/content';
import releases from 'virtual:envui-release-notes';
import type { InlinePiece, Release } from './SiteData';
import { routeHref } from '../navigation/Address';

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

/** A release's slug, which its heading takes as an id: 1-0-0-prerelease-1. */
const releaseId = (version: string) => `release-${version.replace(/[^\w]+/g, '-')}`;

/** One release: its version and date as quiet labels, its highlights, then what it breaks. */
function ReleaseEntry({ release }: { release: Release }) {
  const id = releaseId(release.version);
  return (
    <Column gap={3} render={<section aria-labelledby={id} />} className="docs-release">
      <Text render={<h2 id={id} />} variant="body-sm" className="docs-release-label">
        <span className="docs-release-version">{release.version}</span>
        <span className="docs-release-date">
          {release.date ? (
            <time dateTime={release.date}>{formatDate(release.date)}</time>
          ) : (
            'Upcoming'
          )}
        </span>
      </Text>
      <ul className="docs-release-list">
        {release.highlights.map((highlight, index) => (
          <li key={index}>
            <Pieces pieces={highlight} />
          </li>
        ))}
      </ul>
      {release.breaking.length > 0 && (
        <Column gap={2}>
          <Text render={<h3 />} variant="body-sm" className="docs-release-label">
            Breaking changes
          </Text>
          <ul className="docs-release-list">
            {release.breaking.map((change, index) => (
              <li key={index}>
                <Pieces pieces={change} />
              </li>
            ))}
          </ul>
        </Column>
      )}
    </Column>
  );
}

/** Every release, newest first, and the way to the full changelog in the Docs. */
export function ReleaseNotes() {
  return (
    <Column gap={8} className="docs-article docs-releases">
      <Text>
        A few lines on each release. The{' '}
        <Link href={routeHref('docs/changelog')}>full changelog in the Docs</Link> lists every
        change, and the{' '}
        <Link href={routeHref('docs/migration?section=upgrade-from-envui-0x-to-10')}>
          migration guide
        </Link>{' '}
        says how to upgrade.
      </Text>
      {releases.map((release) => (
        <ReleaseEntry key={release.version} release={release} />
      ))}
    </Column>
  );
}
