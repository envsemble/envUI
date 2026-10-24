import { Link } from '@envsemble/envui';
import { Markdown, type MarkdownLinkProps, type MarkdownProps } from '@envsemble/envui/content';
import { documents, type Documentation as Document } from '../Reference';
import {
  referencePages,
  routeOfDocument,
  unlistedDocuments,
} from '../navigation/DocumentationRoutes';
import { inDocs, routeHref } from '../navigation/Address';
import { currentRoute } from '../navigation/useDocumentationRoute';
import { headingSlugger } from '../../../../scripts/SearchAnchors.mjs';

/** The repository's copy of a page of docs/ that neither the Site nor the Docs show. */
const repositoryFile = (path: string) =>
  `https://github.com/envsemble/envUI/blob/main/docs/${path}`;

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
 * Keeps authored relative Markdown links usable on the site: a link to another page of docs/ opens
 * the page that shows it, at the heading its fragment names, and a link to a heading of the same
 * page, #heading, scrolls to it on the current route. A foundation's written guidance is its guide
 * in the Docs, so a link to one of its headings, or any link to it from the Docs, opens the guide,
 * and others its visual page on the Site.
 */
export function documentationHref(href: string, sourcePath: string) {
  if (/^#./.test(href)) return routeHref(sectionOfCurrentRoute(decodedFragment(href)));
  if (/^(?:[a-z][a-z\d+.-]*:|#)/i.test(href)) return href;
  const url = new URL(href, `https://envui.invalid/docs/${sourcePath}`);
  const target = documents.find(
    (document) => document.path === url.pathname.slice('/docs/'.length),
  );
  if (!target) return href;
  if (unlistedDocuments.has(target.id) && target.id !== 'index')
    return `${repositoryFile(target.path)}${url.hash}`;
  const section = url.hash.length > 1 ? decodedFragment(url.hash) : undefined;
  const page = referencePages.find((entry) => entry.reference.path === target.path);
  const guide = page?.section === 'Foundations' && (section || inDocs(currentRoute()));
  const route = routeOfDocument(target.id, { view: guide ? 'usage' : undefined, section });
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
    // A heading that has an id of its own keeps it.
    if (node.type === 'element' && /^h[1-6]$/.test(node.tagName ?? '')) {
      if (!node.properties?.id) node.properties = { ...node.properties, id: slug(textOf(node)) };
    } else for (const child of node.children ?? []) visit(child as typeof node);
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
