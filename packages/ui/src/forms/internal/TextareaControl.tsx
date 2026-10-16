'use client';

import {
  forwardRef,
  useCallback,
  useRef,
  type CSSProperties,
  type TextareaHTMLAttributes,
} from 'react';
import { classNames } from '../../internal/classNames.js';
import { setRef } from '../../internal/setRef.js';
import { TextareaResizeEdge } from './TextareaResizeEdge.js';

export interface TextareaControlProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Scroll and resize from the bottom edge (default), or grow and shrink with content. */
  sizing?: 'fixed' | 'content';
}

/** Shared native control; field composition stays with Textarea and MarkdownEditor. */
export const TextareaControl = forwardRef<HTMLTextAreaElement, TextareaControlProps>(
  function TextareaControl({ className, sizing = 'fixed', rows, style, ...props }, ref) {
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const attachInput = useCallback(
      (input: HTMLTextAreaElement | null) => {
        inputRef.current = input;
        setRef(ref, input);
      },
      [ref],
    );
    // Native content sizing ignores rows, so preserve it as the minimum line count in CSS. Without
    // rows a growing field starts at the shared 7.5 rem; with rows, at that many lines.
    const sizingStyle =
      sizing === 'content'
        ? ({ '--env-textarea-rows': rows ?? 2, ...style } as CSSProperties)
        : style;
    return (
      <>
        <textarea
          {...props}
          ref={attachInput}
          rows={rows ?? 2}
          data-sizing={sizing}
          data-rows={sizing === 'content' && rows !== undefined ? '' : undefined}
          style={sizingStyle}
          className={classNames('env-text-input', className)}
        />
        <TextareaResizeEdge
          inputRef={inputRef}
          inputId={props.id}
          sizing={sizing}
          disabled={props.disabled}
        />
      </>
    );
  },
);
