'use client';

import { useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { useMessages } from '../provider/EnvUIContext.js';
import { useResize } from '../resize/useResize.js';
import { textarea as textareaMessages } from '../../foundations/messages/textarea.js';
import type { TextareaControlProps } from './TextareaControl.js';
import '../../styles/Base.css';
import '../../styles/TextField.css';
import '../../styles/TextareaResizeEdge.css';

interface Metrics {
  height: number;
  minimumHeight: number;
  maximumHeight: number;
  lineHeight: number;
  fontSize: number;
}

/** What a length counts as where it doesn't parse, such as a line height of normal: a default rem. */
const defaultPixels = 16;

function measureTextarea(input: HTMLTextAreaElement): Metrics {
  const styles = input.ownerDocument.defaultView!.getComputedStyle(input);
  const minimumHeight = Number.parseFloat(styles.minHeight) || 0;
  const maximumHeight = Number.parseFloat(styles.maxHeight);
  return {
    height: input.offsetHeight,
    minimumHeight,
    maximumHeight: Number.isFinite(maximumHeight)
      ? Math.max(minimumHeight, maximumHeight)
      : Infinity,
    lineHeight: Number.parseFloat(styles.lineHeight) || defaultPixels,
    fontSize: Number.parseFloat(styles.fontSize) || defaultPixels,
  };
}

/** The lines a text area without a CSS maximum height can be resized to. */
const practicalMaximumLines = 500;

const unmeasured: Metrics = {
  height: 0,
  minimumHeight: 0,
  maximumHeight: Infinity,
  lineHeight: defaultPixels,
  fontSize: defaultPixels,
};

/**
 * The lower edge of a text area, which resizes it: a separator on useResize that the pointer drags
 * and the Up and Down arrows move by a line (five with Shift or Page Up and Page Down), with Home for
 * the minimum height. It sets the text area's height without owning its text or selection.
 */
export function TextareaResizeEdge({
  inputRef,
  inputId,
  sizing,
  disabled = false,
}: {
  inputRef: RefObject<HTMLTextAreaElement | null>;
  inputId?: string;
  sizing: NonNullable<TextareaControlProps['sizing']>;
  disabled?: boolean;
}) {
  const messages = useMessages('textarea', textareaMessages);
  const [metrics, setMetrics] = useState<Metrics>(unmeasured);
  const manualHeight = useRef<{ original: string; applied: string } | null>(null);

  // The height the handle reports and starts a drag from follows the text area's own, whatever
  // changes it.
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    const measure = () =>
      setMetrics((current) => {
        const next = measureTextarea(input);
        return Object.keys(next).every(
          (key) => next[key as keyof Metrics] === current[key as keyof Metrics],
        )
          ? current
          : next;
      });
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(input);
    return () => observer.disconnect();
  }, [inputRef]);

  useLayoutEffect(() => {
    const input = inputRef.current;
    const automatic =
      sizing === 'content' &&
      input?.ownerDocument.defaultView?.CSS.supports('field-sizing', 'content');
    // A manually chosen fixed height must not constrain automatic content sizing.
    if (input && automatic) {
      if (manualHeight.current && input.style.height === manualHeight.current.applied) {
        input.style.height = manualHeight.current.original;
      }
      manualHeight.current = null;
    }
  }, [inputRef, sizing]);

  function resizeTo(height: number) {
    const input = inputRef.current;
    if (!input || input.disabled || !Number.isFinite(height)) return;
    // In em, so the chosen height follows the text size.
    const nextHeight = `${height / metrics.fontSize}em`;
    if (!manualHeight.current || input.style.height !== manualHeight.current.applied) {
      manualHeight.current = { original: input.style.height, applied: nextHeight };
    }
    input.style.height = nextHeight;
    manualHeight.current.applied = input.style.height;
  }

  const bounded = Number.isFinite(metrics.maximumHeight);
  // A separator needs a finite maximum: without a CSS one, a practical maximum of a few hundred
  // lines, or the current height where it is taller.
  const maximum = bounded
    ? metrics.maximumHeight
    : Math.max(metrics.height, metrics.minimumHeight, metrics.lineHeight * practicalMaximumLines);
  const { handleProps } = useResize({
    axis: 'block',
    value: metrics.height,
    min: metrics.minimumHeight,
    max: maximum,
    step: metrics.lineHeight,
    largeStep: metrics.lineHeight * 5,
    onChange: (next) => resizeTo(next),
    disabled,
  });

  return (
    <div
      {...handleProps}
      // Without a maximum height, End has no height to go to: the practical maximum is not one.
      onKeyDown={(event) => {
        if (event.key === 'End' && !bounded) return;
        handleProps.onKeyDown(event);
      }}
      className="env-textarea-resize-handle"
      aria-label={messages.resize}
      aria-controls={inputId}
      aria-description={messages.resizeDescription}
    />
  );
}
