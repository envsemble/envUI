'use client';

import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import { useFieldMetadata } from './internal/useFieldMetadata.js';
import { flushSync } from 'react-dom';
import { Button } from '../actions/Button.js';
import { Tabs } from '../navigation/Tabs.js';
import { Text } from '../foundations/Text.js';
import { classNames } from '../internal/classNames.js';
import { setRef } from '../internal/setRef.js';
import type { TextareaProps } from './Textarea.js';
import { FieldFrame } from './internal/FieldFrame.js';
import { TextareaControl } from './internal/TextareaControl.js';
import { MarkdownToolbar, defaultMarkdownCommands } from './internal/markdown/MarkdownToolbar.js';
import { MarkdownLinkDialog } from './internal/markdown/MarkdownLinkDialog.js';
import { MarkdownPreview } from './internal/markdown/MarkdownPreview.js';
import { useMarkdownEditing } from './internal/markdown/useMarkdownEditing.js';
import {
  formatMarkdown,
  insertMarkdownLink,
  type MarkdownCommand,
  type MarkdownLink,
  type MarkdownSelection,
} from './internal/markdown/MarkdownFormatting.js';

export type { MarkdownCommand, MarkdownLink } from './internal/markdown/MarkdownFormatting.js';
export interface MarkdownLinkRequest {
  selectedText: string;
}
export interface MarkdownEditorProps
  extends Omit<TextareaProps, 'children' | 'value' | 'defaultValue' | 'onChange'> {
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
    import('../content/Markdown.js').MarkdownProps,
    'headingOffset' | 'renderLink' | 'codeCopyable'
  >;
  /** Optional application picker. Return null to cancel; otherwise return an ordinary link. */
  onRequestLink?: (
    request: MarkdownLinkRequest,
  ) => MarkdownLink | null | Promise<MarkdownLink | null>;
}

/** Native Markdown source editing, shared formatting history, and optional preview. */
export const MarkdownEditor = forwardRef<HTMLTextAreaElement, MarkdownEditorProps>(
  function MarkdownEditor(
    {
      value,
      defaultValue = '',
      onValueChange,
      toolbar = defaultMarkdownCommands,
      preview = true,
      previewProps,
      onRequestLink,
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
    },
    forwardedRef,
  ) {
    const metadata = useFieldMetadata(suppliedId, description, error, describedBy, invalid);
    const editing = useMarkdownEditing({
      value,
      defaultValue,
      onValueChange,
      form,
    });
    const [mode, setMode] = useState('write');
    const [status, setStatus] = useState('');
    const [linkSelection, setLinkSelection] = useState<MarkdownSelection | null>(null);
    const [linkPending, setLinkPending] = useState(false);
    const linkRequestVersion = useRef(0);
    useEffect(
      () => () => {
        linkRequestVersion.current++;
      },
      [],
    );
    const { attachInput: attachEditingInput } = editing;
    const attachInput = useCallback(
      (input: HTMLTextAreaElement | null) => {
        attachEditingInput(input);
        setRef(forwardedRef, input);
      },
      [attachEditingInput, forwardedRef],
    );

    function insertLink(selection: MarkdownSelection, link: MarkdownLink) {
      if (editing.inputRef.current?.value !== selection.value) {
        setStatus('The text changed while the picker was open. Insert the link again.');
        return;
      }
      try {
        flushSync(() => setMode('write'));
        if (!editing.apply(selection, insertMarkdownLink(selection, link))) {
          setStatus('This change would exceed the maximum length, or editing is unavailable.');
        }
      } catch (cause) {
        setStatus(cause instanceof Error ? cause.message : 'The link could not be inserted.');
      }
    }
    async function requestLink(selection: MarkdownSelection) {
      if (!onRequestLink) {
        setLinkSelection(selection);
        return;
      }
      const version = ++linkRequestVersion.current;
      setLinkPending(true);
      try {
        const result = await onRequestLink({
          selectedText: selection.value.slice(selection.start, selection.end),
        });
        if (linkRequestVersion.current === version && result) insertLink(selection, result);
      } catch {
        if (linkRequestVersion.current === version)
          setStatus('The link picker could not finish. Try again.');
      } finally {
        if (linkRequestVersion.current === version) setLinkPending(false);
      }
    }
    function runCommand(command: MarkdownCommand) {
      if (disabled || readOnly || linkPending || editing.composing.current) return;
      const selection = editing.captureSelection();
      if (!selection) return;
      setStatus('');
      if (command === 'link') void requestLink(selection);
      else if (!editing.apply(selection, formatMarkdown(selection, command))) {
        setStatus('This change would exceed the maximum length.');
      }
    }
    const source = (
      <div className="env-markdown-editor-write">
        {toolbar !== false && (
          <MarkdownToolbar
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
            className="env-markdown-source"
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
              editing.composing.current = true;
              onCompositionStart?.(event);
            }}
            onCompositionEnd={(event) => {
              editing.composing.current = false;
              onCompositionEnd?.(event);
            }}
            onInvalid={(event) => {
              onInvalid?.(event);
              // Reveal the native field before the browser focuses an invalid control.
              if (!event.defaultPrevented && mode !== 'write') flushSync(() => setMode('write'));
            }}
            onKeyDown={(event) => {
              onKeyDown?.(event);
              if (
                event.defaultPrevented ||
                event.nativeEvent.isComposing ||
                disabled ||
                readOnly ||
                event.altKey
              )
                return;
              if (!event.metaKey && !event.ctrlKey) return;
              const key = event.key.toLowerCase();
              if (key === 'z' || key === 'y') {
                event.preventDefault();
                editing.moveHistory(key === 'y' || event.shiftKey ? 1 : -1);
              } else if (toolbar !== false && (key === 'b' || key === 'i' || key === 'k')) {
                const command = key === 'b' ? 'bold' : key === 'i' ? 'italic' : 'link';
                if (toolbar.includes(command)) {
                  event.preventDefault();
                  runCommand(command);
                }
              }
            }}
          />
        </FieldFrame>
      </div>
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
                aria-label="Markdown editor views"
                value={mode}
                keepMounted
                onValueChange={(next) => {
                  if (next) setMode(next);
                }}
                items={[
                  { value: 'write', button: <Button>Write</Button>, content: source },
                  {
                    value: 'preview',
                    button: <Button>Preview</Button>,
                    content: (
                      <MarkdownPreview
                        {...previewProps}
                        active={mode === 'preview'}
                        source={editing.content}
                      />
                    ),
                  },
                ]}
              />
            ) : (
              source
            )}
            <Text variant="caption" role="status" className="env-markdown-editor-status">
              {status}
            </Text>
          </FieldFrame>
        </div>
        {linkSelection && (
          <MarkdownLinkDialog
            finalFocus={editing.inputRef}
            selectedText={linkSelection.value.slice(linkSelection.start, linkSelection.end)}
            onCancel={() => setLinkSelection(null)}
            onInsert={(link) => {
              insertLink(linkSelection, link);
              setLinkSelection(null);
            }}
          />
        )}
      </>
    );
  },
);
