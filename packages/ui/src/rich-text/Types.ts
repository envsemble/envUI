import type { AnyExtension, Editor } from '@tiptap/core';
import type { ComponentPropsWithoutRef, MouseEvent, ReactNode } from 'react';
import type { FieldProps, TextFieldAppearanceProps } from '../forms/internal/FieldFrame.js';
import type { MarkdownLink, MarkdownLinkRequest } from '../forms/MarkdownEditor.js';

/** Application-owned identity and display data; envUI assigns no meaning to kind or id. */
export interface RichTextReference {
  /** The stable identity the application resolves, such as a record's ID; saved in the Markdown. */
  id: string;
  /** The text the reference shows after its trigger, such as a person's name. */
  label: string;
  /** What the reference points at, such as contact or file, for the application's own rendering. */
  kind?: string;
  /** A destination: a relative path or an http, https, mailto or tel URL makes it a link. */
  href?: string;
  /** The trigger it was inserted with, such as @, shown before the label. */
  char?: string;
}
/** A kind of reference people insert by typing its trigger, such as @ for people. */
export interface RichTextReferenceSource {
  /**
   * The character that opens the suggestions when typed at the start of a line or after a space,
   * such as @ or #; unique within an editor.
   */
  char: string;
  /**
   * The suggestion list's accessible name, such as Contacts.
   * @default 'Suggestions'
   */
  label?: string;
  /** How many characters after the trigger before suggestions are asked for; 0 by default. */
  minQueryLength?: number;
  /** Milliseconds to wait after typing stops before items is called; 0 by default. */
  debounce?: number;
  /** Let the query run on past spaces, such as for full names. */
  allowSpaces?: boolean;
  /**
   * Returns the references that match the text typed after the trigger, at once or as a promise,
   * such as from a search on a server. The signal aborts when the query changes or the menu closes;
   * a rejected promise shows Suggestions could not load.
   */
  items: (request: {
    query: string;
    signal: AbortSignal;
  }) => readonly RichTextReference[] | Promise<readonly RichTextReference[]>;
}
/** Tiptap supplies native click events in the editor; the static React view supplies React events. */
export type RichTextLinkEvent = MouseEvent<HTMLAnchorElement> | globalThis.MouseEvent;
export interface RichTextRenderOptions {
  /**
   * Tiptap extensions added to the shared schema, such as a custom mark. They must parse and
   * write Markdown, and the array must stay the same between renders, such as at module scope;
   * a new array starts a new editing session. Pass the same extensions to RichText.
   */
  extensions?: AnyExtension[];
  /**
   * Renders a reference's content, such as an avatar beside the name; it receives whether the
   * document is read-only and whether the reference is selected.
   * @default the trigger and the label, such as @Priya Shah
   */
  renderReference?: (
    reference: RichTextReference,
    context: { readOnly: boolean; selected: boolean },
  ) => ReactNode;
  /**
   * Called when people activate a reference, with the reference and the event, such as to open
   * the record. A reference with an href is a link, which the editor never follows while it is
   * editable; without an href, this makes the reference a button.
   */
  onReferenceClick?: (reference: RichTextReference, event: MouseEvent<HTMLElement>) => void;
  /**
   * Called when people activate a link in the document, with its href and the event: a native
   * MouseEvent in the editor, a React mouse event in RichText. The editor never follows links
   * while editable; call preventDefault to keep RichText or a read-only editor from following it.
   */
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
/** An application command in the slash command menu. */
export interface RichTextSlashCommand {
  /** A unique key for the command. */
  id: string;
  /** The command's name in the menu, which typing after / filters by. */
  label: string;
  /** Runs the command on the Tiptap editor, once the typed / and query are removed. */
  run: (editor: Editor) => void;
}
/** What onUpload returns for an uploaded file. */
export interface RichTextAttachment {
  /** Where the file now lives: a relative path or an http or https URL. */
  url: string;
  /** The image's alternative text, or the file reference's text, such as the file name. */
  label: string;
  /** An image uses a standard Markdown image. Files use a stable reference atom. */
  kind: 'image' | 'file';
  /** The file reference's stable identity; the URL by default. */
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
  /**
   * The Markdown of a controlled editor; update it from onValueChange. A new value from outside,
   * such as another draft, replaces the document and keeps the caret where it can.
   */
  value?: string;
  /** The Markdown an uncontrolled editor starts with, and returns to when its form resets. */
  defaultValue?: string;
  /**
   * Receives the document as Markdown after every edit, normalized by the editor's schema, so it
   * can differ from the Markdown it was given, such as * for _ around italics.
   */
  onValueChange?: (markdown: string) => void;
  /** Submits the Markdown with a native form under this name, through a hidden input. */
  name?: string;
  /** The ID of the form the hidden input belongs to, where the editor sits outside it. */
  form?: string;
  /** Text shown in an empty document, such as what to write. */
  placeholder?: string;
  /**
   * Makes the editor unavailable: it cannot be edited or focused, the toolbar is disabled, its
   * value is left out of form submission and it takes the shared disabled opacity.
   */
  disabled?: boolean;
  /**
   * Shows the document without editing it: the toolbar is disabled and the document cannot be
   * focused, but its links and references can, and the form still submits its value.
   */
  readOnly?: boolean;
  /**
   * The toolbar's commands, in order, or false for no toolbar; Undo and Redo, and Attach files
   * with onUpload, follow them.
   * @default every command, from heading to table
   */
  toolbar?: readonly RichTextCommand[] | false;
  /**
   * Kinds of references people insert by typing a trigger, such as @ for people and # for topics,
   * each with its own lookup. Triggers must be unique, and the array must stay the same between
   * renders, such as at module scope.
   */
  references?: readonly RichTextReferenceSource[];
  /**
   * Typing / opens a menu of block commands: true offers heading, the lists, quote, code block and
   * table; an array adds the application's commands after them. A / reference source can't be
   * used beside it.
   */
  slashCommands?: boolean | readonly RichTextSlashCommand[];
  /**
   * Opens the application's own link picker for Insert link, with the selected text, instead of
   * the built-in dialog. Return the link, null to cancel, or a promise of either. A selection
   * becomes a link to its href; at the caret, the label is inserted as the link's text.
   */
  onRequestLink?: (
    request: MarkdownLinkRequest,
  ) => MarkdownLink | null | Promise<MarkdownLink | null>;
  /**
   * Uploads a file people chose with Attach files, which shows in the toolbar only with this.
   * Return where it lives as an attachment, null to skip it, or a promise of either; the signal
   * aborts when the editor becomes read-only or disabled, or when a controlled value changes.
   */
  onUpload?: (
    file: File,
    request: { signal: AbortSignal },
  ) => RichTextAttachment | null | Promise<RichTextAttachment | null>;
  /** The file types Attach files offers, as in a file input's accept, such as "image/*,.pdf". */
  accept?: string;
  /** Lets people choose several files at once with Attach files. */
  multiple?: boolean;
  /**
   * The editor's look: outlined, the document in a bordered well on the field background, or
   * plain, without a border or fill. quiet is accepted for the shared field type, but draws as
   * outlined.
   * @default 'outlined'
   */
  variant?: 'outlined' | 'plain' | 'quiet';
}
export interface RichTextProps
  extends RichTextRenderOptions,
    Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  /** The Markdown to show, such as what RichTextEditor saved. */
  children: string;
}
