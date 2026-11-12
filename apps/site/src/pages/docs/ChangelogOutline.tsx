import releases from 'virtual:envui-changelog-outline';
import { LongPartSkeleton, placeholderText } from '../../loading/Skeletons';
import { recordedSize } from '../../loading/RecordedSizes';
import { PageMarkdown } from '../../markdown/PageMarkdown';

const changelogPath = '../packages/ui/CHANGELOG.md';

/** How many lines of a release's text its skeleton shows. */
const skeletonLines = 16;

/** The text of a release as placeholder words of its length, in its Markdown's shape. */
const placeholderMarkdown = (shape: string) =>
  shape.replace(/~(\d+)/g, (_, length: string) => placeholderText(+length));

/**
 * The changelog while it loads: each release's heading, with the id it takes once the changelog
 * has loaded, so the page's contents list every release from the start, over a skeleton of the
 * start of what the release says, its lists and paragraphs as long as they will be, in the room
 * the release was recorded to take (RecordPartSizes.ts), or else that of all its text.
 */
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
