import { createContext, useContext } from 'react';
import { createInlineMarkdownSpec, flattenExtensions, mergeAttributes } from '@tiptap/core';
import Mention from '@tiptap/extension-mention';
import { NodeViewWrapper, ReactNodeViewRenderer, type NodeViewProps } from '@tiptap/react';
import { Button } from '../actions/Button.js';
import type { RichTextReference, RichTextRenderOptions } from './Types.js';

export const RichTextRenderingContext = createContext<
  (RichTextRenderOptions & { readOnly: boolean }) | null
>(null);

/** Use percent encoding inside Tiptap's shortcode utility so quotes/brackets roundtrip. */
const referenceMarkdown = createInlineMarkdownSpec({
  nodeName: 'envReference',
  name: 'reference',
  selfClosing: true,
  allowedAttributes: ['id', 'label', 'kind', 'href', 'mentionSuggestionChar', 'marks'],
  parseAttributes: (source) => {
    const attributes: Record<string, string> = {};
    for (const match of source.matchAll(/(\w+)="([^"\s]*)"/g)) {
      try {
        attributes[match[1]] = decodeURIComponent(match[2]);
      } catch {
        attributes[match[1]] = match[2];
      }
    }
    return attributes;
  },
  serializeAttributes: (attributes) =>
    Object.entries(attributes)
      .filter(([, value]) => value != null)
      .map(([key, value]) => `${key}="${encodeURIComponent(String(value))}"`)
      .join(' '),
});

export function referenceFromAttributes(attributes: Record<string, unknown>): RichTextReference {
  return {
    id: String(attributes.id ?? ''),
    label: String(attributes.label ?? attributes.id ?? ''),
    kind: typeof attributes.kind === 'string' ? attributes.kind : undefined,
    href: typeof attributes.href === 'string' ? attributes.href : undefined,
    char: String(attributes.mentionSuggestionChar ?? ''),
  };
}

/** Relative paths and ordinary web/mail/telephone URLs; no domain-specific schemes. */
export function safeRichTextUrl(url: unknown): boolean {
  if (typeof url !== 'string') return false;
  // Strips control characters and spaces, which browsers ignore inside a URL scheme.
  // eslint-disable-next-line no-control-regex
  const normalized = url.replace(/[\u0000-\u0020\u007f-\u009f]/g, '');
  return (
    normalized.length > 0 &&
    (!/^[a-z][a-z\d+.-]*:/i.test(normalized) || /^(https?:|mailto:|tel:)/i.test(normalized))
  );
}

export function ReferenceContent({
  reference,
  selected = false,
  readOnly,
  linked = false,
  options,
}: {
  reference: RichTextReference;
  selected?: boolean;
  readOnly: boolean;
  linked?: boolean;
  options: RichTextRenderOptions;
}) {
  const content =
    options.renderReference?.(reference, { readOnly, selected }) ??
    `${reference.char ?? ''}${reference.label}`;
  const className = 'env-rich-text-reference';
  if (linked)
    return (
      <span className={className} data-reference-id={reference.id}>
        {content}
      </span>
    );
  if (reference.href && safeRichTextUrl(reference.href))
    return (
      <a
        className={className}
        href={reference.href}
        data-reference-id={reference.id}
        onClick={(event) => {
          if (!readOnly) event.preventDefault();
          options.onReferenceClick?.(reference, event);
        }}
      >
        {content}
      </a>
    );
  if (options.onReferenceClick)
    return (
      <Button
        className={className}
        variant="secondary"
        data-reference-id={reference.id}
        onClick={(event) => options.onReferenceClick?.(reference, event)}
      >
        {content}
      </Button>
    );
  return (
    <span
      className={className}
      data-reference-id={reference.id}
      onClick={(event) => options.onReferenceClick?.(reference, event)}
    >
      {content}
    </span>
  );
}

export function createReferenceExtension(options: RichTextRenderOptions) {
  const allowedMarks = new Set([
    'bold',
    'italic',
    'strike',
    'code',
    'link',
    ...flattenExtensions(options.extensions ?? [])
      .filter((extension) => extension.type === 'mark')
      .map((extension) => extension.name),
  ]);
  function ReferenceView({ node, selected, editor }: NodeViewProps) {
    const context = useContext(RichTextRenderingContext);
    return (
      <NodeViewWrapper as="span" contentEditable={false} data-reference-id={node.attrs.id}>
        <ReferenceContent
          reference={referenceFromAttributes(node.attrs)}
          selected={selected}
          readOnly={context?.readOnly ?? !editor.isEditable}
          linked={node.marks.some((mark) => mark.type.name === 'link')}
          options={context ?? options}
        />
      </NodeViewWrapper>
    );
  }
  return Mention.extend({
    name: 'envReference',
    ...referenceMarkdown,
    // Tiptap's MarkdownManager wraps marks around text only. Retain atom marks as
    // Tiptap JSON in the shortcode, then hand them straight back to the schema.
    renderMarkdown(node) {
      return referenceMarkdown.renderMarkdown({
        ...node,
        attrs: {
          ...node.attrs,
          ...(node.marks?.length ? { marks: JSON.stringify(node.marks) } : {}),
        },
      });
    },
    parseMarkdown(token, helpers) {
      const parsed = referenceMarkdown.parseMarkdown(token, helpers);
      if (!parsed || Array.isArray(parsed) || !('type' in parsed)) return parsed;
      const { marks, ...attrs } = parsed.attrs ?? {};
      if (typeof marks !== 'string') return { ...parsed, attrs };
      try {
        const decoded: unknown = JSON.parse(marks);
        if (Array.isArray(decoded))
          return {
            ...parsed,
            attrs,
            marks: decoded.filter(
              (mark) => mark && typeof mark.type === 'string' && allowedMarks.has(mark.type),
            ),
          };
      } catch {
        /* A malformed optional mark payload leaves the reference usable. */
      }
      return { ...parsed, attrs };
    },
    addAttributes() {
      return { ...this.parent?.(), kind: { default: null }, href: { default: null } };
    },
    addNodeView() {
      return ReactNodeViewRenderer(ReferenceView);
    },
    renderHTML({ node, HTMLAttributes }) {
      const reference = referenceFromAttributes(node.attrs);
      return [
        'span',
        mergeAttributes(HTMLAttributes, {
          'data-type': this.name,
          class: 'env-rich-text-reference',
        }),
        `${reference.char}${reference.label}`,
      ];
    },
    renderText({ node }) {
      const ref = referenceFromAttributes(node.attrs);
      return `${ref.char}${ref.label}`;
    },
  }).configure({ deleteTriggerWithBackspace: true });
}
