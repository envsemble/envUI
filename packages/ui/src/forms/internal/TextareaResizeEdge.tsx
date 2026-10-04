import { useLayoutEffect, useRef, useState, type PointerEvent, type RefObject } from 'react';
import type { TextareaControlProps } from './TextareaControl.js';

function measure(input: HTMLTextAreaElement) {
  const styles = input.ownerDocument.defaultView!.getComputedStyle(input);
  const min = Number.parseFloat(styles.minHeight) || 0;
  const max = Number.parseFloat(styles.maxHeight);
  return {
    height: input.offsetHeight,
    min,
    max: Number.isFinite(max) ? Math.max(min, max) : Infinity,
    step: Number.parseFloat(styles.lineHeight) || 16,
  };
}

/** The whole lower edge resizes the native control without owning its text or selection. */
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
  const [resizing, setResizing] = useState(false);
  const edgeRef = useRef<HTMLButtonElement>(null);
  const drag = useRef<
    | (ReturnType<typeof measure> & {
        pointerId: number;
        y: number;
        scale: number;
      })
    | null
  >(null);
  const manualHeight = useRef<{ original: string; applied: string } | null>(null);

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
    if (automatic || disabled) {
      const pointerId = drag.current?.pointerId;
      drag.current = null;
      setResizing(false);
      if (pointerId != null && edgeRef.current?.hasPointerCapture(pointerId)) {
        edgeRef.current.releasePointerCapture(pointerId);
      }
    }
  }, [inputRef, sizing, disabled]);

  function resizeTo(height: number, limits: ReturnType<typeof measure>) {
    const input = inputRef.current;
    if (!input || input.disabled) return;
    const nextHeight = `${Math.round(Math.min(limits.max, Math.max(limits.min, height)))}px`;
    if (!manualHeight.current || input.style.height !== manualHeight.current.applied) {
      manualHeight.current = { original: input.style.height, applied: nextHeight };
    }
    manualHeight.current.applied = nextHeight;
    input.style.height = nextHeight;
  }

  function finishDrag(event: PointerEvent<HTMLButtonElement>) {
    if (drag.current?.pointerId !== event.pointerId) return;
    drag.current = null;
    setResizing(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  return (
    <button
      type="button"
      ref={edgeRef}
      className="env-textarea-resize-edge"
      disabled={disabled}
      aria-label="Resize text area"
      aria-controls={inputId}
      aria-description="Drag the bottom edge, or use Up and Down arrows to resize. Home restores the minimum height."
      data-resizing={resizing || undefined}
      onPointerDown={(event) => {
        const input = inputRef.current;
        if (!input || input.disabled || !event.isPrimary || event.button !== 0) return;
        event.preventDefault();
        const bounds = measure(input);
        drag.current = {
          ...bounds,
          pointerId: event.pointerId,
          y: event.clientY,
          scale: input.getBoundingClientRect().height / bounds.height || 1,
        };
        event.currentTarget.setPointerCapture(event.pointerId);
        setResizing(true);
      }}
      onPointerMove={(event) => {
        const current = drag.current;
        if (!current || current.pointerId !== event.pointerId) return;
        if (inputRef.current?.disabled) {
          finishDrag(event);
          return;
        }
        resizeTo(current.height + (event.clientY - current.y) / current.scale, current);
      }}
      onPointerUp={finishDrag}
      onPointerCancel={finishDrag}
      onLostPointerCapture={finishDrag}
      onKeyDown={(event) => {
        const input = inputRef.current;
        if (!input || input.disabled || event.altKey || event.ctrlKey || event.metaKey) return;
        if (!['ArrowUp', 'ArrowDown', 'Home'].includes(event.key)) return;
        event.preventDefault();
        const bounds = measure(input);
        const step = bounds.step * (event.shiftKey ? 5 : 1);
        resizeTo(
          event.key === 'Home'
            ? bounds.min
            : bounds.height + (event.key === 'ArrowUp' ? -step : step),
          bounds,
        );
      }}
      onClick={(event) => {
        // Keyboard and assistive activation grow one line; dragging never adds a click step.
        const input = inputRef.current;
        if (!input || input.disabled || event.detail !== 0) return;
        const bounds = measure(input);
        resizeTo(bounds.height + bounds.step, bounds);
      }}
    />
  );
}
