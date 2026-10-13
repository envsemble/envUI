import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { classNames } from '../internal/classNames.js';
import { setRef } from '../internal/setRef.js';

export interface SplitViewProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /** Content of the pane at the inline start. */
  start: ReactNode;
  /** Content of the pane at the inline end. */
  end: ReactNode;
  /** The start pane's share of the width in percent, for a controlled split. */
  size?: number;
  /** The start pane's share when nothing was chosen, in percent; 50 by default. */
  defaultSize?: number;
  /** Called with the start pane's new share in percent while it is resized. */
  onSizeChange?: (size: number) => void;
  /** The smallest share of the start pane in percent; 20 by default. */
  minSize?: number;
  /** The largest share of the start pane in percent; 80 by default. */
  maxSize?: number;
  /**
   * Keep the share chosen in an uncontrolled split under this localStorage key. Another key brings
   * the share stored under it, or the default.
   */
  storageKey?: string;
  /**
   * A width, such as 48rem: while the split view itself is narrower, the panes stack and the
   * divider is removed. The split view then has data-stacked.
   */
  stackBelow?: string;
  /**
   * Called with true when the panes stack and with false when they sit side by side again, for
   * example to show one pane at a time with a way back.
   */
  onStackedChange?: (stacked: boolean) => void;
  /** Accessible name of the divider; Resize panes by default. */
  resizeLabel?: string;
}

const keyboardStep = 2;
const keyboardLargeStep = 10;

function readStoredSize(key: string | undefined) {
  if (!key || typeof window === 'undefined') return undefined;
  try {
    const stored = window.localStorage.getItem(key);
    const size = stored === null ? NaN : Number(stored);
    return Number.isFinite(size) ? size : undefined;
  } catch {
    return undefined;
  }
}

function writeStoredSize(key: string | undefined, size: number | undefined) {
  if (!key) return;
  try {
    if (size === undefined) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, String(size));
  } catch {
    // The split still works when browser storage is unavailable.
  }
}

/**
 * Two panes side by side with a divider between them that resizes them with the pointer and the
 * keyboard. Below stackBelow the panes stack, without the divider.
 */
export function SplitView({
  start,
  end,
  size: controlledSize,
  defaultSize = 50,
  onSizeChange,
  minSize = 20,
  maxSize = 80,
  storageKey,
  stackBelow,
  onStackedChange,
  resizeLabel = 'Resize panes',
  className,
  style,
  ref,
  ...props
}: SplitViewProps) {
  const min = Math.min(100, Math.max(0, minSize));
  const max = Math.min(100, Math.max(min, maxSize));
  const clamp = (value: number) => Math.round(Math.min(max, Math.max(min, value)) * 10) / 10;
  // A size chosen by resizing, or read from storage; until then the default applies.
  const [chosenSize, setChosenSize] = useState<number>();
  const size = clamp(controlledSize ?? chosenSize ?? defaultSize);
  const [stacked, setStacked] = useState(false);
  const [resizing, setResizing] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const probe = useRef<HTMLDivElement>(null);
  const startPane = useRef<HTMLDivElement>(null);
  const endPane = useRef<HTMLDivElement>(null);
  const drag = useRef<{
    pointerId: number;
    startX: number;
    startSize: number;
    /** The chosen size before the drag; undefined while the default applied. */
    startChosen: number | undefined;
    /** Screen pixels per percent of the panes' shared width. */
    pixelsPerPercent: number;
    direction: number;
  }>(null);
  const startId = `${useId()}-start`;

  // Read after mount, so server-rendered markup and the first client render agree. Another key
  // brings its own stored share, or the default.
  useLayoutEffect(() => {
    setChosenSize(readStoredSize(storageKey));
  }, [storageKey]);

  // The split view measures itself, so it stacks by its own width rather than the window's.
  useLayoutEffect(() => {
    const element = root.current;
    const threshold = probe.current;
    if (!element || !threshold || typeof ResizeObserver === 'undefined') {
      setStacked(false);
      return;
    }
    const measure = () => setStacked(element.offsetWidth < threshold.offsetWidth);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    // A rem or em threshold follows the text size.
    observer.observe(threshold);
    return () => observer.disconnect();
  }, [stackBelow]);

  // Reported before paint, so an application can show the stacked layout's own controls at once.
  const reportedStacked = useRef(false);
  useLayoutEffect(() => {
    if (stacked === reportedStacked.current) return;
    reportedStacked.current = stacked;
    onStackedChange?.(stacked);
  }, [stacked, onStackedChange]);

  function changeSize(next: number, persist: boolean) {
    const value = clamp(next);
    if (controlledSize === undefined) {
      setChosenSize(value);
      if (persist) writeStoredSize(storageKey, value);
    }
    if (value !== size) onSizeChange?.(value);
  }

  function inlineDirection(element: Element) {
    return getComputedStyle(element).direction === 'rtl' ? -1 : 1;
  }

  function startResize(event: PointerEvent<HTMLDivElement>) {
    if (event.button !== 0 || !event.isPrimary) return;
    // Dragging selects no text and leaves focus where it is.
    event.preventDefault();
    const element = root.current;
    const shared = (startPane.current?.offsetWidth ?? 0) + (endPane.current?.offsetWidth ?? 0);
    if (!element || shared === 0) return;
    // Transforms, such as a scaled preview, change screen pixels but not layout pixels.
    const scale = element.getBoundingClientRect().width / element.offsetWidth || 1;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startSize: size,
      startChosen: chosenSize,
      pixelsPerPercent: (shared * scale) / 100,
      direction: inlineDirection(event.currentTarget),
    };
    setResizing(true);
  }

  function dragSize(current: NonNullable<typeof drag.current>, event: PointerEvent) {
    return (
      current.startSize +
      ((event.clientX - current.startX) * current.direction) / current.pixelsPerPercent
    );
  }

  function moveResize(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (current?.pointerId !== event.pointerId) return;
    changeSize(dragSize(current, event), false);
  }

  function endResize(event: PointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current || current.pointerId !== event.pointerId) return;
    drag.current = null;
    setResizing(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    if (event.type === 'pointerup') {
      changeSize(dragSize(current, event), true);
      return;
    }
    // A cancelled drag, such as one the browser took over for scrolling, returns to where it began.
    if (controlledSize === undefined) setChosenSize(current.startChosen);
    if (current.startSize !== size) onSizeChange?.(current.startSize);
  }

  function resizeWithKeyboard(event: KeyboardEvent<HTMLDivElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const step = event.shiftKey ? keyboardLargeStep : keyboardStep;
    const direction = inlineDirection(event.currentTarget);
    let next: number;
    if (event.key === 'ArrowRight') next = size + step * direction;
    else if (event.key === 'ArrowLeft') next = size - step * direction;
    else if (event.key === 'Home') next = min;
    else if (event.key === 'End') next = max;
    else return;
    event.preventDefault();
    changeSize(next, true);
  }

  function reset() {
    const value = clamp(defaultSize);
    if (controlledSize === undefined) {
      setChosenSize(undefined);
      writeStoredSize(storageKey, undefined);
    }
    if (value !== size) onSizeChange?.(value);
  }

  return (
    <div
      {...props}
      ref={(node) => {
        root.current = node;
        setRef(ref, node);
      }}
      className={classNames('env-split-view', className)}
      style={{ '--env-split-view-size': size, ...style } as CSSProperties}
      data-stacked={stacked || undefined}
      data-resizing={resizing || undefined}
    >
      <div ref={startPane} id={startId} className="env-split-view-pane" data-pane="start">
        {start}
      </div>
      {!stacked && (
        <div
          role="separator"
          aria-orientation="vertical"
          aria-label={resizeLabel}
          aria-controls={startId}
          aria-valuenow={Math.round(size)}
          aria-valuemin={Math.round(min)}
          aria-valuemax={Math.round(max)}
          aria-valuetext={`${Math.round(size)}%`}
          tabIndex={0}
          className="env-split-view-divider"
          onPointerDown={startResize}
          onPointerMove={moveResize}
          onPointerUp={endResize}
          onPointerCancel={endResize}
          onLostPointerCapture={endResize}
          onKeyDown={resizeWithKeyboard}
          onDoubleClick={reset}
        />
      )}
      <div ref={endPane} className="env-split-view-pane" data-pane="end">
        {end}
      </div>
      {stackBelow !== undefined && (
        <div
          ref={probe}
          className="env-split-view-probe"
          aria-hidden="true"
          style={{ inlineSize: stackBelow }}
        />
      )}
    </div>
  );
}
