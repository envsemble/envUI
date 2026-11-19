import { Column, Text } from '@envsemble/envui';
import releases from 'virtual:envui-release-notes';
import type { InlinePiece, Release } from './ReleaseNotesData';
import { Pieces } from './InlineText';

const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(date));

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

const releaseId = (version: string) => `release-${version.replace(/[^\w]+/g, '-')}`;

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

export function ReleaseNotes() {
  return (
    <Column gap={7} className="docs-releases">
      {releases.map((release) => (
        <ReleaseEntry key={release.version} release={release} />
      ))}
    </Column>
  );
}
