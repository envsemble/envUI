'use client';

import { useCallback, useRef, type Ref, type TextareaHTMLAttributes } from 'react';
import { classNames } from '../classNames.js';
import { setRef } from '../setRef.js';
import { TextareaResizeEdge } from './TextareaResizeEdge.js';
import { flag } from '../flag.js';
import '../../styles/Base.css';
import '../../styles/TextField.css';

export interface TextareaControlProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /**
   * How the height follows the text: fixed keeps its height, scrolls and resizes from the bottom
   * edge, by dragging it or with the arrow keys; content grows and shrinks with the text.
   * @default 'fixed'
   */
  sizing?: 'fixed' | 'content';
  /**
   * The lines the field shows: with fixed sizing, its height in rows, which resizes down to them or
   * to 7.5 rem, whichever is less; with content sizing, the lines it starts at and shrinks back to.
   * Without rows, both start at 7.5 rem.
   */
  rows?: number;
}

/**
 * The one native text area of envUI: a text field's, with its resize edge, for Textarea and
 * MarkdownEditor, or a bare one that its owner styles and sizes, as Composer's.
 */
export function TextareaControl({
  ref,
  className,
  sizing = 'fixed',
  rows,
  style,
  bare = false,
  ...props
}: TextareaControlProps & {
  ref?: Ref<HTMLTextAreaElement>;
  /** A text area without the text field's look and resize edge; the owner's class styles it. */
  bare?: boolean;
}) {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const attachInput = useCallback(
    (input: HTMLTextAreaElement | null) => {
      inputRef.current = input;
      setRef(ref, input);
    },
    [ref],
  );
  if (bare)
    return (
      <textarea {...props} ref={attachInput} rows={rows} style={style} className={className} />
    );
  // Native content sizing ignores rows, and the shared 7.5 rem minimum would outgrow a few, so
  // rows are the minimum line count in CSS. Without rows a field starts at the shared 7.5 rem.
  const sizingStyle =
    sizing === 'content' || rows !== undefined
      ? { '--env-textarea-rows': rows ?? 2, ...style }
      : style;
  return (
    <>
      <textarea
        {...props}
        ref={attachInput}
        rows={rows ?? 2}
        data-sizing={sizing}
        data-rows={flag(rows !== undefined)}
        style={sizingStyle}
        className={classNames('env-text-field-input', className)}
      />
      <TextareaResizeEdge
        inputRef={inputRef}
        inputId={props.id}
        sizing={sizing}
        disabled={props.disabled}
      />
    </>
  );
}
