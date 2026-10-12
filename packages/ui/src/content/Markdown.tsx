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

export interface MarkdownLinkProps extends ComponentPropsWithoutRef<'a'> {
  href: string;
}
export interface MarkdownProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  children: string;
  /** Add to the document's heading levels; levels are capped at h6. */
  headingOffset?: 0 | 1 | 2 | 3 | 4 | 5;
  /** Receives safe hrefs and native anchor props. Retain a real anchor destination. */
  renderLink?: (props: MarkdownLinkProps) => ReactNode;
  codeCopyable?: boolean;
  /** Inline code: dark (default, as Code), or subtle for prose dense with identifiers, paths and hashes. */
  inlineCode?: 'dark' | 'subtle';
  /**
   * react-markdown component overrides, merged over envUI's own; the application's win. Native
   * props such as id and className reach the element.
   */
  components?: Components;
  /** remark plugins that run after envUI's GFM support. */
  remarkPlugins?: Options['remarkPlugins'];
  /** rehype plugins, such as heading ids; envUI adds none of its own. */
  rehypePlugins?: Options['rehypePlugins'];
}

interface MarkdownNode {
  type: string;
  children?: MarkdownNode[];
}

/**
 * Raw HTML leaves the Markdown tree before it becomes HTML, after every remark plugin, so no
 * rehype plugin (rehype-raw, say) can render it; skipHtml alone acts after the rehype plugins.
 */
function remarkDropHtml() {
  const drop = (node: MarkdownNode) => {
    if (!node.children) return;
    node.children = node.children.filter((child) => child.type !== 'html');
    node.children.forEach(drop);
  };
  return drop;
}

const markdownPlugins = [remarkGfm];

/** CommonMark and GFM prose composed with envUI typography and code components. */
export function Markdown({
  children,
  headingOffset = 0,
  renderLink,
  codeCopyable = false,
  inlineCode = 'dark',
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
      code: ({ node: _node, ...codeProps }) => <Code appearance={inlineCode} {...codeProps} />,
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
      table: ({ node: _node, ...tableProps }) => (
        <div className="env-markdown-table" tabIndex={0} role="region" aria-label="Table">
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
  }, [headingOffset, renderLink, codeCopyable, inlineCode]);
  const mergedComponents = useMemo(
    () => (componentOverrides ? { ...components, ...componentOverrides } : components),
    [components, componentOverrides],
  );
  const mergedRemarkPlugins = useMemo(
    () => [...markdownPlugins, ...(remarkPlugins ?? []), remarkDropHtml],
    [remarkPlugins],
  );
  return (
    <div {...props} className={classNames('env-markdown', className)}>
      <ReactMarkdown
        remarkPlugins={mergedRemarkPlugins}
        rehypePlugins={rehypePlugins}
        components={mergedComponents}
        skipHtml
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
