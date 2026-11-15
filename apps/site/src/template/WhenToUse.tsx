import type { DocumentationMetadata } from '../documentation/DocumentationTypes';
import { PageMarkdown } from '../markdown/PageMarkdown';
import { classNames } from '../shared/Attributes';

/**
 * The start of a page's Rules, from its frontmatter: a short list of what it is for under Use it
 * when, in two columns where it is long and there is room. What to use instead is in Related, at
 * the end of the page.
 */
export function WhenToUse({ metadata, path }: { metadata: DocumentationMetadata; path: string }) {
  const list = (items: string[]) => items.map((text) => `- ${text}`).join('\n');
  return (
    <div className="site-when">
      {/* More than three items run in two columns where there is room, each read top to bottom,
          with the first half on the left (WhenToUse.css). */}
      <div
        className={classNames(
          'site-when-use',
          metadata.useWhen.length > 3 && 'catalogue-when-columns',
        )}
        style={{ '--catalogue-when-rows': Math.ceil(metadata.useWhen.length / 2) }}
      >
        <PageMarkdown markdown={`### Use it when\n\n${list(metadata.useWhen)}`} path={path} />
      </div>
    </div>
  );
}
