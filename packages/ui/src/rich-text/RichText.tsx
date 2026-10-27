'use client';

import { useMemo } from 'react';
import { MarkdownManager } from '@tiptap/markdown';
import { renderToReactElement } from '@tiptap/static-renderer/pm/react';
import { classNames } from '../internal/classNames.js';
import { useMessages } from '../internal/EnvUIContext.js';
import { richText as richTextMessages } from '../foundations/messages/richText.js';
import { Link } from '../actions/Link.js';
import { Code } from '../content/Code.js';
import { CodeBlock } from '../content/CodeBlock.js';
import { Checkbox } from '../forms/Checkbox.js';
import { createRichTextExtensions } from './Extensions.js';
import { ReferenceContent } from './Reference.js';
import { referenceFromAttributes, safeRichTextUrl } from './ReferenceAttributes.js';
import type { RichTextProps } from './Types.js';

/**
 * Saved rich text, read-only: Markdown rendered with the editor's own schema and parser, so it
 * shows what RichTextEditor wrote, references included, with envUI's links, code and checkboxes.
 * It renders on the server too.
 */
export function RichText({
  children,
  extensions,
  renderReference,
  onReferenceClick,
  onLinkClick,
  className,
  ...props
}: RichTextProps) {
  const messages = useMessages('richText', richTextMessages);
  const schema = useMemo(() => createRichTextExtensions({ extensions }), [extensions]);
  const manager = useMemo(
    () =>
      new MarkdownManager({
        extensions: schema,
        marked: schema.find((extension) => extension.name === 'markdown')?.options.marked,
      }),
    [schema],
  );
  const document = useMemo(() => manager.parse(children), [manager, children]);
  const content = renderToReactElement({
    extensions: schema,
    content: document,
    options: {
      nodeMapping: {
        envReference: ({ node }) => (
          <ReferenceContent
            reference={referenceFromAttributes(node.attrs ?? {})}
            readOnly
            linked={node.marks.some((mark) => mark.type.name === 'link')}
            options={{ renderReference, onReferenceClick }}
          />
        ),
        taskItem: ({ node, children: content }) => (
          <li data-type="taskItem" data-checked={Boolean(node.attrs.checked)}>
            {/* In a span, as in the editor, so a task's row is as tall here as there. */}
            <span className="env-rich-text-task-check">
              <Checkbox
                checked={Boolean(node.attrs.checked)}
                disabled
                aria-label={node.textContent || messages.task}
              />
            </span>
            <div>{content}</div>
          </li>
        ),
        codeBlock: ({ node }) => (
          <CodeBlock language={node.attrs?.language}>{node.textContent}</CodeBlock>
        ),
        image: ({ node }) =>
          node.attrs?.src && safeRichTextUrl(node.attrs.src) ? (
            <img src={node.attrs.src} alt={node.attrs.alt ?? ''} loading="lazy" />
          ) : (
            <span>{node.attrs?.alt}</span>
          ),
      },
      markMapping: {
        code: ({ children: content }) => <Code>{content}</Code>,
        link: ({ mark, children: content }) =>
          safeRichTextUrl(mark.attrs?.href ?? '') ? (
            <Link
              href={mark.attrs!.href}
              target={typeof mark.attrs?.target === 'string' ? mark.attrs.target : undefined}
              rel={typeof mark.attrs?.rel === 'string' ? mark.attrs.rel : undefined}
              title={typeof mark.attrs?.title === 'string' ? mark.attrs.title : undefined}
              onClick={(event) => onLinkClick?.(mark.attrs!.href, event)}
            >
              {content}
            </Link>
          ) : (
            <span>{content}</span>
          ),
      },
    },
  });
  return (
    <div {...props} className={classNames('env-rich-text', 'env-prose', className)}>
      {content}
    </div>
  );
}
