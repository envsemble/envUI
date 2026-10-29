'use client';

import { useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Extension } from '@tiptap/core';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import { Suggestion, exitSuggestion } from '@tiptap/suggestion';
import * as Toolbar from '../actions/Toolbar.js';
import { AttachFile } from '../icons/AttachFile.js';
import { editor as editorMessages } from '../foundations/messages/editor.js';
import { linkDialog as linkDialogMessages } from '../foundations/messages/linkDialog.js';
import { richText as richTextMessages } from '../foundations/messages/richText.js';
import { EditorStatus } from '../forms/internal/EditorStatus.js';
import { editorCommands } from '../forms/internal/editorCommands.js';
import { EditorToolbar, keepEditorFocus } from '../forms/internal/EditorToolbar.js';
import { FieldFrame, type FieldControlBoxProps } from '../forms/internal/FieldFrame.js';
import { LinkDialog, type EditorLink } from '../forms/internal/LinkDialog.js';
import { useFieldMetadata } from '../forms/internal/useFieldMetadata.js';
import { classNames } from '../internal/classNames.js';
import { useMessages } from '../internal/EnvUIContext.js';
import { FileInput } from '../internal/FileInput.js';
import { createRichTextExtensions } from './extensions.js';
import { createSuggestionOptions, referenceSuggestion } from './internal/suggestions.js';
import {
  defaultRichTextCommands,
  richTextCommandActive,
  runRichTextCommand,
  slashCommandIds,
} from './internal/commands.js';
import { RichTextRenderingContext } from './internal/Reference.js';
import { safeRichTextUrl } from './internal/referenceAttributes.js';
import type { RichTextCommand, RichTextEditorProps, RichTextSlashCommand } from './types.js';
import { flag } from '../internal/flag.js';
import '../styles/Base.css';
import '../styles/Prose.css';
import '../styles/RichText.css';

const emptySources: NonNullable<RichTextEditorProps['references']> = [];
const emptyExtensions: NonNullable<RichTextEditorProps['extensions']> = [];
const noCommands: readonly RichTextCommand[] = [];

/**
 * A labelled editor for formatted text that people edit as it looks, built on Tiptap, with a
 * formatting toolbar, references typed with a trigger such as @, optional slash commands and
 * attachments; its value is Markdown. ref.editor gives the Tiptap editor for commands. Its words
 * come from EnvUIProvider's messages: richText, editor and linkDialog.
 */
export function RichTextEditor({
  ref,
  value,
  defaultValue = '',
  onValueChange,
  name,
  form,
  placeholder,
  disabled = false,
  readOnly = false,
  toolbar = defaultRichTextCommands,
  references = emptySources,
  slashCommands = false,
  extensions = emptyExtensions,
  renderReference,
  onReferenceClick,
  onLinkClick,
  onRequestLink,
  onUpload,
  accept,
  multiple = true,
  label,
  description,
  error,
  variant = 'outline',
  id,
  className,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
  'aria-label': ariaLabel,
  ...props
}: RichTextEditorProps) {
  const messages = useMessages('richText', richTextMessages);
  const commandMessages = useMessages('editor', editorMessages);
  const linkMessages = useMessages('linkDialog', linkDialogMessages);
  const metadata = useFieldMetadata(id, description, error, describedBy, invalid);
  const latest = useRef({
    onValueChange,
    renderReference,
    onReferenceClick,
    onLinkClick,
    disabled,
    readOnly,
    commandMessages,
  });
  latest.current = {
    onValueChange,
    renderReference,
    onReferenceClick,
    onLinkClick,
    disabled,
    readOnly,
    commandMessages,
  };
  const [markdown, setMarkdown] = useState(value ?? defaultValue);
  const storedMarkdown = useRef(value ?? defaultValue);
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [linkRequest, setLinkRequest] = useState<{
    selectedText: string;
    insert: (link: EditorLink) => void;
  } | null>(null);
  const pending = useRef<AbortController | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const focusTarget = useRef<HTMLElement | null>(null);
  const [, rerender] = useState(0);
  const configured = useMemo(() => {
    if (new Set(references.map((source) => source.char)).size !== references.length)
      throw new Error('Reference triggers must be unique.');
    if (slashCommands && references.some((source) => source.char === '/'))
      throw new Error('Use either a / reference source or slashCommands.');
    const result = createRichTextExtensions({
      extensions,
      placeholder,
      renderReference: (reference, context) =>
        latest.current.renderReference?.(reference, context) ??
        `${reference.char ?? ''}${reference.label}`,
      onReferenceClick: (reference, event) => latest.current.onReferenceClick?.(reference, event),
    });
    const reference = result.find((extension) => extension.name === 'envReference')!;
    const suggestions = references.map((source) => ({
      ...referenceSuggestion(source),
      shouldShow: () => !latest.current.disabled && !latest.current.readOnly,
    }));
    const suggestionKeys = suggestions.flatMap((suggestion) =>
      suggestion.pluginKey ? [suggestion.pluginKey] : [],
    );
    result[result.indexOf(reference)] = reference.configure({
      suggestions,
    });
    if (slashCommands) {
      // The block commands in the provider's words, then the application's own.
      const commands = (): RichTextSlashCommand[] => [
        ...slashCommandIds.map((command) => ({
          id: command,
          label: latest.current.commandMessages[editorCommands[command].message],
          run: (editor: Parameters<RichTextSlashCommand['run']>[0]) => {
            runRichTextCommand(editor, command);
          },
        })),
        ...(Array.isArray(slashCommands) ? slashCommands : []),
      ];
      const options = createSuggestionOptions<RichTextSlashCommand>({
        char: '/',
        label: messages.commands,
        items: ({ query }) =>
          commands().filter((command) => command.label.toLowerCase().includes(query.toLowerCase())),
      });
      if (options.pluginKey) suggestionKeys.push(options.pluginKey);
      result.push(
        Extension.create({
          name: 'envSlashCommands',
          addProseMirrorPlugins() {
            return [
              Suggestion({
                ...options,
                editor: this.editor,
                shouldShow: () => !latest.current.disabled && !latest.current.readOnly,
                command: ({ editor, range, props: command }) => {
                  editor.chain().focus().deleteRange(range).run();
                  command.run(editor);
                },
              }),
            ];
          },
        }),
      );
    }
    return { extensions: result, suggestionKeys };
    // The slash list's name is read once per editing session, as the extensions are.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extensions, placeholder, references, slashCommands]);
  const editor = useEditor(
    {
      extensions: configured.extensions,
      content: value ?? storedMarkdown.current,
      contentType: 'markdown',
      immediatelyRender: false,
      // ProseMirror's base styles come from RichText.css, in envUI's cascade layer, rather than from
      // a style element Tiptap adds outside any layer, where they would win over the document's.
      injectCSS: false,
      editable: !disabled && !readOnly,
      editorProps: {
        attributes: {
          role: 'textbox',
          'aria-multiline': 'true',
          class: 'env-prose env-rich-text-document',
        },
        handleClick: (_view, _position, event) => {
          const anchor = (event.target as Element).closest<HTMLAnchorElement>('a[href]');
          if (anchor && !anchor.closest('[data-reference-id]')) {
            if (!latest.current.readOnly || latest.current.disabled) event.preventDefault();
            // Tiptap's Link extension validates input; applications own navigation.
            latest.current.onLinkClick?.(anchor.getAttribute('href')!, event);
            return true;
          }
          return false;
        },
      },
      onUpdate: ({ editor: current }) => {
        const next = current.getMarkdown();
        storedMarkdown.current = next;
        setMarkdown(next);
        latest.current.onValueChange?.(next);
        rerender((count) => count + 1);
      },
      // Suggestions close as focus leaves the document, also with Tab.
      onBlur: ({ editor: current }) => {
        for (const key of configured.suggestionKeys) exitSuggestion(current.view, key);
      },
    },
    [configured],
  );
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) =>
      current
        ? {
            undo: current.can().undo(),
            redo: current.can().redo(),
            active: defaultRichTextCommands.filter((command) =>
              richTextCommandActive(current, command),
            ),
          }
        : null,
  });
  useImperativeHandle(ref, () => ({ editor }), [editor]);
  const describedByIds = metadata['aria-describedby'];
  const invalidState = metadata['aria-invalid'];
  useLayoutEffect(() => {
    if (!editor) return;
    focusTarget.current = editor.view.dom;
    editor.setOptions({
      editorProps: {
        ...editor.options.editorProps,
        attributes: {
          role: 'textbox',
          'aria-multiline': 'true',
          class: 'env-prose env-rich-text-document',
          id: metadata.id,
          'aria-label': ariaLabel ?? (typeof label === 'string' ? label : ''),
          'aria-labelledby':
            label != null && typeof label !== 'string' && !ariaLabel ? `${metadata.id}-label` : '',
          'aria-describedby': describedByIds ?? '',
          'aria-invalid': String(invalidState ?? false),
          'aria-disabled': String(disabled),
          'aria-readonly': String(readOnly),
        },
      },
    });
    editor.setEditable(!disabled && !readOnly, false);
    if (disabled || readOnly) {
      for (const key of configured.suggestionKeys) exitSuggestion(editor.view, key);
    }
  }, [
    editor,
    configured,
    disabled,
    readOnly,
    label,
    ariaLabel,
    metadata.id,
    describedByIds,
    invalidState,
  ]);
  // Runs after every render: the document can drift from a controlled value that stays the same,
  // as when the application declines an edit. Setting the same Markdown again renders nothing.
  // Setting content renders the node views of references and tasks at once, which React refuses
  // while it commits, also in the effects of an update from an event, so it waits for a microtask.
  useEffect(() => {
    if (!editor || value === undefined) return;
    let cancelled = false;
    queueMicrotask(() => {
      if (cancelled || editor.isDestroyed || value === editor.getMarkdown()) return;
      if (
        editor.markdown &&
        editor.schema.nodeFromJSON(editor.markdown.parse(value)).eq(editor.state.doc)
      )
        return;
      const selection = editor.state.selection;
      editor
        .chain()
        .setContent(value, { contentType: 'markdown', emitUpdate: false })
        .setMeta('addToHistory', false)
        .run();
      const size = editor.state.doc.content.size;
      editor.commands.setTextSelection({
        from: Math.min(selection.from, size),
        to: Math.min(selection.to, size),
      });
      setMarkdown(value);
      storedMarkdown.current = value;
    });
    return () => {
      cancelled = true;
    };
  });
  useEffect(() => {
    pending.current?.abort();
    setBusy(false);
    setLinkRequest(null);
    setStatus('');
    return () => pending.current?.abort();
  }, [editor, disabled, readOnly, value]);
  useEffect(() => {
    if (!editor) return;
    const ownerForm = form ? document.getElementById(form) : editor.view.dom.closest('form');
    function reset() {
      if (!editor || value !== undefined) return;
      editor.commands.setContent(defaultValue, { contentType: 'markdown' });
    }
    ownerForm?.addEventListener('reset', reset);
    return () => ownerForm?.removeEventListener('reset', reset);
  }, [editor, form, value, defaultValue]);

  function requestLink() {
    if (!editor || disabled || readOnly || busy) return;
    const selection = editor.state.selection;
    const document = editor.state.doc;
    const selectedText = document.textBetween(selection.from, selection.to, ' ', (node) =>
      node.type.name === 'envReference'
        ? `${node.attrs.mentionSuggestionChar ?? ''}${node.attrs.label ?? node.attrs.id}`
        : '',
    );
    const insert = (link: EditorLink) => {
      if (editor.isDestroyed || !editor.isEditable || !editor.state.doc.eq(document)) {
        setStatus(messages.changedWhilePicking);
        return;
      }
      if (!safeRichTextUrl(link.href)) {
        setStatus(linkMessages.invalidPath);
        return;
      }
      if (!selection.empty) {
        editor
          .chain()
          .focus()
          .setTextSelection({ from: selection.from, to: selection.to })
          .setLink({ href: link.href })
          .run();
      } else {
        editor
          .chain()
          .focus()
          .insertContentAt(selection.from, {
            type: 'text',
            text: link.label || link.href,
            marks: [{ type: 'link', attrs: { href: link.href } }],
          })
          .run();
      }
    };
    setStatus('');
    if (!onRequestLink) {
      setLinkRequest({ selectedText, insert });
      return;
    }
    const controller = new AbortController();
    pending.current?.abort();
    pending.current = controller;
    setBusy(true);
    void Promise.resolve()
      .then(() => onRequestLink({ selectedText }))
      .then((link) => {
        if (!controller.signal.aborted && link) insert(link);
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus(messages.pickerFailed);
      })
      .finally(() => {
        if (!controller.signal.aborted) setBusy(false);
      });
  }
  async function upload(files: readonly File[]) {
    if (!editor || !onUpload || !files.length || disabled || readOnly || busy) return;
    const document = editor.state.doc;
    const selection = editor.state.selection;
    const controller = new AbortController();
    pending.current?.abort();
    pending.current = controller;
    setBusy(true);
    setStatus(messages.uploading);
    try {
      const attachments = [];
      for (const file of files) {
        const attachment = await onUpload(file, { signal: controller.signal });
        if (controller.signal.aborted) return;
        if (attachment) {
          if (!safeRichTextUrl(attachment.url)) {
            setStatus(messages.unsafeUpload);
            return;
          }
          attachments.push(
            attachment.kind === 'image'
              ? { type: 'image', attrs: { src: attachment.url, alt: attachment.label } }
              : {
                  type: 'envReference',
                  attrs: {
                    id: attachment.id ?? attachment.url,
                    label: attachment.label,
                    href: attachment.url,
                    kind: 'file',
                    mentionSuggestionChar: '',
                  },
                },
          );
        }
      }
      if (editor.isDestroyed || !editor.isEditable || !editor.state.doc.eq(document)) {
        setStatus(messages.changedWhileUploading);
        return;
      }
      if (attachments.length)
        editor
          .chain()
          .focus()
          .insertContentAt({ from: selection.from, to: selection.to }, attachments)
          .run();
      setStatus('');
    } catch (cause) {
      // The application's own message, such as a rejection's, else the provider's.
      if (!controller.signal.aborted)
        setStatus(cause instanceof Error && cause.message ? cause.message : messages.uploadFailed);
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  }
  const unavailable = !editor || disabled || readOnly || busy;
  // The document sits in the field's control box, which draws its border, fill and states by the
  // field variant; the box takes the document's invalid and disabled states.
  const renderControlBox = (box: FieldControlBoxProps) => (
    <div
      {...box}
      className={classNames(box.className, 'env-rich-text-editor-control')}
      data-invalid={flag(invalidState === true || invalidState === 'true')}
      data-disabled={flag(disabled)}
    />
  );
  return (
    <div
      {...props}
      className={classNames('env-rich-text-editor', className)}
      data-disabled={flag(disabled)}
      data-readonly={flag(readOnly)}
    >
      <FieldFrame
        id={metadata.id}
        label={
          label != null ? (
            <label id={`${metadata.id}-label`} onClick={() => editor?.commands.focus()}>
              {label}
            </label>
          ) : null
        }
        description={description}
        error={error}
      >
        {toolbar !== false && (
          <EditorToolbar
            label={messages.toolbar}
            commands={toolbar}
            // Its formatting toggles from the start, off until the document reports them on.
            active={state?.active ?? noCommands}
            disabled={unavailable}
            canUndo={Boolean(state?.undo)}
            canRedo={Boolean(state?.redo)}
            onCommand={(command) => {
              if (command === 'link') requestLink();
              else if (editor) runRichTextCommand(editor, command);
            }}
            onUndo={() => editor?.chain().focus().undo().run()}
            onRedo={() => editor?.chain().focus().redo().run()}
          >
            {onUpload && (
              <Toolbar.Button
                icon={<AttachFile />}
                label={messages.attach}
                onMouseDown={keepEditorFocus}
                onClick={() => input.current?.click()}
              />
            )}
          </EditorToolbar>
        )}
        <FieldFrame
          id={metadata.id}
          floatingLabel
          multiline
          variant={variant}
          renderControlBox={renderControlBox}
        >
          <RichTextRenderingContext
            value={{ renderReference, onReferenceClick, readOnly: readOnly || disabled }}
          >
            <EditorContent editor={editor} className="env-rich-text-editor-content" />
          </RichTextRenderingContext>
        </FieldFrame>
        {onUpload && (
          <FileInput
            ref={input}
            aria-label={messages.attach}
            accept={accept}
            multiple={multiple}
            disabled={unavailable}
            onFiles={(files) => void upload(files)}
          />
        )}
        {name && (
          <input type="hidden" name={name} form={form} value={markdown} disabled={disabled} />
        )}
        <EditorStatus>{status}</EditorStatus>
      </FieldFrame>
      {linkRequest && (
        <LinkDialog
          selectedText={linkRequest.selectedText}
          isValid={safeRichTextUrl}
          finalFocus={focusTarget}
          onCancel={() => setLinkRequest(null)}
          onInsert={(link) => {
            linkRequest.insert(link);
            setLinkRequest(null);
          }}
        />
      )}
    </div>
  );
}
