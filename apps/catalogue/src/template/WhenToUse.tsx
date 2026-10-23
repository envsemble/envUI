import type { DocumentationMetadata } from '../DocumentationTypes';
import { Documentation } from '../pages/Documentation';

/**
 * The start of When to use on a page on the figure template, from its frontmatter: a short list of
 * what it is for and, for a pattern, what it is built from. What to use instead is in Related, at
 * the end of the page.
 */
export function WhenToUse({
  metadata,
  path,
  exportLink,
}: {
  metadata: DocumentationMetadata;
  path: string;
  /** An export as a Markdown link to the page that documents it. */
  exportLink: (name: string) => string;
}) {
  const list = (items: string[]) => items.map((text) => `- ${text}`).join('\n');
  return (
    <div className="docs-when">
      <Documentation markdown={`### Use it when\n\n${list(metadata.useWhen)}`} path={path} />
      {metadata.composes?.length ? (
        <Documentation
          markdown={`### Built from\n\n${metadata.composes.map(exportLink).join(', ')}`}
          path={path}
        />
      ) : null}
    </div>
  );
}
