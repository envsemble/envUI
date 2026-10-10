import { Link } from '@envsemble/envui';
import { Markdown, type MarkdownLinkProps } from '@envsemble/envui/content';
import { documents, type Documentation as Document } from '../Reference';
import { referencePages } from '../navigation/DocumentationRoutes';

/** Keep authored relative Markdown links usable in the self-contained catalogue. */
export function documentationHref(href: string, sourcePath: string) {
  if (/^(?:[a-z][a-z\d+.-]*:|#)/i.test(href)) return href;
  const url = new URL(href, `https://envui.invalid/docs/${sourcePath}`);
  const target = documents.find(
    (document) => document.path === url.pathname.slice('/docs/'.length),
  );
  if (!target) return href;
  const page = referencePages.find((entry) => entry.reference.path === target.path);
  if (page) return `#/${page.path}/usage`;
  if (target.id === 'setup') return '#/overview/get-started?section=setup';
  return `#/overview/get-started?${new URLSearchParams({ document: target.id, section: 'documentation' })}`;
}

export function Documentation({ document }: { document: Document }) {
  return (
    <Markdown
      codeCopyable
      renderLink={({ href, ...props }: MarkdownLinkProps) => (
        <Link {...props} href={documentationHref(href, document.path)} />
      )}
    >
      {document.markdown}
    </Markdown>
  );
}
