'use client';
// @client-module react-markdown imports useEffect and useState, which React's server build lacks,
// so Markdown cannot be a server component even without its own useMemo.

import {
  createContext,
  createElement,
  useContext,
  useMemo,
  type ComponentPropsWithRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';
import ReactMarkdown, { type Components, type Options } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { classNames } from '../internal/classNames.js';
import { useMessages } from '../internal/EnvUIContext.js';
import {
  markdown as markdownMessages,
  type MarkdownMessages,
} from '../foundations/messages/markdown.js';
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

/** The text of a table's first header cell, which names its first column. */
function firstHeader(table: HastNode): string {
  const find = (node: HastNode): HastNode | undefined =>
    node.tagName === 'th' ? node : node.children?.map(find).find(Boolean);
  const header = find(table);
  return header ? textOf(header).trim() : '';
}

/**
 * Names each table's scrolling region after the table: its caption, or the heading it follows, as
 * "Keyboard table" (messages.tableNamed), else its first column's header, as "Variant table", else
 * "Table" (messages.table), numbered where several take one name. Regions need names of their
 * own, which one shared name such as "Table" is not, also across the Markdown of one page.
 */
function rehypeTableNames(messages: MarkdownMessages) {
  return () => (tree: HastNode) => {
    let heading = '';
    const counts = new Map<string, number>();
    const visit = (node: HastNode) => {
      if (node.type === 'element' && /^h[1-6]$/.test(node.tagName ?? '')) {
        heading = textOf(node).trim();
        return;
      }
      if (node.type === 'element' && node.tagName === 'table') {
        const caption = node.children?.find((child) => child.tagName === 'caption');
        const column = heading ? '' : firstHeader(node);
        const base = caption
          ? textOf(caption).trim()
          : heading || column
            ? messages.tableNamed({ name: heading || column })
            : messages.table;
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

/** What the elements of one Markdown render take from its props. */
interface MarkdownOptions {
  headingOffset: number;
  renderLink: MarkdownProps['renderLink'];
  codeCopyable: boolean;
  messages: MarkdownMessages;
}

const MarkdownOptionsContext = createContext<MarkdownOptions | null>(null);

function useMarkdownOptions(): MarkdownOptions {
  const options = useContext(MarkdownOptionsContext);
  if (!options) throw new Error('A Markdown element rendered outside Markdown.');
  return options;
}

/**
 * envUI's elements for Markdown, each one component for good: they read the props they depend on,
 * such as `renderLink`, from the Markdown around them, so a new `renderLink` on every render, as an
 * inline function is, renders the same elements again rather than building every one anew.
 */
function heading(level: 1 | 2 | 3 | 4 | 5 | 6): NonNullable<Components['h1']> {
  return function MarkdownHeading({ node: _node, ...headingProps }) {
    const { headingOffset } = useMarkdownOptions();
    return createElement(`h${Math.min(6, level + headingOffset)}`, headingProps);
  };
}

const elements: Components = {
  h1: heading(1),
  h2: heading(2),
  h3: heading(3),
  h4: heading(4),
  h5: heading(5),
  h6: heading(6),
  a: function MarkdownLink({ node: _node, href, ...linkProps }) {
    const { renderLink } = useMarkdownOptions();
    if (!href) return <span>{linkProps.children}</span>;
    return renderLink ? renderLink({ ...linkProps, href }) : <Link {...linkProps} href={href} />;
  },
  code: ({ node: _node, ...codeProps }) => <Code {...codeProps} />,
  kbd: ({ node: _node, ...keyProps }) => <Kbd {...keyProps} />,
  pre: function MarkdownCodeBlock({ node, children: preChildren }) {
    const { codeCopyable } = useMarkdownOptions();
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
  table: function MarkdownTable({
    node: _node,
    'data-env-table-name': name,
    ...tableProps
  }: TableProps) {
    const { messages } = useMarkdownOptions();
    return (
      <div
        className="env-markdown-table"
        tabIndex={0}
        role="region"
        aria-label={typeof name === 'string' ? name : messages.table}
      >
        <table {...tableProps} />
      </div>
    );
  },
  input: function MarkdownTask({ checked }) {
    const { messages } = useMarkdownOptions();
    return (
      <Checkbox
        checked={Boolean(checked)}
        disabled
        aria-label={checked ? messages.taskDone : messages.taskOpen}
      />
    );
  },
  img: ({ node: _node, src, ...imageProps }) =>
    src ? <img {...imageProps} src={src} loading="lazy" /> : <span>{imageProps.alt}</span>,
};

/**
 * CommonMark prose with tables, task lists and other extensions, in envUI typography and code. The
 * names of its table regions and task checkboxes come from EnvUIProvider's messages.markdown.
 */
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
  const messages = useMessages('markdown', markdownMessages);
  const options = useMemo<MarkdownOptions>(
    () => ({ headingOffset, renderLink, codeCopyable, messages }),
    [headingOffset, renderLink, codeCopyable, messages],
  );
  const mergedComponents = useMemo(
    () => (componentOverrides ? { ...elements, ...componentOverrides } : elements),
    [componentOverrides],
  );
  const mergedRehypePlugins = useMemo(
    () => [rehypeTableNames(messages), ...(rehypePlugins ?? [])],
    [rehypePlugins, messages],
  );
  const mergedRemarkPlugins = useMemo(
    () => [...markdownPlugins, ...(remarkPlugins ?? []), remarkDropHtml],
    [remarkPlugins],
  );
  return (
    <div {...props} className={classNames('env-markdown', 'env-prose', className)}>
      <MarkdownOptionsContext.Provider value={options}>
        <ReactMarkdown
          remarkPlugins={mergedRemarkPlugins}
          rehypePlugins={mergedRehypePlugins}
          components={mergedComponents}
          skipHtml
        >
          {children}
        </ReactMarkdown>
      </MarkdownOptionsContext.Provider>
    </div>
  );
}
