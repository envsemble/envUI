import { createInlineMarkdownSpec, flattenExtensions, mergeAttributes } from '@tiptap/core';
import Mention from '@tiptap/extension-mention';
import { createReferenceNodeView } from './Reference.js';
import { referenceFromAttributes } from './referenceAttributes.js';
import type { RichTextRenderOptions } from '../types.js';
import '../../../styles/Base.css';
import '../../../styles/Prose.css';
import '../../../styles/RichText.css';

function parsePercentEncodedAttributes(source: string) {
  const attributes: Record<string, string> = {};
  for (const match of source.matchAll(/(\w+)="([^"\s]*)"/g)) {
    try {
      attributes[match[1]] = decodeURIComponent(match[2]);
    } catch {
      attributes[match[1]] = match[2];
    }
  }
  return attributes;
}

function percentEncodeAttributesForRoundTrip(attributes: Record<string, unknown>) {
  return Object.entries(attributes)
    .filter(([, value]) => value != null)
    .map(([key, value]) => `${key}="${encodeURIComponent(String(value))}"`)
    .join(' ');
}

const referenceMarkdown = createInlineMarkdownSpec({
  nodeName: 'envReference',
  name: 'reference',
  selfClosing: true,
  allowedAttributes: ['id', 'label', 'kind', 'href', 'mentionSuggestionChar', 'marks'],
  parseAttributes: parsePercentEncodedAttributes,
  serializeAttributes: percentEncodeAttributesForRoundTrip,
});

type ReferenceMarkdownNode = Parameters<typeof referenceMarkdown.renderMarkdown>[0];

function keepAtomMarksInShortcode(node: ReferenceMarkdownNode): ReferenceMarkdownNode {
  return {
    ...node,
    attrs: {
      ...node.attrs,
      ...(node.marks?.length ? { marks: JSON.stringify(node.marks) } : {}),
    },
  };
}

function parseMarksOrNoneWhenMalformed(marks: string): unknown {
  try {
    return JSON.parse(marks);
  } catch {
    return undefined;
  }
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
  return Mention.extend({
    name: 'envReference',
    ...referenceMarkdown,
    renderMarkdown(node) {
      return referenceMarkdown.renderMarkdown(keepAtomMarksInShortcode(node));
    },
    parseMarkdown(token, helpers) {
      const parsed = referenceMarkdown.parseMarkdown(token, helpers);
      if (!parsed || Array.isArray(parsed) || !('type' in parsed)) return parsed;
      const { marks, ...attrs } = parsed.attrs ?? {};
      if (typeof marks !== 'string') return { ...parsed, attrs };
      const decoded = parseMarksOrNoneWhenMalformed(marks);
      if (Array.isArray(decoded))
        return {
          ...parsed,
          attrs,
          marks: decoded.filter(
            (mark) => mark && typeof mark.type === 'string' && allowedMarks.has(mark.type),
          ),
        };
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
        `${reference.trigger}${reference.label}`,
      ];
    },
    renderText({ node }) {
      const ref = referenceFromAttributes(node.attrs);
      return `${ref.trigger}${ref.label}`;
    },
  }).configure({ deleteTriggerWithBackspace: true });
}
