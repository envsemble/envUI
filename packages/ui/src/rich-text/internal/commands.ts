import type { Editor } from '@tiptap/core';
import type { RichTextCommand } from '../types.js';

/** Every command of RichTextEditor's toolbar, in order. */
export const defaultRichTextCommands: readonly RichTextCommand[] = [
  'heading',
  'bold',
  'italic',
  'strike',
  'inline-code',
  'bullet-list',
  'numbered-list',
  'task-list',
  'quote',
  'code-block',
  'link',
  'table',
];

/** The block commands the slash menu offers, in order, before the application's own. */
export const slashCommandIds: readonly Exclude<RichTextCommand, 'link'>[] = [
  'heading',
  'bullet-list',
  'numbered-list',
  'task-list',
  'quote',
  'code-block',
  'table',
];

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
