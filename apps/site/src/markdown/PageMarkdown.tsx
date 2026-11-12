import { createContext, useContext, useMemo } from 'react';
import { CopyButton, Link } from '@envsemble/envui';
import { CodeBlock } from '@envsemble/envui/code';
import { Markdown, type MarkdownLinkProps, type MarkdownProps } from '@envsemble/envui/markdown';
import type { DocumentationEntry } from '../documentation/DocumentationTypes';
import { documents } from '../routes/PageModel';
import { groupedPages, routeOfDocument } from '../routes/SiteRoutes';
import { inDocs, routeHref } from '../routes/Address';
import { currentRoute } from '../routes/useSiteRoute';
import { headingSlugger } from '../documentation/SearchAnchors';
import { headingsOnly, useSectionOutline } from './SectionOutline';
import { marked, type Token, type Tokens } from 'marked';
import { classNames } from '@envui-internal/internal/classNames';

/**
 * The current page scrolled to `section`: its path alone, as the server that renders the page knows
 * it, so the link's address is the same on the server and in the browser, whatever the address's
 * query holds.
 */
function sectionOfCurrentRoute(section: string) {
  const [path] = currentRoute().split('?');
  return `${path}?${new URLSearchParams({ section })}`;
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
function documentationHref(href: string, sourcePath: string) {
  if (/^#./.test(href)) return routeHref(sectionOfCurrentRoute(decodedFragment(href)));
  if (/^(?:[a-z][a-z\d+.-]*:|#)/i.test(href)) return href;
  const url = new URL(href, `https://envui.invalid/docs/${sourcePath}`);
  const target = documents.find(
    (document) => document.path === url.pathname.slice('/docs/'.length),
  );
  if (!target) return href;
  const section = url.hash.length > 1 ? decodedFragment(url.hash) : undefined;
  const page = groupedPages.find((entry) => entry.document.path === target.path);
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
 * documentation/SearchAnchors.ts writes them, so links to #heading and search reach it.
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
  // The tree's nodes, as far as this reads them.
  visit(tree as Parameters<typeof visit>[0]);
};

/**
 * Whether the Markdown below is guidance, as the pages of components, patterns and foundations are:
 * it takes `site-guidance`, and a component named at an item's end follows a muted dot.
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
  groupedPages.find(
    (page) =>
      !page.path.startsWith('docs/') &&
      (page.document.metadata?.components ?? page.document.components)?.includes(name),
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
        // An item's end is a child of its parent.
        const text = end?.parent.children![end.index];
        const match = text?.value && trailingName.exec(text.value);
        const page = match && componentPage(match[1]);
        if (end && text && match && (page || /[a-z][A-Z]/.test(match[1]))) {
          text.value = text.value?.slice(0, match.index);
          const own = page && page.document.path === path;
          const name: HastNode = {
            type: 'element',
            tagName: page && !own ? 'a' : 'span',
            properties:
              page && !own
                ? { href: `../${page.document.path}` }
                : { className: ['catalogue-list-name'] },
            children: [{ type: 'text', value: match[1] }],
          };
          end.parent.children?.splice(
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
    // The tree's nodes, as far as this reads them.
    visit(tree as HastNode);
  };

const rehypePlugins = [headingIds];

/**
 * The site's code blocks: the code alone, unlabelled, with its copy button in the block's top end
 * corner rather than on a heading row of its own (SiteText.css). Every block keeps its lines whole
 * and scrolls sideways where one is too long, the edge it overflows at fading, imports included.
 */
const elements: NonNullable<MarkdownProps['components']> = {
  pre: function SiteCodeBlock({ node, children }) {
    const code = node?.children.find(
      (child) => child.type === 'element' && child.tagName === 'code',
    );
    if (!code || code.type !== 'element') return <pre>{children}</pre>;
    const source = code.children
      .map((child) => (child.type === 'text' ? child.value : ''))
      .join('');
    const language = String(code.properties.className ?? '').match(/language-([^,\s]+)/)?.[1];
    return (
      <div className="site-code-block">
        <CodeBlock language={language}>{source}</CodeBlock>
        <div className="site-code-block-corner">
          <CopyButton value={source} variant="ghost" size="sm" aria-label="Copy code" />
        </div>
      </div>
    );
  },
};

/** Text with its HTML entities, such as &amp;, as the characters they stand for. */
function decodeEntities(text: string) {
  // The server renders without a document; no heading of docs/ writes an entity.
  if (typeof document === 'undefined') return text;
  const element = document.createElement('textarea');
  element.innerHTML = text;
  return element.value;
}

/** Inline Markdown's text as it renders, without its syntax: code keeps its characters. */
function inlineText(tokens: readonly Token[]): string {
  return tokens
    .map((token) => {
      if ('tokens' in token && token.tokens) return inlineText(token.tokens);
      if (token.type === 'html') return '';
      const text = 'text' in token ? String(token.text) : '';
      return token.type === 'codespan' || !text.includes('&') ? text : decodeEntities(text);
    })
    .join('');
}

/**
 * The headings of Markdown that one PageMarkdown renders, in order, each with the id and words it
 * takes rendered (headingIds) and its level: what a page's contents list from its data.
 */
export function markdownHeadings(markdown: string): { id: string; text: string; level: number }[] {
  const slug = headingSlugger();
  return marked.lexer(headingsOnly(markdown)).flatMap((token) => {
    if (token.type !== 'heading') return [];
    // marked's generic token keeps the type check above from narrowing it.
    const heading = token as Tokens.Heading;
    const text = inlineText(heading.tokens);
    return [{ id: slug(text), text, level: heading.depth }];
  });
}

/**
 * Markdown's headings alone, with the ids and words they take rendered (headingIds), for a section
 * waiting its turn to show (SectionOutline): without the Markdown pipeline, which a page's later
 * sections would otherwise run before its first paint.
 */
function OutlineHeadings({ markdown }: { markdown: string }) {
  return markdownHeadings(markdown).map(({ id, text, level }, index) => {
    // A heading's level is 1 to 6, which its element's name takes.
    const Heading = `h${level}` as 'h2';
    return (
      <Heading key={index} id={id}>
        {text}
      </Heading>
    );
  });
}

/**
 * A page's Markdown, or a part of it such as one section, with its links resolved. `className`
 * gives it a role in the catalogue's type hierarchy, such as `site-lead` for a section's opening
 * paragraph (SiteText.css).
 */
export function PageMarkdown(
  props: ({ document: DocumentationEntry } | { markdown: string; path: string }) & {
    className?: string;
    /** Whether its links show as their words alone, as inside a tile that is a link itself. */
    linkless?: boolean;
  },
) {
  const [markdown, path] =
    'document' in props
      ? [props.document.markdown ?? '', props.document.path]
      : [props.markdown, props.path];
  // A section waiting its turn to show renders its headings alone (SectionOutline).
  const outline = useSectionOutline();
  const guidance = useContext(GuidanceLists);
  const plugins = useMemo(
    () => (guidance ? [headingIds, componentNames(path)] : rehypePlugins),
    [guidance, path],
  );
  if (outline) return <OutlineHeadings markdown={markdown} />;
  return (
    <Markdown
      components={elements}
      className={classNames(guidance && 'site-guidance', props.className) || undefined}
      rehypePlugins={plugins}
      renderLink={({ href, children, ...link }: MarkdownLinkProps) =>
        props.linkless ? (
          <span>{children}</span>
        ) : (
          <Link {...link} href={documentationHref(href, path)}>
            {children}
          </Link>
        )
      }
    >
      {markdown}
    </Markdown>
  );
}
