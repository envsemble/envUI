import type { AnyExtension, Editor } from '@tiptap/core';
import type { ComponentPropsWithoutRef, MouseEvent, ReactNode } from 'react';
import type { FieldProps, TextFieldAppearanceProps } from '../forms/internal/FieldFrame.js';
import type { MarkdownLink, MarkdownLinkRequest } from '../forms/MarkdownEditor.js';

/** Application-owned identity and display data; envUI assigns no meaning to kind or id. */
export interface RichTextReference {
  id: string;
  label: string;
  kind?: string;
  href?: string;
  char?: string;
}
export interface RichTextReferenceSource {
  char: string;
  label?: string;
  minQueryLength?: number;
  debounce?: number;
  allowSpaces?: boolean;
  items: (request: {
    query: string;
    signal: AbortSignal;
  }) => readonly RichTextReference[] | Promise<readonly RichTextReference[]>;
}
/** Tiptap supplies native click events in the editor; the static React view supplies React events. */
export type RichTextLinkEvent = MouseEvent<HTMLAnchorElement> | globalThis.MouseEvent;
export interface RichTextRenderOptions {
  /** Keep this array stable; extensions must implement Markdown parsing and serialization. */
  extensions?: AnyExtension[];
  renderReference?: (
    reference: RichTextReference,
    context: { readOnly: boolean; selected: boolean },
  ) => ReactNode;
  onReferenceClick?: (reference: RichTextReference, event: MouseEvent<HTMLElement>) => void;
  onLinkClick?: (href: string, event: RichTextLinkEvent) => void;
}
export type RichTextCommand =
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
export interface RichTextSlashCommand {
  id: string;
  label: string;
  run: (editor: Editor) => void;
}
export interface RichTextAttachment {
  url: string;
  label: string;
  /** An image uses a standard Markdown image. Files use a stable reference atom. */
  kind: 'image' | 'file';
  id?: string;
}
export interface RichTextEditorHandle {
  /** Tiptap commands/chains are the public action API, including external agent updates. */
  editor: Editor | null;
}
export interface RichTextEditorProps
  extends RichTextRenderOptions,
    FieldProps,
    TextFieldAppearanceProps,
    Omit<ComponentPropsWithoutRef<'div'>, 'defaultValue' | 'onChange' | 'children'> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (markdown: string) => void;
  name?: string;
  form?: string;
  placeholder?: string;
  disabled?: boolean;
  readOnly?: boolean;
  toolbar?: readonly RichTextCommand[] | false;
  references?: readonly RichTextReferenceSource[];
  /** true enables standard block commands; an array adds application commands to them. */
  slashCommands?: boolean | readonly RichTextSlashCommand[];
  /** For selections the URL marks existing content; label is used only for new links at the caret. */
  onRequestLink?: (
    request: MarkdownLinkRequest,
  ) => MarkdownLink | null | Promise<MarkdownLink | null>;
  onUpload?: (
    file: File,
    request: { signal: AbortSignal },
  ) => RichTextAttachment | null | Promise<RichTextAttachment | null>;
  accept?: string;
  multiple?: boolean;
}
export interface RichTextProps
  extends RichTextRenderOptions,
    Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  children: string;
}
