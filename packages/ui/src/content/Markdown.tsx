'use client';
// @client-module

import {
  createContext,
  createElement,
  useContext,
  useMemo,
  type ComponentPropsWithRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';
import ReactMarkdown, { defaultUrlTransform, type Components, type Options } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { classNames } from '../internal/classNames.js';
import { useMessages } from '../internal/provider/EnvUIContext.js';
import {
  markdown as markdownMessages,
  type MarkdownMessages,
} from '../foundations/messages/markdown.js';
import { Checkbox } from '../forms/Checkbox.js';
import { Link } from '../actions/Link.js';
import { Code } from './Code.js';
import { HighlightedCodeBlock } from './HighlightedCodeBlock.js';
import { Kbd } from './Kbd.js';
import {
  collectingMarkdown,
  givenMarkdownTree,
  noteMarkdownTree,
  type MarkdownTree,
} from './internal/givenMarkdownTrees.js';
import '../styles/Base.css';
import '../styles/Prose.css';
import '../styles/Markdown.css';

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
  /**
   * Schemes a link may take beside the safe ones, such as `['vscode']` for links that open the
   * editor, or the application's own. A link keeps a relative destination or an http, https,
   * mailto, irc, ircs or xmpp one either way; one with another scheme renders as plain text.
   * javascript, data and vbscript are refused even when listed, since a link with one runs code or
   * opens content the application didn't write.
   */
  allowLinkSchemes?: readonly string[];
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
  /**
   * Keeps raw HTML in the Markdown, such as details, sub, sup or an img with a width, for trusted
   * content such as the application's own docs or a README. Only rehype-raw in rehypePlugins
   * renders it, so give a sanitizer with it, such as rehype-sanitize. Without it, raw HTML is
   * dropped, apart from kbd around plain text.
   * @default false
   */
  allowHtml?: boolean;
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

function firstColumnHeader(table: HastNode): string {
  const find = (node: HastNode): HastNode | undefined =>
    node.tagName === 'th' ? node : node.children?.map(find).find(Boolean);
  const header = find(table);
  return header ? textOf(header).trim() : '';
}

function rehypeNameTableRegions(messages: MarkdownMessages) {
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
        const column = heading ? '' : firstColumnHeader(node);
        const sharedName = caption
          ? textOf(caption).trim()
          : heading || column
            ? messages.tableNamed({ name: heading || column })
            : messages.table;
        const count = (counts.get(sharedName) ?? 0) + 1;
        counts.set(sharedName, count);
        const ownName = count > 1 ? `${sharedName} ${count}` : sharedName;
        node.properties = { ...node.properties, dataEnvTableName: ownName };
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

function keepKbdAroundPlainText(children: MarkdownNode[]) {
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
    } else kept.push(children[index]);
  }
  return kept;
}

function remarkDropRawHtmlBeforeAnyRehypePlugin() {
  const drop = (node: MarkdownNode) => {
    if (!node.children) return;
    node.children = keepKbdAroundPlainText(node.children).filter((child) => child.type !== 'html');
    node.children.forEach(drop);
  };
  return drop;
}

const markdownPlugins = [remarkGfm];

const noOtherLinkSchemes: readonly string[] = [];

const schemesThatRunCode = new Set(['javascript', 'data', 'vbscript']);

function allowingLinkSchemes(schemes: readonly string[]): Options['urlTransform'] {
  const allowed = new Set(
    schemes
      .map((scheme) => scheme.replace(/:$/, '').toLowerCase())
      .filter((scheme) => !schemesThatRunCode.has(scheme)),
  );
  if (allowed.size === 0) return defaultUrlTransform;
  return (url, key) => {
    const safe = defaultUrlTransform(url);
    if (safe || key !== 'href') return safe;
    const colon = url.indexOf(':');
    return colon > 0 && allowed.has(url.slice(0, colon).toLowerCase()) ? url : '';
  };
}
const emptySourceThePreParsedTreeReplaces = '';

const rehypeNoteRenderedTree = (source: string) => () => (tree: MarkdownTree) =>
  noteMarkdownTree(source, tree);

type TableProps = ComponentPropsWithoutRef<'table'> & {
  node?: unknown;
  'data-env-table-name'?: unknown;
};

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

function heading(level: 1 | 2 | 3 | 4 | 5 | 6): NonNullable<Components['h1']> {
  return function MarkdownHeading({ node: _node, ...headingProps }) {
    const { headingOffset } = useMarkdownOptions();
    return createElement(`h${Math.min(6, level + headingOffset)}`, headingProps);
  };
}

const stableElementsReadingPropsFromContext: Components = {
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
      <HighlightedCodeBlock language={language} copyable={codeCopyable}>
        {source}
      </HighlightedCodeBlock>
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
  allowLinkSchemes = noOtherLinkSchemes,
  codeCopyable = false,
  components: componentOverrides,
  remarkPlugins,
  rehypePlugins,
  allowHtml = false,
  className,
  ...props
}: MarkdownProps) {
  const messages = useMessages('markdown', markdownMessages);
  const options = useMemo<MarkdownOptions>(
    () => ({ headingOffset, renderLink, codeCopyable, messages }),
    [headingOffset, renderLink, codeCopyable, messages],
  );
  const mergedComponents = useMemo(
    () =>
      componentOverrides
        ? { ...stableElementsReadingPropsFromContext, ...componentOverrides }
        : stableElementsReadingPropsFromContext,
    [componentOverrides],
  );
  const allowedLinkSchemes = allowLinkSchemes.join(' ');
  const urlTransform = useMemo(
    () => allowingLinkSchemes(allowedLinkSchemes ? allowedLinkSchemes.split(' ') : []),
    [allowedLinkSchemes],
  );
  const preParsedTree = givenMarkdownTree(children);
  const mergedRehypePlugins = useMemo(
    () =>
      preParsedTree
        ? [() => () => preParsedTree]
        : [
            rehypeNameTableRegions(messages),
            ...(rehypePlugins ?? []),
            ...(collectingMarkdown() ? [rehypeNoteRenderedTree(children)] : []),
          ],
    [preParsedTree, rehypePlugins, messages, children],
  );
  const mergedRemarkPlugins = useMemo(
    () =>
      preParsedTree
        ? []
        : allowHtml
          ? [...markdownPlugins, ...(remarkPlugins ?? [])]
          : [...markdownPlugins, ...(remarkPlugins ?? []), remarkDropRawHtmlBeforeAnyRehypePlugin],
    [preParsedTree, remarkPlugins, allowHtml],
  );
  return (
    <div {...props} className={classNames('env-markdown', 'env-prose', className)}>
      <MarkdownOptionsContext.Provider value={options}>
        <ReactMarkdown
          remarkPlugins={mergedRemarkPlugins}
          rehypePlugins={mergedRehypePlugins}
          components={mergedComponents}
          skipHtml={!allowHtml}
          urlTransform={urlTransform}
        >
          {preParsedTree ? emptySourceThePreParsedTreeReplaces : children}
        </ReactMarkdown>
      </MarkdownOptionsContext.Provider>
    </div>
  );
}
