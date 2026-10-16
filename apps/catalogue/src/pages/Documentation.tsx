import { Link } from '@envsemble/envui';
import { Markdown, type MarkdownLinkProps, type MarkdownProps } from '@envsemble/envui/content';
import { documents, type Documentation as Document } from '../Reference';
import { pageHref, referencePages, routeOfDocument } from '../navigation/DocumentationRoutes';
import { routeHref } from '../navigation/Address';
import { currentRoute } from '../navigation/useDocumentationRoute';
import { headingSlugger } from '../../../../scripts/SearchAnchors.mjs';

/** The current route scrolled to `section`, keeping its other parameters. */
function sectionOfCurrentRoute(section: string) {
  const [path, query] = currentRoute().split('?');
  const params = new URLSearchParams(query);
  params.set('section', section);
  return `${path}?${params}`;
}

const decodedFragment = (hash: string) => {
  try {
    return decodeURIComponent(hash.replace(/^#/, ''));
  } catch {
    return hash.replace(/^#/, '');
  }
};

/**
 * Keep authored relative Markdown links usable in the self-contained catalogue: a link to another
 * page of docs/ opens that page, at the heading its fragment names, and a link to a heading of the
 * same page, #heading, scrolls to it on the current route.
 */
export function documentationHref(href: string, sourcePath: string) {
  if (/^#./.test(href)) return routeHref(sectionOfCurrentRoute(decodedFragment(href)));
  if (/^(?:[a-z][a-z\d+.-]*:|#)/i.test(href)) return href;
  const url = new URL(href, `https://envui.invalid/docs/${sourcePath}`);
  const target = documents.find(
    (document) => document.path === url.pathname.slice('/docs/'.length),
  );
  if (!target) return href;
  const section = url.hash.length > 1 ? decodedFragment(url.hash) : undefined;
  const page = referencePages.find((entry) => entry.reference.path === target.path);
  // Links in guidance open the page's own guidance, or the overview of a page on the template; a
  // link to a heading opens the guidance, where the page's Markdown is.
  if (page && !section) return pageHref(page, page.reference.sections ? 'overview' : 'usage');
  const route = routeOfDocument(target.id, {
    view: page ? (page.reference.sections ? undefined : 'usage') : undefined,
    section,
  });
  return route ? routeHref(route) : href;
}

/** The text of a rendered element, as the reader sees it. */
function textOf(node: { type: string; value?: string; children?: unknown[] }): string {
  if (node.type === 'text') return node.value ?? '';
  return (node.children ?? []).map((child) => textOf(child as typeof node)).join('');
}

/**
 * A rehype plugin that gives each heading of a rendered document the id its text makes, as
 * scripts/SearchAnchors.mjs writes them, so links to #heading and search reach it.
 */
const headingIds: NonNullable<MarkdownProps['rehypePlugins']>[number] = () => (tree) => {
  const slug = headingSlugger();
  const visit = (node: {
    type: string;
    tagName?: string;
    properties?: Record<string, unknown>;
    children?: unknown[];
  }) => {
    if (node.type === 'element' && /^h[1-6]$/.test(node.tagName ?? ''))
      node.properties = { ...node.properties, id: slug(textOf(node)) };
    else for (const child of node.children ?? []) visit(child as typeof node);
  };
  visit(tree as Parameters<typeof visit>[0]);
};

const rehypePlugins = [headingIds];

/** A page's Markdown, or a part of it such as one section, with its links resolved. */
export function Documentation(props: { document: Document } | { markdown: string; path: string }) {
  const [markdown, path] =
    'document' in props
      ? [props.document.markdown, props.document.path]
      : [props.markdown, props.path];
  return (
    <Markdown
      codeCopyable
      rehypePlugins={rehypePlugins}
      renderLink={({ href, ...link }: MarkdownLinkProps) => (
        <Link {...link} href={documentationHref(href, path)} />
      )}
    >
      {markdown}
    </Markdown>
  );
}
