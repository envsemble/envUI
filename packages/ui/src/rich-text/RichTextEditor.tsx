import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Extension } from '@tiptap/core';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import { Suggestion, exitSuggestion } from '@tiptap/suggestion';
import { Toolbar } from '@base-ui/react/toolbar';
import { IconButton } from '../actions/Button.js';
import { ButtonGroup } from '../actions/ButtonGroup.js';
import { Title } from '../icons/Title.js';
import { FormatBold } from '../icons/FormatBold.js';
import { FormatItalic } from '../icons/FormatItalic.js';
import { FormatStrikethrough } from '../icons/FormatStrikethrough.js';
import { FormatListBulleted } from '../icons/FormatListBulleted.js';
import { FormatListNumbered } from '../icons/FormatListNumbered.js';
import { Checklist } from '../icons/Checklist.js';
import { FormatQuote } from '../icons/FormatQuote.js';
import { Code } from '../icons/Code.js';
import { CodeBlocks } from '../icons/CodeBlocks.js';
import { Link } from '../icons/Link.js';
import { Table } from '../icons/Table.js';
import { Undo } from '../icons/Undo.js';
import { Redo } from '../icons/Redo.js';
import { AttachFile } from '../icons/AttachFile.js';
import { FieldFrame } from '../forms/internal/FieldFrame.js';
import { useFieldMetadata } from '../forms/internal/useFieldMetadata.js';
import { MarkdownLinkDialog } from '../forms/internal/markdown/MarkdownLinkDialog.js';
import type { MarkdownLink } from '../forms/MarkdownEditor.js';
import { Text } from '../foundations/Text.js';
import { classNames } from '../internal/classNames.js';
import { createRichTextExtensions } from './Extensions.js';
import { createSuggestionOptions, referenceSuggestion } from './Suggestions.js';
import {
  defaultRichTextCommands,
  defaultSlashCommands,
  richTextCommandActive,
  richTextCommandLabels,
  runRichTextCommand,
} from './Commands.js';
import { RichTextRenderingContext, safeRichTextUrl } from './Reference.js';
import type { RichTextEditorHandle, RichTextEditorProps, RichTextSlashCommand } from './Types.js';

const emptySources: NonNullable<RichTextEditorProps['references']> = [];
const emptyExtensions: NonNullable<RichTextEditorProps['extensions']> = [];
const commandIcons = {
  heading: Title,
  bold: FormatBold,
  italic: FormatItalic,
  strike: FormatStrikethrough,
  'bullet-list': FormatListBulleted,
  'numbered-list': FormatListNumbered,
  'task-list': Checklist,
  quote: FormatQuote,
  'inline-code': Code,
  'code-block': CodeBlocks,
  link: Link,
  table: Table,
};

/** Markdown IO with Tiptap owning document editing, history, and selection. */
export const RichTextEditor = forwardRef<RichTextEditorHandle, RichTextEditorProps>(
  function RichTextEditor(
    {
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
      hint,
      error,
      variant = 'outlined',
      id,
      className,
      'aria-describedby': describedBy,
      'aria-invalid': invalid,
      'aria-label': ariaLabel,
      ...props
    },
    ref,
  ) {
    const metadata = useFieldMetadata(id, hint, error, describedBy, invalid);
    const latest = useRef({
      onValueChange,
      renderReference,
      onReferenceClick,
      onLinkClick,
      disabled,
      readOnly,
    });
    latest.current = {
      onValueChange,
      renderReference,
      onReferenceClick,
      onLinkClick,
      disabled,
      readOnly,
    };
    const [markdown, setMarkdown] = useState(value ?? defaultValue);
    const storedMarkdown = useRef(value ?? defaultValue);
    const [status, setStatus] = useState('');
    const [busy, setBusy] = useState(false);
    const [linkRequest, setLinkRequest] = useState<{
      selectedText: string;
      insert: (link: MarkdownLink) => void;
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
        const commands = [
          ...defaultSlashCommands,
          ...(Array.isArray(slashCommands) ? slashCommands : []),
        ];
        const options = createSuggestionOptions<RichTextSlashCommand>({
          char: '/',
          label: 'Commands',
          items: ({ query }) =>
            commands.filter((command) => command.label.toLowerCase().includes(query.toLowerCase())),
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
    }, [extensions, placeholder, references, slashCommands]);
    const editor = useEditor(
      {
        extensions: configured.extensions,
        content: value ?? storedMarkdown.current,
        contentType: 'markdown',
        immediatelyRender: false,
        editable: !disabled && !readOnly,
        editorProps: {
          attributes: {
            role: 'textbox',
            'aria-multiline': 'true',
            class: 'env-markdown env-rich-text-document',
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
    useLayoutEffect(() => {
      if (!editor) return;
      focusTarget.current = editor.view.dom;
      editor.setOptions({
        editorProps: {
          ...editor.options.editorProps,
          attributes: {
            role: 'textbox',
            'aria-multiline': 'true',
            class: 'env-markdown env-rich-text-document',
            id: metadata.id,
            'aria-label': ariaLabel ?? (typeof label === 'string' ? label : ''),
            'aria-labelledby':
              label != null && typeof label !== 'string' && !ariaLabel
                ? `${metadata.id}-label`
                : '',
            'aria-describedby': metadata['aria-describedby'] ?? '',
            'aria-invalid': String(metadata['aria-invalid'] ?? false),
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
      metadata['aria-describedby'],
      metadata['aria-invalid'],
    ]);
    useLayoutEffect(() => {
      if (!editor || value === undefined || value === editor.getMarkdown()) return;
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
      const insert = (link: MarkdownLink) => {
        if (editor.isDestroyed || !editor.isEditable || !editor.state.doc.eq(document)) {
          setStatus('The document changed while the picker was open. Insert the link again.');
          return;
        }
        if (!safeRichTextUrl(link.href)) {
          setStatus('Enter a safe URL or relative path.');
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
          if (!controller.signal.aborted) setStatus('The link picker could not finish. Try again.');
        })
        .finally(() => {
          if (!controller.signal.aborted) setBusy(false);
        });
    }
    async function upload(files: FileList | null) {
      if (!editor || !onUpload || !files?.length || disabled || readOnly || busy) return;
      const document = editor.state.doc;
      const selection = editor.state.selection;
      const controller = new AbortController();
      pending.current?.abort();
      pending.current = controller;
      setBusy(true);
      setStatus('Uploading attachments…');
      try {
        const attachments = [];
        for (const file of Array.from(files)) {
          const attachment = await onUpload(file, { signal: controller.signal });
          if (controller.signal.aborted) return;
          if (attachment) {
            if (!safeRichTextUrl(attachment.url))
              throw new Error('The upload returned an unsafe URL.');
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
          setStatus('The document changed during upload. Attach the files again.');
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
        if (!controller.signal.aborted)
          setStatus(cause instanceof Error ? cause.message : 'The upload failed. Try again.');
      } finally {
        if (!controller.signal.aborted) setBusy(false);
      }
    }
    return (
      <div
        {...props}
        className={classNames('env-rich-text-editor', className)}
        data-disabled={disabled || undefined}
        data-readonly={readOnly || undefined}
        data-variant={variant}
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
          hint={hint}
          error={error}
        >
          {toolbar !== false && (
            <div className="env-markdown-toolbar">
              <Toolbar.Root
                render={<ButtonGroup />}
                aria-label="Rich text formatting"
                disabled={!editor || disabled || readOnly || busy}
              >
                {toolbar.map((command) => {
                  const Icon = commandIcons[command];
                  const label = richTextCommandLabels[command];
                  return (
                    <Toolbar.Button
                      key={command}
                      focusableWhenDisabled={false}
                      render={<IconButton icon={<Icon />} aria-label={label} title={label} />}
                      aria-pressed={state?.active.includes(command)}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => {
                        if (command === 'link') requestLink();
                        else if (editor) runRichTextCommand(editor, command);
                      }}
                    />
                  );
                })}
                <Toolbar.Button
                  render={<IconButton icon={<Undo />} aria-label="Undo" title="Undo" />}
                  focusableWhenDisabled={false}
                  disabled={!state?.undo}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => editor?.chain().focus().undo().run()}
                />
                <Toolbar.Button
                  render={<IconButton icon={<Redo />} aria-label="Redo" title="Redo" />}
                  focusableWhenDisabled={false}
                  disabled={!state?.redo}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => editor?.chain().focus().redo().run()}
                />
                {onUpload && (
                  <Toolbar.Button
                    render={
                      <IconButton
                        icon={<AttachFile />}
                        aria-label="Attach files"
                        title="Attach files"
                      />
                    }
                    focusableWhenDisabled={false}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => input.current?.click()}
                  />
                )}
              </Toolbar.Root>
            </div>
          )}
          <RichTextRenderingContext
            value={{ renderReference, onReferenceClick, readOnly: readOnly || disabled }}
          >
            <EditorContent editor={editor} />
          </RichTextRenderingContext>
          {onUpload && (
            <input
              ref={input}
              type="file"
              aria-label="Attach files"
              accept={accept}
              multiple={multiple}
              disabled={disabled || readOnly || busy}
              hidden
              onChange={(event) => {
                void upload(event.target.files);
                event.target.value = '';
              }}
            />
          )}
          {name && (
            <input type="hidden" name={name} form={form} value={markdown} disabled={disabled} />
          )}
          <Text variant="caption" role="status" className="env-markdown-editor-status">
            {status}
          </Text>
        </FieldFrame>
        {linkRequest && (
          <MarkdownLinkDialog
            selectedText={linkRequest.selectedText}
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
  },
);
