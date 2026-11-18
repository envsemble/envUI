import releases from 'virtual:envui-changelog-outline';
import { LongPartSkeleton, placeholderText } from '../../loading/Skeletons';
import { recordedSize } from '../../loading/RecordedSizes';
import { PageMarkdown } from '../../markdown/PageMarkdown';

const changelogPath = '../packages/ui/CHANGELOG.md';

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
