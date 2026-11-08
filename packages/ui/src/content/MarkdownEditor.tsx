'use client';

import { useCallback, useState, type Ref } from 'react';
import { useFieldMetadata } from '../forms/internal/useFieldMetadata.js';
import { flushSync } from 'react-dom';
import { Button } from '../actions/Button.js';
import { Tabs } from '../navigation/Tabs.js';
import { markdownEditor as markdownEditorMessages } from '../foundations/messages/markdownEditor.js';
import { classNames } from '../internal/classNames.js';
import { Grid } from '../layout/Layout.js';
import { useMessages } from '../internal/EnvUIContext.js';
import { setRef } from '../internal/setRef.js';
import type { TextareaProps } from '../forms/Textarea.js';
import { EditorStatus } from '../forms/internal/EditorStatus.js';
import { EditorToolbar } from '../forms/internal/EditorToolbar.js';
import { FieldFrame } from '../forms/internal/FieldFrame.js';
import { LinkDialog } from '../forms/internal/LinkDialog.js';
import { TextareaControl } from '../forms/internal/TextareaControl.js';
import { MarkdownPreview } from './internal/markdown/MarkdownPreview.js';
import { useMarkdownEditing } from './internal/markdown/useMarkdownEditing.js';
import { useMarkdownLink } from './internal/markdown/useMarkdownLink.js';
import {
  formatMarkdown,
  isMarkdownHref,
  type MarkdownCommand,
  type MarkdownLink,
} from './internal/markdown/markdownFormatting.js';
import '../styles/Base.css';
import '../styles/MarkdownEditor.css';

export type { MarkdownCommand, MarkdownLink } from './internal/markdown/markdownFormatting.js';
/** What pickLink receives when people ask for a link. */
export interface MarkdownLinkRequest {
  /** The text selected at the time, which the link will wrap; empty without a selection. */
  selectedText: string;
}
/** The commands of MarkdownEditor's toolbar, in order: every one it offers. */
const defaultMarkdownCommands: readonly MarkdownCommand[] = [
  'heading',
  'bold',
  'italic',
  'inline-code',
  'bullet-list',
  'numbered-list',
  'quote',
  'code-block',
  'link',
];

export interface MarkdownEditorProps extends Omit<
  TextareaProps,
  'children' | 'value' | 'defaultValue' | 'onChange' | 'ref'
> {
  /** The native text area of the source, so that a form library can register it and focus it. */
  ref?: Ref<HTMLTextAreaElement>;
  /** The Markdown source of a controlled editor; replacing it clears the undo history. */
  value?: string;
  /** The source an uncontrolled editor starts with, and that a form reset restores. */
  defaultValue?: string;
  /** Receives the whole source after typing, formatting, undo or redo. */
  onValueChange?: (value: string) => void;
  /** Formatting actions; false hides the toolbar. Undo/redo accompany a visible toolbar. */
  toolbar?: readonly MarkdownCommand[] | false;
  /** Show Write/Preview tabs. Preview uses the same public Markdown renderer. */
  preview?: boolean;
  /** Options of the Markdown that renders the preview: headingOffset, renderLink and codeCopyable. */
  previewProps?: Pick<
    import('./Markdown.js').MarkdownProps,
    'headingOffset' | 'renderLink' | 'codeCopyable'
  >;
  /** Optional application picker. Return null to cancel; otherwise return an ordinary link. */
  pickLink?: (request: MarkdownLinkRequest) => MarkdownLink | null | Promise<MarkdownLink | null>;
}

/**
 * What a key with Ctrl or ⌘ does in the source: Z undoes and, with Shift, redoes, Y redoes, and B,
 * I and K format as the toolbar's bold, italic and link do. Keys with Alt are the application's.
 */
function markdownShortcut(event: {
  key: string;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
}): 'undo' | 'redo' | 'bold' | 'italic' | 'link' | null {
  if (event.altKey || (!event.metaKey && !event.ctrlKey)) return null;
  const key = event.key.toLowerCase();
  if (key === 'z') return event.shiftKey ? 'redo' : 'undo';
  if (key === 'y') return 'redo';
  return key === 'b' ? 'bold' : key === 'i' ? 'italic' : key === 'k' ? 'link' : null;
}

/**
 * Native Markdown source editing, shared formatting history, and optional preview. Its toolbar,
 * views and status come from EnvUIProvider's messages: markdownEditor, editor and linkDialog.
 */
export function MarkdownEditor({
  ref: forwardedRef,
  value,
  defaultValue = '',
  onValueChange,
  toolbar = defaultMarkdownCommands,
  preview = true,
  previewProps,
  pickLink,
  label,
  description,
  error,
  variant,
  id: suppliedId,
  'aria-describedby': describedBy,
  'aria-invalid': invalid,
  disabled,
  readOnly,
  maxLength,
  form,
  className,
  style,
  rows = 8,
  sizing = 'fixed',
  onKeyDown,
  onCompositionStart,
  onCompositionEnd,
  onInvalid,
  ...nativeProps
}: MarkdownEditorProps) {
  const messages = useMessages('markdownEditor', markdownEditorMessages);
  const metadata = useFieldMetadata(suppliedId, description, error, describedBy, invalid);
  const editing = useMarkdownEditing({
    value,
    defaultValue,
    onValueChange,
    form,
  });
  // Whether an input method is composing, which formatting waits for.
  const composingRef = editing.composing;
  const [mode, setMode] = useState('write');
  const [status, setStatus] = useState('');
  const { linkSelection, linkPending, requestLink, insertDialogLink, closeDialog } =
    useMarkdownLink({
      inputRef: editing.inputRef,
      apply: editing.apply,
      pickLink,
      showSource: () => setMode('write'),
      setStatus,
      messages,
    });
  const { attachInput: attachEditingInput } = editing;
  const attachInput = useCallback(
    (input: HTMLTextAreaElement | null) => {
      attachEditingInput(input);
      setRef(forwardedRef, input);
    },
    [attachEditingInput, forwardedRef],
  );

  function runCommand(command: MarkdownCommand) {
    if (disabled || readOnly || linkPending || composingRef.current) return;
    const selection = editing.captureSelection();
    if (!selection) return;
    setStatus('');
    if (command === 'link') void requestLink(selection);
    else if (!editing.apply(selection, formatMarkdown(selection, command))) {
      setStatus(messages.tooLongShort);
    }
  }
  const source = (
    <Grid gap={3} className="env-markdown-editor-write">
      {toolbar !== false && (
        <EditorToolbar
          label={messages.toolbar}
          commands={toolbar}
          disabled={Boolean(disabled || readOnly || linkPending)}
          canUndo={editing.canUndo}
          canRedo={editing.canRedo}
          onCommand={runCommand}
          onUndo={() => editing.moveHistory(-1)}
          onRedo={() => editing.moveHistory(1)}
        />
      )}
      <FieldFrame id={metadata.id} floatingLabel multiline variant={variant}>
        <TextareaControl
          {...nativeProps}
          {...metadata}
          ref={attachInput}
          className="env-markdown-editor-input"
          rows={rows}
          sizing={sizing}
          disabled={disabled}
          readOnly={readOnly}
          maxLength={maxLength}
          form={form}
          value={editing.content}
          onChange={(event) => {
            setStatus('');
            editing.handleChange(event);
          }}
          onCompositionStart={(event) => {
            composingRef.current = true;
            onCompositionStart?.(event);
          }}
          onCompositionEnd={(event) => {
            composingRef.current = false;
            onCompositionEnd?.(event);
          }}
          onInvalid={(event) => {
            onInvalid?.(event);
            // Reveal the native field before the browser focuses an invalid control.
            if (!event.defaultPrevented && mode !== 'write') flushSync(() => setMode('write'));
          }}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (event.defaultPrevented || event.nativeEvent.isComposing || disabled || readOnly)
              return;
            const shortcut = markdownShortcut(event);
            if (shortcut === 'undo' || shortcut === 'redo') {
              event.preventDefault();
              editing.moveHistory(shortcut === 'redo' ? 1 : -1);
            } else if (shortcut && toolbar !== false && toolbar.includes(shortcut)) {
              event.preventDefault();
              runCommand(shortcut);
            }
          }}
        />
      </FieldFrame>
    </Grid>
  );
  return (
    <>
      <div className={classNames('env-markdown-editor', className)} style={style}>
        <FieldFrame
          id={metadata.id}
          label={
            label != null ? (
              <label
                htmlFor={metadata.id}
                onClick={() => {
                  if (mode !== 'write') flushSync(() => setMode('write'));
                }}
              >
                {label}
              </label>
            ) : null
          }
          description={description}
          error={error}
        >
          {preview ? (
            <Tabs
              aria-label={messages.views}
              value={mode}
              keepMounted
              onValueChange={(next) => {
                if (next) setMode(next);
              }}
              items={[
                { value: 'write', button: <Button>{messages.write}</Button>, content: source },
                {
                  value: 'preview',
                  button: <Button>{messages.preview}</Button>,
                  content: (
                    <MarkdownPreview
                      {...previewProps}
                      active={mode === 'preview'}
                      source={editing.content}
                      empty={messages.empty}
                    />
                  ),
                },
              ]}
            />
          ) : (
            source
          )}
          <EditorStatus>{status}</EditorStatus>
        </FieldFrame>
      </div>
      {linkSelection && (
        <LinkDialog
          isValid={isMarkdownHref}
          finalFocus={editing.inputRef}
          selectedText={linkSelection.value.slice(linkSelection.start, linkSelection.end)}
          onCancel={closeDialog}
          onInsert={insertDialogLink}
        />
      )}
    </>
  );
}
