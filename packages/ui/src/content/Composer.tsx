'use client';

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { useFormStatus } from 'react-dom';
import { IconButton } from '../actions/Button.js';
import { IconArrowUpward } from '../icons/ArrowUpward.js';
import { IconStop } from '../icons/Stop.js';
import { classNames } from '../internal/classNames.js';
import { Grid } from '../layout/Layout.js';
import { Slot } from '../internal/layout/Slot.js';
import { mergeRefs } from '../internal/react/setRef.js';
import { useControllableState } from '../internal/react/useControllableState.js';
import { useMessages } from '../internal/provider/EnvUIContext.js';
import { composer as composerMessages } from '../foundations/messages/composer.js';
import { useFormReset } from '../internal/field/useFormReset.js';
import { TextareaControl } from '../internal/field/TextareaControl.js';
import { supportsFieldSizing } from '../internal/field/fieldSizing.js';
import { flag } from '../internal/flag.js';
import { idRefs } from '../internal/dom/idRefs.js';
import { observeResize } from '../internal/dom/observeResize.js';
import '../styles/Base.css';
import '../styles/Composer.css';

interface ComposerOptions {
  /** The message text of a controlled composer. */
  value?: string;
  /**
   * The starting text of an uncontrolled composer; it clears after each send through onSend and
   * when its form resets.
   */
  defaultValue?: string;
  /** Receives the text as it changes, and an empty string when an uncontrolled composer clears. */
  onValueChange?: (value: string) => void;
  /**
   * Enter or the send button submits the text as typed, and an uncontrolled composer clears. Blank
   * text never submits, and neither does a disabled, running or pending composer. Without onSend,
   * they submit the field's form instead and the text stays until the form resets. Without onSend
   * or a form there is nothing to send: the button is unavailable and Enter starts a new line.
   */
  onSend?: (value: string) => void;
  /**
   * A send is in progress, such as a request the application makes: the send button shows a
   * spinner and sending is unavailable, while the field keeps its text, stays editable and keeps
   * focus. The pending action of an enclosing form counts too;
   * set pending for a form the field joins through its form attribute, or for a request of the
   * application's own.
   */
  pending?: boolean;
  /** A reply is on its way: the send button becomes a stop button and Enter does not submit. */
  running?: boolean;
  /** Called by the stop button while running; it stays available when the field is disabled. */
  onStop?: () => void;
  /**
   * Accessible name of the send button.
   * @default 'Send', or EnvUIProvider's messages.composer.send
   */
  sendLabel?: string;
  /**
   * Accessible name of the stop button.
   * @default 'Stop', or EnvUIProvider's messages.composer.stop
   */
  stopLabel?: string;
  /** Lines the field shows while empty; 1 by default. */
  minRows?: number;
  /** Lines the field grows to before it scrolls; 8 by default. */
  maxRows?: number;
  /** Content at the start of the action row, such as an attach button or the name of a model. */
  start?: ReactNode;
  /**
   * Content in the action row just before the send button, such as a voice button, a model picker
   * or a token count; the field then takes a row of its own above the action row.
   */
  end?: ReactNode;
  /**
   * Content inside the composer above the field, such as attachment chips, a quoted reply or
   * context pills, placed as given.
   */
  header?: ReactNode;
  /**
   * The key that sends: enter, where Shift+Enter starts a new line, or mod-enter, Ctrl+Enter or
   * ⌘+Enter, where Enter starts a new line, for prompts that mostly take several lines.
   * @default 'enter'
   */
  sendKey?: 'enter' | 'mod-enter';
  /** Supporting text below the composer, such as a note on attachments; it describes the field. */
  description?: ReactNode;
}

type ComposerName =
  | {
      /** Names the field, which has no visible label, such as "Message"; this or aria-labelledby. */
      'aria-label': string;
      /** The id of visible text that names the field; this or aria-label. */
      'aria-labelledby'?: string;
    }
  | { 'aria-label'?: string; 'aria-labelledby': string };

export type ComposerProps = ComposerOptions &
  ComposerName &
  Omit<
    ComponentPropsWithRef<'textarea'>,
    keyof ComposerOptions | 'children' | 'rows' | 'cols' | 'aria-label' | 'aria-labelledby'
  >;

const imeProcessKeyCode = 229;

function useContentHeightWithoutFieldSizing(
  inputRef: RefObject<HTMLTextAreaElement | null>,
  text: string,
) {
  const fit = useRef<() => void>(() => undefined);
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input || supportsFieldSizing(input)) return;
    fit.current = () => {
      input.style.blockSize = 'auto';
      input.style.blockSize = `${input.scrollHeight}px`;
    };
    fit.current();
  }, [inputRef, text]);
  useEffect(() => {
    const input = inputRef.current;
    if (!input || supportsFieldSizing(input)) return;
    let width = input.clientWidth;
    const stopRefittingWhenWidthRewrapsText = observeResize(input, () => {
      if (input.clientWidth === width) return;
      width = input.clientWidth;
      fit.current();
    });
    const fonts = input.ownerDocument.fonts;
    const refitWhenWebFontRewrapsText = () => fit.current();
    fonts?.addEventListener('loadingdone', refitWhenWebFontRewrapsText);
    return () => {
      stopRefittingWhenWidthRewrapsText();
      fonts?.removeEventListener('loadingdone', refitWhenWebFontRewrapsText);
    };
  }, [inputRef]);
}

/**
 * The message field of a conversation: a multiline field on a raised surface that grows with its
 * text up to maxRows, with a send button at the end that becomes a stop button while running.
 * Enter submits, or with sendKey mod-enter Ctrl+Enter or ⌘+Enter; Shift+Enter starts a new line and
 * an input method's composition never submits.
 * Without onSend, Enter and the send button submit the field's form.
 */
export function Composer({
  value,
  defaultValue = '',
  onValueChange,
  onSend,
  pending = false,
  running = false,
  onStop,
  sendLabel,
  stopLabel,
  minRows = 1,
  maxRows = 8,
  start,
  end,
  header,
  sendKey = 'enter',
  description,
  disabled = false,
  enterKeyHint,
  id: suppliedId,
  className,
  style,
  ref,
  onChange,
  onKeyDown,
  form,
  'aria-describedby': describedBy,
  ...props
}: ComposerProps) {
  const messages = useMessages('composer', composerMessages);
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const descriptionId = `${id}-description`;
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [text, change, keepOwn] = useControllableState({
    value,
    defaultValue,
    onChange: onValueChange,
  });
  const blank = text.trim() === '';
  const rows = Math.max(1, Math.round(minRows));
  const maximumRows = Math.max(rows, Math.round(maxRows));
  useContentHeightWithoutFieldSizing(inputRef, text);
  const { pending: enclosingFormPending } = useFormStatus();
  const busy = pending || enclosingFormPending;
  const [ownedByFormInDocument, setOwnedByFormInDocument] = useState(form !== undefined);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    setOwnedByFormInDocument(Boolean(inputRef.current?.form));
  });
  const canSend = onSend !== undefined || ownedByFormInDocument;

  useFormReset(inputRef, () => keepOwn(defaultValue), form);

  function trySend() {
    if (disabled || running || blank || busy) return false;
    if (onSend) {
      onSend(text);
      if (value === undefined) change('');
      return true;
    }
    const owningForm = inputRef.current?.form;
    if (!owningForm) return false;
    const invalidFieldReported = !owningForm.noValidate && !owningForm.reportValidity();
    if (invalidFieldReported) return false;
    owningForm.requestSubmit();
    return true;
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.key !== 'Enter' || event.shiftKey || !canSend) return;
    const withModifier = event.ctrlKey || event.metaKey;
    if (sendKey === 'mod-enter' && (!withModifier || event.altKey)) return;
    const confirmsComposition =
      event.nativeEvent.isComposing || event.keyCode === imeProcessKeyCode;
    if (confirmsComposition) return;
    event.preventDefault();
    const repeatOfHeldKey = event.repeat;
    if (!repeatOfHeldKey) trySend();
  }

  const unavailableButFocusable = running ? !onStop : blank || busy || !canSend;
  const touchKeyboardEnterLabel = canSend && sendKey === 'enter' ? 'send' : undefined;
  const actionLabel = running ? (stopLabel ?? messages.stop) : (sendLabel ?? messages.send);

  return (
    <Grid
      gap={2}
      className={classNames('env-composer', className)}
      style={{
        '--_composer-min-rows': rows,
        '--_composer-max-rows': maximumRows,
        ...style,
      }}
      data-running={flag(running)}
      data-disabled={flag(disabled)}
      data-start={flag(start != null)}
      data-end={flag(end != null)}
      data-header={flag(header != null)}
    >
      <div
        className="env-composer-surface"
        onMouseDown={function placeCaretInFieldOnSurfacePress(event) {
          if (event.target !== event.currentTarget || disabled) return;
          event.preventDefault();
          inputRef.current?.focus();
        }}
      >
        {header != null && <Slot className="env-composer-header">{header}</Slot>}
        <TextareaControl
          bare
          {...props}
          ref={mergeRefs(inputRef, ref)}
          id={id}
          form={form}
          rows={rows}
          value={text}
          disabled={disabled}
          enterKeyHint={enterKeyHint ?? touchKeyboardEnterLabel}
          aria-describedby={idRefs(describedBy, description != null ? descriptionId : undefined)}
          className="env-composer-input"
          onChange={(event) => {
            onChange?.(event);
            change(event.currentTarget.value);
          }}
          onKeyDown={handleKeyDown}
        />
        {start != null && (
          <Slot className="env-composer-start" layout="row">
            {start}
          </Slot>
        )}
        {end != null && (
          <Slot className="env-composer-end" layout="row">
            {end}
          </Slot>
        )}
        <IconButton
          variant="primary"
          className="env-composer-action"
          icon={running ? <IconStop filled /> : <IconArrowUpward />}
          aria-label={actionLabel}
          pending={!running && busy}
          disabled={!running && disabled}
          aria-disabled={unavailableButFocusable || undefined}
          onClick={() => {
            if (unavailableButFocusable) return;
            if (running) {
              onStop?.();
              return;
            }
            if (trySend()) inputRef.current?.focus();
          }}
        />
      </div>
      {description != null && (
        <div className="env-composer-footer" id={descriptionId}>
          <Slot className="env-composer-description">{description}</Slot>
        </div>
      )}
    </Grid>
  );
}
