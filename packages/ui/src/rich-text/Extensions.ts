import type { AnyExtension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from '@tiptap/markdown';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { TableKit } from '@tiptap/extension-table';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Marked, type marked } from 'marked';
import { safeRichTextUrl } from './ReferenceAttributes.js';
import { createReferenceExtension } from './ReferenceExtension.js';
import type { RichTextRenderOptions } from './Types.js';

/**
 * The Tiptap extensions RichTextEditor and RichText share: formatting, lists and task lists,
 * tables, safe links and images, Markdown with raw HTML kept as text, a placeholder and references.
 * options.extensions are added after them, for other Tiptap integrations that need the same schema.
 */
export function createRichTextExtensions(
  options: RichTextRenderOptions & { placeholder?: string } = {},
): AnyExtension[] {
  // Keep raw HTML literal on both server and browser. Tiptap otherwise needs a
  // browser DOMParser for HTML embedded in Markdown, giving different SSR output.
  const parser = new Marked({ tokenizer: { html: () => false, tag: () => false } });
  return [
    StarterKit.configure({
      underline: false,
      link: { openOnClick: false, isAllowedUri: safeRichTextUrl },
    }),
    Markdown.configure({ marked: parser as unknown as typeof marked }),
    TaskList,
    TaskItem.configure({ nested: true }),
    TableKit,
    Image.extend({
      renderHTML({ node, HTMLAttributes }) {
        if (!safeRichTextUrl(node.attrs.src ?? '')) return ['span', {}, node.attrs.alt ?? ''];
        return this.parent?.({ node, HTMLAttributes }) ?? ['img', HTMLAttributes];
      },
    }).configure({ allowBase64: false }),
    Placeholder.configure({ placeholder: options.placeholder ?? '' }),
    createReferenceExtension(options).configure({
      suggestions: [],
      suggestion: { char: '\u0000', allow: () => false },
    }),
    ...(options.extensions ?? []),
  ];
}
