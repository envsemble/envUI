// The reference node of the rich text schema, in a module that is not a client module: the
// schema, its Markdown and its static HTML are plain functions, which a server component calls
// through createRichTextExtensions. The editor's React view of a reference stays in Reference.tsx.
import { createInlineMarkdownSpec, flattenExtensions, mergeAttributes } from '@tiptap/core';
import Mention from '@tiptap/extension-mention';
import { createReferenceNodeView } from './Reference.js';
import { referenceFromAttributes } from './referenceAttributes.js';
import type { RichTextRenderOptions } from '../types.js';

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
      return createReferenceNodeView(options);
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
