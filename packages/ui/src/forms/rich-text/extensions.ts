import type { AnyExtension } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from '@tiptap/markdown';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { TableKit } from '@tiptap/extension-table';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import { Marked, type marked } from 'marked';
import { safeRichTextUrl } from './internal/referenceAttributes.js';
import { createReferenceExtension } from './internal/referenceExtension.js';
import { createTaskItemNodeView } from './internal/taskItem.js';
import type { RichTextRenderOptions } from './types.js';

const tiptapReadsOnlyWhatAMarkedInstanceHas = (instance: Marked) =>
  instance as unknown as typeof marked;

const suggestionThatNeverOpens = { char: '\u0000', allow: () => false };

/**
 * The Tiptap extensions RichTextEditor and RichText share: formatting, lists and task lists,
 * tables, safe links and images, Markdown with raw HTML kept as text, a placeholder and references.
 * options.extensions are added after them, for other Tiptap integrations that need the same schema.
 */
export function createRichTextExtensions(
  options: RichTextRenderOptions & { placeholder?: string } = {},
): AnyExtension[] {
  const rawHtmlAsTextWithoutBrowserDomParser = new Marked({
    tokenizer: { html: () => false, tag: () => false },
  });
  return [
    StarterKit.configure({
      underline: false,
      link: { openOnClick: false, isAllowedUri: safeRichTextUrl },
    }),
    Markdown.configure({
      marked: tiptapReadsOnlyWhatAMarkedInstanceHas(rawHtmlAsTextWithoutBrowserDomParser),
    }),
    TaskList,
    TaskItem.extend({ addNodeView: () => createTaskItemNodeView() }).configure({ nested: true }),
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
      suggestion: suggestionThatNeverOpens,
    }),
    ...(options.extensions ?? []),
  ];
}
