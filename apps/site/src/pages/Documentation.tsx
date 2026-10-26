import { createContext, useContext, useMemo } from 'react';
import { Link } from '@envsemble/envui';
import { Markdown, type MarkdownLinkProps, type MarkdownProps } from '@envsemble/envui/content';
import { documents, type Documentation as Document } from '../Reference';
import { referencePages, routeOfDocument, unlistedDocuments } from '../navigation/SiteRoutes';
import { inDocs, routeHref } from '../navigation/Address';
import { currentRoute } from '../navigation/useSiteRoute';
import { headingSlugger } from '../../../../scripts/SearchAnchors.mjs';

/** The repository's copy of a page of docs/ that neither the catalogue nor the Docs show. */
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
 * and others its visual page in the catalogue.
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

/**
 * Whether the Markdown below is guidance, as the pages of components, patterns and foundations are:
 * its lists are then check lists, each item's circle holding a check instead of envUI's dot
 * (`site-guidance`, Template.css), and a component named at an item's end follows a muted dot.
 */
export const GuidanceLists = createContext(false);

type HastNode = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

/** A component named in parentheses at the end of an item, as "(IconButton)" or "(Calendar).". */
const trailingName = /\s*\(([A-Z][A-Za-z]*)\)\.?\s*$/;

/** The page that documents a component, and so its address, where it has one in the catalogue. */
const componentPage = (name: string) =>
  referencePages.find(
    (page) =>
      !page.path.startsWith('docs/') &&
      (page.reference.metadata?.components ?? page.reference.components)?.includes(name),
  );

/**
 * The text an item ends with: its own last text, before a list nested in it, or its paragraph's,
 * where its text is a paragraph.
 */
function itemEnd(item: HastNode): { parent: HastNode; index: number } | undefined {
  const children = item.children ?? [];
  for (let index = children.length - 1; index >= 0; index--) {
    const child = children[index];
    if (child.type === 'text' && !child.value?.trim()) continue;
    if (child.type === 'element' && /^(ul|ol)$/.test(child.tagName ?? '')) continue;
    if (child.type === 'text') return { parent: item, index };
    if (child.type === 'element' && child.tagName === 'p') return itemEnd(child);
    return undefined;
  }
  return undefined;
}

/**
 * A rehype plugin for guidance lists: a component named at an item's end, "(IconButton)", follows
 * the item after a muted middle dot, as "… in a dense place · IconButton", and links to its page
 * where it has one other than the page `path` shows.
 */
const componentNames =
  (path: string): NonNullable<MarkdownProps['rehypePlugins']>[number] =>
  () =>
  (tree) => {
    const visit = (node: HastNode) => {
      if (node.type === 'element' && node.tagName === 'li') {
        const end = itemEnd(node);
        const text = end?.parent.children![end.index];
        const match = text?.value && trailingName.exec(text.value);
        const page = match && componentPage(match[1]);
        if (end && text && match && (page || /[a-z][A-Z]/.test(match[1]))) {
          text.value = text.value!.slice(0, match.index);
          const own = page && page.reference.path === path;
          const name: HastNode = {
            type: 'element',
            tagName: page && !own ? 'a' : 'span',
            properties:
              page && !own
                ? { href: `../${page.reference.path}` }
                : { className: ['catalogue-list-name'] },
            children: [{ type: 'text', value: match[1] }],
          };
          end.parent.children!.splice(
            end.index + 1,
            0,
            {
              type: 'element',
              tagName: 'span',
              properties: { className: ['catalogue-list-name-dot'], ariaHidden: 'true' },
              children: [{ type: 'text', value: ' · ' }],
            },
            name,
          );
        }
      }
      for (const child of node.children ?? []) visit(child);
    };
    visit(tree as HastNode);
  };

const rehypePlugins = [headingIds];

/**
 * A page's Markdown, or a part of it such as one section, with its links resolved. `className`
 * gives it a role in the catalogue's type hierarchy, such as `site-lead` for a section's opening
 * paragraph (CatalogueText.css).
 */
export function Documentation(
  props: ({ document: Document } | { markdown: string; path: string }) & { className?: string },
) {
  const [markdown, path] =
    'document' in props
      ? [props.document.markdown, props.document.path]
      : [props.markdown, props.path];
  const guidance = useContext(GuidanceLists);
  const plugins = useMemo(
    () => (guidance ? [headingIds, componentNames(path)] : rehypePlugins),
    [guidance, path],
  );
  return (
    <Markdown
      codeCopyable
      className={
        [guidance && 'site-guidance', props.className].filter(Boolean).join(' ') || undefined
      }
      rehypePlugins={plugins}
      renderLink={({ href, ...link }: MarkdownLinkProps) => (
        <Link {...link} href={documentationHref(href, path)} />
      )}
    >
      {markdown}
    </Markdown>
  );
}
