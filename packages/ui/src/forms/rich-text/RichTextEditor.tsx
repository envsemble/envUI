'use client';

import { useImperativeHandle, useRef, type CSSProperties } from 'react';
import { EditorContent, useEditorState } from '@tiptap/react';
import * as Toolbar from '../../actions/Toolbar.js';
import { IconAttachFile } from '../../icons/AttachFile.js';
import { editor as editorMessages } from '../../foundations/messages/editor.js';
import { richText as richTextMessages } from '../../foundations/messages/richText.js';
import { EditorStatus } from '../internal/EditorStatus.js';
import { EditorToolbar, keepEditorFocus } from '../internal/EditorToolbar.js';
import { FieldFrame, type FieldControlBoxProps } from '../internal/FieldFrame.js';
import { LinkDialog } from '../internal/LinkDialog.js';
import { useFieldMetadata } from '../internal/useFieldMetadata.js';
import { classNames } from '../../internal/classNames.js';
import { useMessages } from '../../internal/EnvUIContext.js';
import { FileInput } from '../../internal/FileInput.js';
import { flag } from '../../internal/flag.js';
import { useLatest } from '../../internal/useLatest.js';
import {
  defaultRichTextCommands,
  richTextCommandActive,
  runRichTextCommand,
} from './internal/commands.js';
import { RichTextRenderingContext } from './internal/Reference.js';
import { safeRichTextUrl } from './internal/referenceAttributes.js';
import { useDocumentAttributes } from './internal/useDocumentAttributes.js';
import { useLinksAndUploads } from './internal/useLinksAndUploads.js';
import { useRichTextDocument } from './internal/useRichTextDocument.js';
import { useRichTextExtensions } from './internal/useRichTextExtensions.js';
import type { RichTextCommand, RichTextEditorProps } from './types.js';
import '../../styles/Base.css';
import '../../styles/Prose.css';
import '../../styles/RichText.css';

const emptySources: NonNullable<RichTextEditorProps['references']> = [];
const emptyExtensions: NonNullable<RichTextEditorProps['extensions']> = [];
const noCommands: readonly RichTextCommand[] = [];

/**
 * A labelled editor for formatted text that people edit as it looks, built on Tiptap, with a
 * formatting toolbar, references typed with a trigger such as @, optional slash commands and
 * attachments; its value is Markdown. ref reaches the root element, and editorRef.current.editor
 * gives the Tiptap editor for commands. Its words
 * come from EnvUIProvider's messages: richText, editor and linkDialog.
 */
export function RichTextEditor({
  ref,
  editorRef,
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
  pickLink,
  onUpload,
  accept,
  multiple = true,
  label,
  description,
  error,
  variant = 'outline',
  minRows,
  id,
  className,
  style,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
  'aria-label': ariaLabel,
  ...props
}: RichTextEditorProps) {
  const messages = useMessages('richText', richTextMessages);
  const commandMessages = useMessages('editor', editorMessages);
  const metadata = useFieldMetadata(id, description, error, describedBy, invalid);
  const latest = useLatest({
    onValueChange,
    renderReference,
    onReferenceClick,
    onLinkClick,
    disabled,
    readOnly,
    commandMessages,
  });
  const { extensions: allExtensions, suggestionKeys } = useRichTextExtensions(
    { extensions, placeholder, references, slashCommands },
    latest,
  );
  const { editor, markdown } = useRichTextDocument(
    { extensions: allExtensions, suggestionKeys, value, defaultValue, disabled, readOnly, form },
    latest,
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
  useImperativeHandle(editorRef, () => ({ editor }), [editor]);
  const invalidState = metadata['aria-invalid'];
  useDocumentAttributes(editor, {
    suggestionKeys,
    id: metadata.id,
    label,
    ariaLabel,
    describedBy: metadata['aria-describedby'],
    invalid: invalidState,
    disabled,
    readOnly,
  });
  const { status, busy, linkRequest, closeLinkRequest, focusTarget, requestLink, upload } =
    useLinksAndUploads({ editor, value, disabled, readOnly, pickLink, onUpload });
  const input = useRef<HTMLInputElement>(null);
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
      ref={ref}
      className={classNames('env-rich-text-editor', className)}
      style={
        minRows === undefined
          ? style
          : ({
              '--env-rich-text-min-block-size': `calc(${Math.max(1, Math.round(minRows))} * 1lh + 2 * var(--env-space-4))`,
              ...style,
            } as CSSProperties)
      }
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
                icon={<IconAttachFile />}
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
            value={{ renderReference, onReferenceClick, readOnly: readOnly || disabled, disabled }}
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
          onCancel={closeLinkRequest}
          onInsert={(link) => {
            linkRequest.insert(link);
            closeLinkRequest();
          }}
        />
      )}
    </div>
  );
}
