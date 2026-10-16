/**
 * The English defaults of the `editor` messages: The formatting commands MarkdownEditor and
 * RichTextEditor share. EnvUIProvider's `messages.editor` overrides any of them.
 */
export const editor = {
  /** A command. */
  heading: 'Heading',
  /** A command. */
  bold: 'Bold',
  /** A command. */
  italic: 'Italic',
  /** A command. */
  strike: 'Strikethrough',
  /** A command. */
  bulletList: 'Bulleted list',
  /** A command. */
  numberedList: 'Numbered list',
  /** A command. */
  taskList: 'Task list',
  /** A command. */
  quote: 'Quote',
  /** A command. */
  inlineCode: 'Inline code',
  /** A command. */
  codeBlock: 'Code block',
  /** A command. */
  link: 'Insert link',
  /** A command. */
  table: 'Insert table',
  /** A command. */
  undo: 'Undo',
  /** A command. */
  redo: 'Redo',
};

export type EditorMessages = typeof editor;
