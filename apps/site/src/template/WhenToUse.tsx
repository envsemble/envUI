import type { DocumentationMetadata } from '../documentation/DocumentationTypes';
import { PageMarkdown } from '../markdown/PageMarkdown';
import { classNames } from '../shared/Attributes';

export function WhenToUse({ metadata, path }: { metadata: DocumentationMetadata; path: string }) {
  const list = (items: string[]) => items.map((text) => `- ${text}`).join('\n');
  const runsInTwoColumns = metadata.useWhen.length > 3;
  return (
    <div className="site-when">
      <div
        className={classNames('site-when-use', runsInTwoColumns && 'catalogue-when-columns')}
        style={{ '--catalogue-when-rows': Math.ceil(metadata.useWhen.length / 2) }}
      >
        <PageMarkdown markdown={`### Use it when\n\n${list(metadata.useWhen)}`} path={path} />
      </div>
    </div>
  );
}
