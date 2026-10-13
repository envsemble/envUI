import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { useFormStatus } from 'react-dom';
import { IconButton } from '../actions/Button.js';
import { ArrowUpward } from '../icons/ArrowUpward.js';
import { Stop } from '../icons/Stop.js';
import { classNames } from '../internal/classNames.js';
import { setRef } from '../internal/setRef.js';
import { subscribeFormReset } from './internal/subscribeFormReset.js';

interface ComposerOptions {
  /** The message text of a controlled composer. */
  value?: string;
  /**
   * The starting text of an uncontrolled composer; it clears after each submit through onSubmit and
   * when its form resets.
   */
  defaultValue?: string;
  /** Receives the text as it changes, and an empty string when an uncontrolled composer clears. */
  onValueChange?: (value: string) => void;
  /**
   * Enter or the send button submits the text as typed, and an uncontrolled composer clears. Blank
   * text never submits, and neither does a disabled or running composer, or one whose form action
   * is pending. Without onSubmit, they submit the field's form instead and the text stays until the
   * form resets. Without onSubmit or a form there is nothing to send: the button is unavailable and
   * Enter starts a new line.
   */
  onSubmit?: (value: string) => void;
  /** A reply is on its way: the send button becomes a stop button and Enter does not submit. */
  running?: boolean;
  /** Called by the stop button while running; it stays available when the field is disabled. */
  onStop?: () => void;
  /** Accessible name of the send button; Send by default. */
  sendLabel?: string;
  /** Accessible name of the stop button; Stop by default. */
  stopLabel?: string;
  /** Lines the field shows while empty; 1 by default. */
  minRows?: number;
  /** Lines the field grows to before it scrolls; 8 by default. */
  maxRows?: number;
  /** Content at the start of the action row, such as an attach button or the name of a model. */
  start?: ReactNode;
  /** Supporting text below the composer, such as a note on attachments; it describes the field. */
  footer?: ReactNode;
}

/** The field needs a name: aria-label without a visible label, or aria-labelledby. */
type ComposerName =
  | { 'aria-label': string; 'aria-labelledby'?: string }
  | { 'aria-label'?: string; 'aria-labelledby': string };

export type ComposerProps = ComposerOptions &
  ComposerName &
  Omit<
    ComponentPropsWithRef<'textarea'>,
    keyof ComposerOptions | 'children' | 'rows' | 'cols' | 'aria-label' | 'aria-labelledby'
  >;

/** Grows the field with its text where native content sizing is unavailable. */
function useContentHeight(inputRef: RefObject<HTMLTextAreaElement | null>, text: string) {
  const fit = useRef<() => void>(() => undefined);
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input || input.ownerDocument.defaultView?.CSS?.supports('field-sizing', 'content')) return;
    fit.current = () => {
      // The style sheet keeps the height between the minimum and maximum rows.
      input.style.blockSize = 'auto';
      input.style.blockSize = `${input.scrollHeight}px`;
    };
    fit.current();
  }, [inputRef, text]);
  useEffect(() => {
    const input = inputRef.current;
    if (!input || typeof ResizeObserver === 'undefined') return;
    let width = input.clientWidth;
    // A new width rewraps the text, and so does the web font once it has loaded.
    const observer = new ResizeObserver(() => {
      if (input.clientWidth === width) return;
      width = input.clientWidth;
      fit.current();
    });
    observer.observe(input);
    const fonts = input.ownerDocument.fonts;
    const refit = () => fit.current();
    fonts?.addEventListener('loadingdone', refit);
    return () => {
      observer.disconnect();
      fonts?.removeEventListener('loadingdone', refit);
    };
  }, [inputRef]);
}

/**
 * The message field of a conversation: a multiline field on a raised surface that grows with its
 * text up to maxRows, with a send button at the end that becomes a stop button while running.
 * Enter submits, Shift+Enter starts a new line and an input method's composition never submits.
 * Without onSubmit, Enter and the send button submit the field's form.
 */
export function Composer({
  value,
  defaultValue = '',
  onValueChange,
  onSubmit,
  running = false,
  onStop,
  sendLabel = 'Send',
  stopLabel = 'Stop',
  minRows = 1,
  maxRows = 8,
  start,
  footer,
  disabled = false,
  enterKeyHint = 'send',
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
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const footerId = `${id}-footer`;
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [uncontrolledValue, setUncontrolledValue] = useState(defaultValue);
  const text = value ?? uncontrolledValue;
  const blank = text.trim() === '';
  const rows = Math.max(1, Math.round(minRows));
  const maximumRows = Math.max(rows, Math.round(maxRows));
  useContentHeight(inputRef, text);
  // A form action in progress holds the next send, when the composer renders inside its form.
  const { pending: formPending } = useFormStatus();
  // Whether the field belongs to a form, known once it is in the document.
  const [inForm, setInForm] = useState(form !== undefined);
  useLayoutEffect(() => {
    setInForm(Boolean(inputRef.current?.form));
  });
  const canSend = onSubmit !== undefined || inForm;

  // The browser resets the native field; an uncontrolled composer follows with its own text.
  useEffect(() => {
    const input = inputRef.current;
    if (!input?.form || value !== undefined) return;
    return subscribeFormReset(input.form, () => setUncontrolledValue(defaultValue));
  }, [value, defaultValue, form]);

  function change(next: string) {
    if (value === undefined) setUncontrolledValue(next);
    onValueChange?.(next);
  }

  /** Sends the text, and reports whether it went. */
  function submit() {
    if (disabled || running || blank || formPending) return false;
    if (onSubmit) {
      onSubmit(text);
      if (value === undefined) change('');
      return true;
    }
    // The form sends the field under its name; the text stays until the form resets, as a form
    // action does once it succeeds.
    const owner = inputRef.current?.form;
    if (!owner) return false;
    // An invalid field keeps the form from submitting: the browser reports it and focuses it.
    if (!owner.noValidate && !owner.checkValidity()) {
      owner.reportValidity();
      return false;
    }
    owner.requestSubmit();
    return true;
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    onKeyDown?.(event);
    if (event.defaultPrevented || event.key !== 'Enter' || event.shiftKey || !canSend) return;
    // Enter that confirms an input method's composition belongs to the composition.
    if (event.nativeEvent.isComposing || event.keyCode === 229) return;
    event.preventDefault();
    // A held Enter key repeats; only its first press sends.
    if (!event.repeat) submit();
  }

  // The action stays focusable while unavailable, so focus is never lost when it changes between
  // send and stop. A disabled composer disables sending; stopping stays available while running.
  const unavailable = running ? !onStop : blank || formPending || !canSend;
  const actionLabel = running ? stopLabel : sendLabel;

  return (
    <div
      className={classNames('env-composer', className)}
      style={
        {
          '--env-composer-min-rows': rows,
          '--env-composer-max-rows': maximumRows,
          ...style,
        } as CSSProperties
      }
      data-running={running || undefined}
      data-disabled={disabled || undefined}
      data-start={start != null || undefined}
    >
      <div
        className="env-composer-surface"
        onMouseDown={(event) => {
          // A press on the surface around the field places the caret in the field.
          if (event.target !== event.currentTarget || disabled) return;
          event.preventDefault();
          inputRef.current?.focus();
        }}
      >
        <textarea
          {...props}
          ref={(node) => {
            inputRef.current = node;
            setRef(ref, node);
          }}
          id={id}
          form={form}
          rows={rows}
          value={text}
          disabled={disabled}
          enterKeyHint={enterKeyHint}
          aria-describedby={
            [describedBy, footer != null ? footerId : undefined].filter(Boolean).join(' ') ||
            undefined
          }
          className="env-composer-input"
          onChange={(event) => {
            onChange?.(event);
            change(event.currentTarget.value);
          }}
          onKeyDown={handleKeyDown}
        />
        {start != null && <div className="env-composer-start">{start}</div>}
        <IconButton
          variant="primary"
          className="env-composer-action"
          icon={running ? <Stop filled /> : <ArrowUpward />}
          aria-label={actionLabel}
          disabled={!running && disabled}
          aria-disabled={unavailable || undefined}
          onClick={() => {
            if (unavailable) return;
            if (running) {
              onStop?.();
              return;
            }
            if (submit()) inputRef.current?.focus();
          }}
        />
      </div>
      {footer != null && (
        <div className="env-composer-footer" id={footerId}>
          {footer}
        </div>
      )}
    </div>
  );
}
