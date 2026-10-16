import { Link } from '@envsemble/envui';
import { Markdown, type MarkdownLinkProps } from '@envsemble/envui/content';
import { documents, type Documentation as Document } from '../Reference';
import { pageHref, referencePages, routeOfDocument } from '../navigation/DocumentationRoutes';
import { routeHref } from '../navigation/Address';

/** Keep authored relative Markdown links usable in the self-contained catalogue. */
export function documentationHref(href: string, sourcePath: string) {
  if (/^(?:[a-z][a-z\d+.-]*:|#)/i.test(href)) return href;
  const url = new URL(href, `https://envui.invalid/docs/${sourcePath}`);
  const target = documents.find(
    (document) => document.path === url.pathname.slice('/docs/'.length),
  );
  if (!target) return href;
  const page = referencePages.find((entry) => entry.reference.path === target.path);
  // Links in guidance open the page's own guidance, or the overview of a page on the template.
  if (page) return pageHref(page, page.reference.sections ? 'overview' : 'usage');
  const route = routeOfDocument(target.id);
  return route ? routeHref(route) : href;
}

/** A page's Markdown, or a part of it such as one section, with its links resolved. */
export function Documentation(props: { document: Document } | { markdown: string; path: string }) {
  const [markdown, path] =
    'document' in props
      ? [props.document.markdown, props.document.path]
      : [props.markdown, props.path];
  return (
    <Markdown
      codeCopyable
      renderLink={({ href, ...link }: MarkdownLinkProps) => (
        <Link {...link} href={documentationHref(href, path)} />
      )}
    >
      {markdown}
    </Markdown>
  );
}
