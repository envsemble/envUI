'use client';
// @client-module react-markdown imports useEffect and useState, which React's server build lacks,
// so Markdown cannot be a server component even without its own useMemo.

import {
  createElement,
  useMemo,
  type ComponentPropsWithRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';
import ReactMarkdown, { type Components, type Options } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { classNames } from '../internal/classNames.js';
import { Checkbox } from '../forms/Checkbox.js';
import { Link } from '../actions/Link.js';
import { Code } from './Code.js';
import { CodeBlock } from './CodeBlock.js';
import { Kbd } from './Kbd.js';

export interface MarkdownLinkProps extends ComponentPropsWithoutRef<'a'> {
  href: string;
}
export interface MarkdownProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** The Markdown string to render. */
  children: string;
  /** Add to the document's heading levels; levels are capped at h6. */
  headingOffset?: 0 | 1 | 2 | 3 | 4 | 5;
  /** Receives safe hrefs and native anchor props. Retain a real anchor destination. */
  renderLink?: (props: MarkdownLinkProps) => ReactNode;
  /** Gives each code block a copy button; false by default. */
  codeCopyable?: boolean;
  /**
   * react-markdown component overrides, merged over envUI's own; the application's win. Native
   * props such as id and className reach the element.
   */
  components?: Components;
  /** remark plugins that run after envUI's own Markdown extensions. */
  remarkPlugins?: Options['remarkPlugins'];
  /** rehype plugins, such as heading ids; envUI adds none of its own. */
  rehypePlugins?: Options['rehypePlugins'];
}

interface HastNode {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

const textOf = (node: HastNode): string =>
  node.type === 'text' ? (node.value ?? '') : (node.children ?? []).map(textOf).join('');

/**
 * Names each table's scrolling region after the table: its caption, or the heading it follows, as
 * "Keyboard table", numbered when a heading has several. Regions need names of their own, which
 * one shared name such as "Table" is not.
 */
function rehypeTableNames() {
  return (tree: HastNode) => {
    let heading = '';
    const counts = new Map<string, number>();
    const visit = (node: HastNode) => {
      if (node.type === 'element' && /^h[1-6]$/.test(node.tagName ?? '')) {
        heading = textOf(node).trim();
        return;
      }
      if (node.type === 'element' && node.tagName === 'table') {
        const caption = node.children?.find((child) => child.tagName === 'caption');
        const base = caption ? textOf(caption).trim() : heading ? `${heading} table` : 'Table';
        const count = (counts.get(base) ?? 0) + 1;
        counts.set(base, count);
        node.properties = {
          ...node.properties,
          dataEnvTableName: count > 1 ? `${base} ${count}` : base,
        };
        return;
      }
      node.children?.forEach(visit);
    };
    visit(tree);
  };
}

interface MarkdownNode {
  type: string;
  value?: string;
  data?: { hName?: string };
  children?: MarkdownNode[];
}

const keyOpen = /^<kbd>$/i;
const keyClose = /^<\/kbd>$/i;

/** <kbd>Ctrl</kbd> becomes a key: the one raw HTML element kept, around plain text only. */
function keepKeys(children: MarkdownNode[]) {
  const kept: MarkdownNode[] = [];
  for (let index = 0; index < children.length; index++) {
    const [open, text, close] = children.slice(index, index + 3);
    if (
      open?.type === 'html' &&
      keyOpen.test(open.value ?? '') &&
      text?.type === 'text' &&
      close?.type === 'html' &&
      keyClose.test(close.value ?? '')
    ) {
      kept.push({ type: 'key', data: { hName: 'kbd' }, children: [text] });
      index += 2;
    } else kept.push(children[index]!);
  }
  return kept;
}

/**
 * Raw HTML leaves the Markdown tree before it becomes HTML, after every remark plugin, so no
 * rehype plugin (rehype-raw, say) can render it; skipHtml alone acts after the rehype plugins.
 * Keys written as <kbd>Ctrl</kbd> stay, and render as Kbd.
 */
function remarkDropHtml() {
  const drop = (node: MarkdownNode) => {
    if (!node.children) return;
    node.children = keepKeys(node.children).filter((child) => child.type !== 'html');
    node.children.forEach(drop);
  };
  return drop;
}

const markdownPlugins = [remarkGfm];

type TableProps = ComponentPropsWithoutRef<'table'> & {
  node?: unknown;
  'data-env-table-name'?: unknown;
};

/** CommonMark prose with tables, task lists and other extensions, in envUI typography and code. */
export function Markdown({
  children,
  headingOffset = 0,
  renderLink,
  codeCopyable = false,
  components: componentOverrides,
  remarkPlugins,
  rehypePlugins,
  className,
  ...props
}: MarkdownProps) {
  const components = useMemo<Components>(() => {
    const headings: Components = {};
    for (const level of [1, 2, 3, 4, 5, 6] as const) {
      headings[`h${level}`] = ({ node: _node, ...headingProps }) =>
        createElement(`h${Math.min(6, level + headingOffset)}`, headingProps);
    }
    return {
      ...headings,
      a: ({ node: _node, href, ...linkProps }) =>
        href ? (
          renderLink ? (
            renderLink({ ...linkProps, href })
          ) : (
            <Link {...linkProps} href={href} />
          )
        ) : (
          <span>{linkProps.children}</span>
        ),
      code: ({ node: _node, ...codeProps }) => <Code {...codeProps} />,
      kbd: ({ node: _node, ...keyProps }) => <Kbd {...keyProps} />,
      pre: ({ node, children: preChildren }) => {
        const code = node?.children.find(
          (child) => child.type === 'element' && child.tagName === 'code',
        );
        if (!code || code.type !== 'element') return <pre>{preChildren}</pre>;
        const source = code.children
          .map((child) => (child.type === 'text' ? child.value : ''))
          .join('');
        const language = String(code.properties.className ?? '').match(/language-([^,\s]+)/)?.[1];
        return (
          <CodeBlock language={language} copyable={codeCopyable}>
            {source}
          </CodeBlock>
        );
      },
      table: ({ node: _node, 'data-env-table-name': name, ...tableProps }: TableProps) => (
        <div
          className="env-markdown-table"
          tabIndex={0}
          role="region"
          aria-label={typeof name === 'string' ? name : 'Table'}
        >
          <table {...tableProps} />
        </div>
      ),
      input: ({ checked }) => (
        <Checkbox
          checked={Boolean(checked)}
          disabled
          aria-label={checked ? 'Completed task' : 'Incomplete task'}
        />
      ),
      img: ({ node: _node, src, ...imageProps }) =>
        src ? <img {...imageProps} src={src} loading="lazy" /> : <span>{imageProps.alt}</span>,
    };
  }, [headingOffset, renderLink, codeCopyable]);
  const mergedComponents = useMemo(
    () => (componentOverrides ? { ...components, ...componentOverrides } : components),
    [components, componentOverrides],
  );
  const mergedRehypePlugins = useMemo(
    () => [rehypeTableNames, ...(rehypePlugins ?? [])],
    [rehypePlugins],
  );
  const mergedRemarkPlugins = useMemo(
    () => [...markdownPlugins, ...(remarkPlugins ?? []), remarkDropHtml],
    [remarkPlugins],
  );
  return (
    <div {...props} className={classNames('env-markdown', className)}>
      <ReactMarkdown
        remarkPlugins={mergedRemarkPlugins}
        rehypePlugins={mergedRehypePlugins}
        components={mergedComponents}
        skipHtml
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
