'use client';

import { useLayoutEffect, useRef, useState, type RefObject } from 'react';
import { useMessages } from '../provider/EnvUIContext.js';
import { useResize } from '../resize/useResize.js';
import { textarea as textareaMessages } from '../../foundations/messages/textarea.js';
import type { TextareaControlProps } from './TextareaControl.js';
import { pixelsOf } from '../dom/lengths.js';
import { observeResize } from '../dom/observeResize.js';
import { supportsFieldSizing } from './fieldSizing.js';
import '../../styles/Base.css';
import '../../styles/TextField.css';
import '../../styles/TextareaResizeHandle.css';

interface Metrics {
  height: number;
  minimumHeight: number;
  maximumHeight: number;
  lineHeight: number;
  fontSize: number;
}

const unparsedLengthPixels = 16;

function measureTextarea(input: HTMLTextAreaElement): Metrics {
  const styles = (input.ownerDocument.defaultView ?? window).getComputedStyle(input);
  const minimumHeight = pixelsOf(styles.minHeight);
  const maximumHeight = Number.parseFloat(styles.maxHeight);
  return {
    height: input.offsetHeight,
    minimumHeight,
    maximumHeight: Number.isFinite(maximumHeight)
      ? Math.max(minimumHeight, maximumHeight)
      : Infinity,
    lineHeight: Number.parseFloat(styles.lineHeight) || unparsedLengthPixels,
    fontSize: Number.parseFloat(styles.fontSize) || unparsedLengthPixels,
  };
}

const practicalMaximumLinesWithoutCssMaximum = 500;

const unmeasured: Metrics = {
  height: 0,
  minimumHeight: 0,
  maximumHeight: Infinity,
  lineHeight: unparsedLengthPixels,
  fontSize: unparsedLengthPixels,
};

/**
 * The lower edge of a text area, which resizes it: a separator on useResize that the pointer drags
 * and the Up and Down arrows move by a line (five with Shift or Page Up and Page Down), with Home for
 * the minimum height. It sets the text area's height without owning its text or selection.
 */
export function TextareaResizeHandle({
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

  useLayoutEffect(
    function followTextareaHeightWhateverChangesIt() {
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
      return observeResize(input, measure);
    },
    [inputRef],
  );

  useLayoutEffect(() => {
    const input = inputRef.current;
    const manualHeightWouldConstrainContentSizing =
      input && sizing === 'content' && supportsFieldSizing(input);
    if (manualHeightWouldConstrainContentSizing) {
      if (manualHeight.current && input.style.height === manualHeight.current.applied) {
        input.style.height = manualHeight.current.original;
      }
      manualHeight.current = null;
    }
  }, [inputRef, sizing]);

  function resizeTo(height: number) {
    const input = inputRef.current;
    if (!input || input.disabled || !Number.isFinite(height)) return;
    const nextHeightInEmToFollowTextSize = `${height / metrics.fontSize}em`;
    if (!manualHeight.current || input.style.height !== manualHeight.current.applied) {
      manualHeight.current = {
        original: input.style.height,
        applied: nextHeightInEmToFollowTextSize,
      };
    }
    input.style.height = nextHeightInEmToFollowTextSize;
    manualHeight.current.applied = input.style.height;
  }

  const bounded = Number.isFinite(metrics.maximumHeight);
  const maximum = bounded
    ? metrics.maximumHeight
    : Math.max(
        metrics.height,
        metrics.minimumHeight,
        metrics.lineHeight * practicalMaximumLinesWithoutCssMaximum,
      );
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
      onKeyDown={(event) => {
        const noMaximumToGoTo = event.key === 'End' && !bounded;
        if (noMaximumToGoTo) return;
        handleProps.onKeyDown(event);
      }}
      className="env-textarea-resize-handle"
      aria-label={messages.resize}
      aria-controls={inputId}
      aria-description={messages.resizeDescription}
    />
  );
}
