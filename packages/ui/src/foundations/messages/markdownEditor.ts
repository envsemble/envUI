/**
 * The English defaults of the `markdownEditor` messages: MarkdownEditor. EnvUIProvider's
 * `messages.markdownEditor` overrides any of them.
 */
export const markdownEditor = {
  /** The preview of an empty document. */
  empty: 'Nothing to preview.',
  /** Names the formatting toolbar. */
  toolbar: 'Markdown formatting',
  /** Names the write and preview tabs. */
  views: 'Markdown editor views',
  /** The write tab. */
  write: 'Write',
  /** The preview tab. */
  preview: 'Preview',
};

export type MarkdownEditorMessages = typeof markdownEditor;
