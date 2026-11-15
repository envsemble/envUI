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
import { classNames } from '../shared/Attributes';

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

const headingOfThisPage = /^#./;
const absoluteOrEmptyFragment = /^(?:[a-z][a-z\d+.-]*:|#)/i;

function documentationHref(href: string, sourcePath: string) {
  if (headingOfThisPage.test(href)) return routeHref(sectionOfCurrentRoute(decodedFragment(href)));
  if (absoluteOrEmptyFragment.test(href)) return href;
  const url = new URL(href, `https://envui.invalid/docs/${sourcePath}`);
  const target = documents.find(
    (document) => document.path === url.pathname.slice('/docs/'.length),
  );
  if (!target) return href;
  const section = url.hash.length > 1 ? decodedFragment(url.hash) : undefined;
  const page = groupedPages.find((entry) => entry.document.path === target.path);
  const opensFoundationGuide =
    page?.section === 'Foundations' && (section || inDocs(currentRoute()));
  const route = routeOfDocument(target.id, {
    view: opensFoundationGuide ? 'usage' : undefined,
    section,
  });
  return route ? routeHref(route) : href;
}

function textOf(node: { type: string; value?: string; children?: unknown[] }): string {
  if (node.type === 'text') return node.value ?? '';
  return (node.children ?? []).map((child) => textOf(child as typeof node)).join('');
}

const headingIds: NonNullable<MarkdownProps['rehypePlugins']>[number] = () => (tree) => {
  const slug = headingSlugger();
  const visit = (node: {
    type: string;
    tagName?: string;
    properties?: Record<string, unknown>;
    children?: unknown[];
  }) => {
    if (node.type === 'element' && /^h[1-6]$/.test(node.tagName ?? '')) {
      if (!node.properties?.id) node.properties = { ...node.properties, id: slug(textOf(node)) };
    } else for (const child of node.children ?? []) visit(child as typeof node);
  };
  visit(tree as Parameters<typeof visit>[0]);
};

export const GuidanceLists = createContext(false);

type HastNode = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};

const trailingComponentName = /\s*\(([A-Z][A-Za-z]*)\)\.?\s*$/;

const isCompoundComponentName = (name: string) => /[a-z][A-Z]/.test(name);

const componentPage = (name: string) =>
  groupedPages.find(
    (page) =>
      !page.path.startsWith('docs/') &&
      (page.document.metadata?.components ?? page.document.components)?.includes(name),
  );

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

const componentNames =
  (path: string): NonNullable<MarkdownProps['rehypePlugins']>[number] =>
  () =>
  (tree) => {
    const visit = (node: HastNode) => {
      if (node.type === 'element' && node.tagName === 'li') {
        const end = itemEnd(node);
        const text = end?.parent.children![end.index];
        const match = text?.value && trailingComponentName.exec(text.value);
        const page = match && componentPage(match[1]);
        if (end && text && match && (page || isCompoundComponentName(match[1]))) {
          text.value = text.value?.slice(0, match.index);
          const linksToOtherPage = page && page.document.path !== path;
          const name: HastNode = {
            type: 'element',
            tagName: linksToOtherPage ? 'a' : 'span',
            properties: linksToOtherPage
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
    visit(tree as HastNode);
  };

const rehypePlugins = [headingIds];

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

function decodeEntities(text: string) {
  if (typeof document === 'undefined') return text;
  const element = document.createElement('textarea');
  element.innerHTML = text;
  return element.value;
}

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

export function markdownHeadings(markdown: string): { id: string; text: string; level: number }[] {
  const slug = headingSlugger();
  return marked.lexer(headingsOnly(markdown)).flatMap((token) => {
    if (token.type !== 'heading') return [];
    const heading = token as Tokens.Heading;
    const text = inlineText(heading.tokens);
    return [{ id: slug(text), text, level: heading.depth }];
  });
}

function OutlineHeadings({ markdown }: { markdown: string }) {
  return markdownHeadings(markdown).map(({ id, text, level }, index) => {
    const Heading = `h${level}` as 'h2';
    return (
      <Heading key={index} id={id}>
        {text}
      </Heading>
    );
  });
}

export function PageMarkdown(
  props: ({ document: DocumentationEntry } | { markdown: string; path: string }) & {
    className?: string;
    linkless?: boolean;
  },
) {
  const [markdown, path] =
    'document' in props
      ? [props.document.markdown ?? '', props.document.path]
      : [props.markdown, props.path];
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
