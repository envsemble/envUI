import releases from 'virtual:envui-changelog-outline';
import type { TableOfContentsItem } from '@envsemble/envui';
import { LongPartSkeleton, placeholderText } from '../../loading/Skeletons';
import { recordedSize } from '../../loading/RecordedSizes';
import { markdownHeadings, PageMarkdown } from '../../markdown/PageMarkdown';

const changelogPath = '../packages/ui/CHANGELOG.md';

export const releaseContents = (): TableOfContentsItem[] =>
  markdownHeadings(releases.map(({ heading }) => heading).join('\n\n')).map(({ id, text }) => ({
    id,
    label: text.split(' — ')[0]!,
  }));

const skeletonLines = 16;

const placeholderMarkdown = (shape: string) =>
  shape.replace(/~(\d+)/g, (_, length: string) => placeholderText(+length));

export function ChangelogSkeleton() {
  return releases.map(({ heading, shape }) => {
    const size = recordedSize(`changelog:${heading}`);
    return (
      <div
        key={heading}
        className="docs-changelog-outline"
        style={size && { blockSize: `${size[1]}rem` }}
      >
        <PageMarkdown markdown={heading} path={changelogPath} />
        <LongPartSkeleton
          what="the changelog"
          start={
            <PageMarkdown
              markdown={placeholderMarkdown(shape.split('\n').slice(0, skeletonLines).join('\n'))}
              path={changelogPath}
            />
          }
          whole={
            !size && <PageMarkdown markdown={placeholderMarkdown(shape)} path={changelogPath} />
          }
        />
      </div>
    );
  });
}
