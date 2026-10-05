import type { Editor } from '@tiptap/core';
import type { RichTextCommand, RichTextSlashCommand } from './Types.js';

export const richTextCommandLabels: Record<RichTextCommand, string> = {
  heading: 'Heading',
  bold: 'Bold',
  italic: 'Italic',
  strike: 'Strikethrough',
  'bullet-list': 'Bulleted list',
  'numbered-list': 'Numbered list',
  'task-list': 'Task list',
  quote: 'Quote',
  'inline-code': 'Inline code',
  'code-block': 'Code block',
  link: 'Insert link',
  table: 'Insert table',
};
export const defaultRichTextCommands = Object.keys(richTextCommandLabels) as RichTextCommand[];
export function runRichTextCommand(editor: Editor, command: Exclude<RichTextCommand, 'link'>) {
  const chain = editor.chain().focus();
  switch (command) {
    case 'heading':
      return chain.toggleHeading({ level: 2 }).run();
    case 'bold':
      return chain.toggleBold().run();
    case 'italic':
      return chain.toggleItalic().run();
    case 'strike':
      return chain.toggleStrike().run();
    case 'bullet-list':
      return chain.toggleBulletList().run();
    case 'numbered-list':
      return chain.toggleOrderedList().run();
    case 'task-list':
      return chain.toggleTaskList().run();
    case 'quote':
      return chain.toggleBlockquote().run();
    case 'inline-code':
      return chain.toggleCode().run();
    case 'code-block':
      return chain.toggleCodeBlock().run();
    case 'table':
      return chain.insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  }
}
export const defaultSlashCommands: RichTextSlashCommand[] = [
  'heading',
  'bullet-list',
  'numbered-list',
  'task-list',
  'quote',
  'code-block',
  'table',
].map((command) => ({
  id: command,
  label: richTextCommandLabels[command as RichTextCommand],
  run: (editor) => {
    runRichTextCommand(editor, command as Exclude<RichTextCommand, 'link'>);
  },
}));
export function richTextCommandActive(editor: Editor, command: RichTextCommand) {
  const name = {
    heading: 'heading',
    bold: 'bold',
    italic: 'italic',
    strike: 'strike',
    'bullet-list': 'bulletList',
    'numbered-list': 'orderedList',
    'task-list': 'taskList',
    quote: 'blockquote',
    'inline-code': 'code',
    'code-block': 'codeBlock',
    link: 'link',
    table: 'table',
  }[command];
  return editor.isActive(name);
}
