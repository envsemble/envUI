import type { ComponentType } from 'react';
import type { SymbolIconProps } from '../../foundations/Icon.js';
import type { EditorMessages } from '../../foundations/messages/editor.js';
import { IconChecklist } from '../../icons/Checklist.js';
import { IconCode } from '../../icons/Code.js';
import { IconCodeBlocks } from '../../icons/CodeBlocks.js';
import { IconFormatBold } from '../../icons/FormatBold.js';
import { IconFormatItalic } from '../../icons/FormatItalic.js';
import { IconFormatListBulleted } from '../../icons/FormatListBulleted.js';
import { IconFormatListNumbered } from '../../icons/FormatListNumbered.js';
import { IconFormatQuote } from '../../icons/FormatQuote.js';
import { IconFormatStrikethrough } from '../../icons/FormatStrikethrough.js';
import { IconLink } from '../../icons/Link.js';
import { IconTable } from '../../icons/Table.js';
import { IconTitle } from '../../icons/Title.js';

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
  icon: ComponentType<SymbolIconProps>;
  message: keyof EditorMessages;
}

/**
 * The commands both editors share, in toolbar order: each editor offers those it supports, and the
 * names come from EnvUIProvider's messages.editor.
 */
export const editorCommands: Readonly<Record<EditorCommand, EditorCommandInfo>> = {
  heading: { icon: IconTitle, message: 'heading' },
  bold: { icon: IconFormatBold, message: 'bold' },
  italic: { icon: IconFormatItalic, message: 'italic' },
  strike: { icon: IconFormatStrikethrough, message: 'strike' },
  'bullet-list': { icon: IconFormatListBulleted, message: 'bulletList' },
  'numbered-list': { icon: IconFormatListNumbered, message: 'numberedList' },
  'task-list': { icon: IconChecklist, message: 'taskList' },
  quote: { icon: IconFormatQuote, message: 'quote' },
  'inline-code': { icon: IconCode, message: 'inlineCode' },
  'code-block': { icon: IconCodeBlocks, message: 'codeBlock' },
  link: { icon: IconLink, message: 'link' },
  table: { icon: IconTable, message: 'table' },
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
