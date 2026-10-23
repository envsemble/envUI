import type { ComponentType } from 'react';
import type { MaterialSymbolProps } from '../../Icon.js';
import type { EditorMessages } from '../../foundations/messages/editor.js';
import { Checklist } from '../../icons/Checklist.js';
import { Code } from '../../icons/Code.js';
import { CodeBlocks } from '../../icons/CodeBlocks.js';
import { FormatBold } from '../../icons/FormatBold.js';
import { FormatItalic } from '../../icons/FormatItalic.js';
import { FormatListBulleted } from '../../icons/FormatListBulleted.js';
import { FormatListNumbered } from '../../icons/FormatListNumbered.js';
import { FormatQuote } from '../../icons/FormatQuote.js';
import { FormatStrikethrough } from '../../icons/FormatStrikethrough.js';
import { Link } from '../../icons/Link.js';
import { Table } from '../../icons/Table.js';
import { Title } from '../../icons/Title.js';

/** A formatting command of MarkdownEditor's or RichTextEditor's toolbar. */
export type EditorCommand =
  | 'heading'
  | 'bold'
  | 'italic'
  | 'strike'
  | 'bullet-list'
  | 'numbered-list'
  | 'task-list'
  | 'quote'
  | 'inline-code'
  | 'code-block'
  | 'link'
  | 'table';

/** What a toolbar shows for a command: its icon, and the key of its name in messages.editor. */
export interface EditorCommandInfo {
  icon: ComponentType<MaterialSymbolProps>;
  message: keyof EditorMessages;
}

/**
 * The commands both editors share, in toolbar order: each editor offers those it supports, and the
 * names come from EnvUIProvider's messages.editor.
 */
export const editorCommands: Readonly<Record<EditorCommand, EditorCommandInfo>> = {
  heading: { icon: Title, message: 'heading' },
  bold: { icon: FormatBold, message: 'bold' },
  italic: { icon: FormatItalic, message: 'italic' },
  strike: { icon: FormatStrikethrough, message: 'strike' },
  'bullet-list': { icon: FormatListBulleted, message: 'bulletList' },
  'numbered-list': { icon: FormatListNumbered, message: 'numberedList' },
  'task-list': { icon: Checklist, message: 'taskList' },
  quote: { icon: FormatQuote, message: 'quote' },
  'inline-code': { icon: Code, message: 'inlineCode' },
  'code-block': { icon: CodeBlocks, message: 'codeBlock' },
  link: { icon: Link, message: 'link' },
  table: { icon: Table, message: 'table' },
};

/**
 * The kind of each command, which groups it in the toolbar: text styles, lists, blocks, and the
 * things inserted, links and tables. Commands of one kind next to each other share a group.
 */
export const editorCommandGroup: Readonly<
  Record<EditorCommand, 'text' | 'lists' | 'blocks' | 'insert'>
> = {
  heading: 'text',
  bold: 'text',
  italic: 'text',
  strike: 'text',
  'inline-code': 'text',
  'bullet-list': 'lists',
  'numbered-list': 'lists',
  'task-list': 'lists',
  quote: 'blocks',
  'code-block': 'blocks',
  link: 'insert',
  table: 'insert',
};
