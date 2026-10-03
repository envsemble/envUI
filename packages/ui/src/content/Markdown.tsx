import {
  createElement,
  useMemo,
  type ComponentPropsWithRef,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { classNames } from '../internal/classNames.js';
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
}

const markdownPlugins = [remarkGfm];

/** CommonMark and GFM prose composed with envUI typography and code components. */
export function Markdown({
  children,
  headingOffset = 0,
  renderLink,
  codeCopyable = false,
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
            <a {...linkProps} href={href} />
          )
        ) : (
          <span>{linkProps.children}</span>
        ),
      code: ({ node: _node, ...codeProps }) => <Code {...codeProps} />,
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
      img: ({ node: _node, src, ...imageProps }) =>
        src ? <img {...imageProps} src={src} loading="lazy" /> : <span>{imageProps.alt}</span>,
    };
  }, [headingOffset, renderLink, codeCopyable]);
  return (
    <div {...props} className={classNames('env-markdown', className)}>
      <ReactMarkdown remarkPlugins={markdownPlugins} components={components} skipHtml>
        {children}
      </ReactMarkdown>
    </div>
  );
}
