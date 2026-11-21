import type { TableOfContentsItem } from '@envsemble/envui';
import type { DocumentationEntry } from '../../documentation/DocumentationTypes';
import { markdownHeadings, PageMarkdown } from '../../markdown/PageMarkdown';

export const guideContents = (document: DocumentationEntry): TableOfContentsItem[] =>
  markdownHeadings(document.markdown ?? '')
    .filter(({ level }) => level === 2)
    .map(({ id, text }) => ({ id, label: text }));

export function GuideDocument({ document }: { document: DocumentationEntry }) {
  return <PageMarkdown document={document} />;
}
