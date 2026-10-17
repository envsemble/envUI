'use client';

import {
  useCallback,
  useContext,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentPropsWithRef,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { classNames } from '../internal/classNames.js';
import { cssLength } from '../internal/cssLength.js';
import { setRef } from '../internal/setRef.js';
import { useStackedReport } from '../internal/useStackedReport.js';
import { useMessages } from '../internal/EnvUIContext.js';
import { useFormatters } from '../internal/useFormatters.js';
import { ResizeHandle as InternalResizeHandle } from '../internal/ResizeHandle.js';
import { splitPane } from '../foundations/messages/splitPane.js';
import { useContainerSize } from '../foundations/useContainerSize.js';
import { withDisplayName } from '../internal/withDisplayName.js';
import { StackStyle } from './internal/StackStyle.js';
import {
  SplitPaneContext,
  type SizeUnit,
  type SplitPaneContextValue,
} from './internal/SplitPaneContext.js';

export type { SizeUnit };

export interface RootProps extends Omit<ComponentPropsWithRef<'div'>, 'children'> {
  /**
   * How the panes sit: horizontal, side by side with the first at the inline start, or vertical,
   * one above the other. A vertical split pane needs a height of its own.
   * @default 'horizontal'
   */
  orientation?: 'horizontal' | 'vertical';
  /** The first pane's size in `unit`, for a controlled split pane. */
  size?: number;
  /**
   * The first pane's size in `unit` until people choose one, or one is stored under `persist`.
   * @default 50
   */
  defaultSize?: number;
  /**
   * Receives each new size of the first pane, in `unit`: while dragging with committed false, and
   * with committed true as a drag ends, a key moves the handle or a double click resets it.
   */
  onSizeChange?: (size: number, details: { committed: boolean }) => void;
  /**
   * The first pane's smallest size, in `unit`.
   * @default 20
   */
  minSize?: number;
  /**
   * The first pane's largest size, in `unit`.
   * @default 80
   */
  maxSize?: number;
  /**
   * The unit of the sizes: %, a share of the split pane's width (height when vertical), or rem,
   * a length that follows the reader's text size, such as a list that keeps its width as the
   * window grows.
   * @default '%'
   */
  unit?: SizeUnit;
  /**
   * Keeps the size people choose under this localStorage key, for an uncontrolled split pane; a
   * double click on the handle forgets it. It is read after the first render, so server markup and
   * hydration agree.
   */
  persist?: string;
  /**
   * A width, such as '44rem', or a number of pixels: while the split pane itself is narrower, its
   * panes stack, the first above the second, the handle goes and the root has data-stacked. It
   * follows the split pane's own width, not the window's, so a split pane in a narrow column
   * stacks too. A container query stacks the server's markup before any script runs.
   */
  stackBelow?: string | number;
  /** Receives true when the panes stack and false when they sit side by side again. */
  onStackedChange?: (stacked: boolean) => void;
  /** The panes and the handle between them: Pane, ResizeHandle, Pane. */
  children: ReactNode;
}

export interface PaneProps extends ComponentPropsWithRef<'div'> {
  /**
   * Names the pane, which makes it a region landmark that people can jump to, such as Documents.
   * Name the panes of a page's main layout; leave small panes unnamed.
   */
  label?: string;
}

export interface ResizeHandleProps
  extends Omit<ComponentPropsWithRef<'div'>, 'children' | 'aria-label' | 'onChange'> {
  /**
   * The handle's name, which says what it resizes, such as Resize document list.
   * @default 'Resize panes', or EnvUIProvider's messages.splitPane.resize
   */
  label?: string;
}

function readStoredSize(key: string) {
  try {
    const stored = window.localStorage.getItem(key);
    const size = stored === null ? NaN : Number(stored);
    return Number.isFinite(size) ? size : undefined;
  } catch {
    return undefined;
  }
}

function writeStoredSize(key: string, size: number | undefined) {
  try {
    if (size === undefined) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, String(size));
  } catch {
    // The split pane still works when browser storage is unavailable.
  }
}

/**
 * The stacked rules for one stackBelow width, which SplitPane.css carries for 44rem: the panes
 * take the whole row, one above the other with a hairline between, and the handle goes.
 */
const stackRules = (width: string) =>
  `.env-split-pane${width}>.env-split-pane-pane{grid-column:1/-1}` +
  `.env-split-pane${width}>.env-split-pane-handle{display:none}` +
  `.env-split-pane${width}>.env-split-pane-pane:not([hidden])~.env-split-pane-pane{` +
  'border-block-start:var(--env-control-border-width) solid var(--env-color-border-muted)}';

/** Sizes are kept to a tenth of a percent, or a hundredth of a rem. */
const round = (value: number, unit: SizeUnit) =>
  unit === '%' ? Math.round(value * 10) / 10 : Math.round(value * 100) / 100;

/**
 * Two panes and a handle between them that resizes them, by pointer and keyboard (the APG window
 * splitter). Below `stackBelow` of its own width the panes stack and the handle goes.
 */
function Root({
  orientation = 'horizontal',
  size: controlledSize,
  defaultSize = 50,
  onSizeChange,
  minSize = 20,
  maxSize = 80,
  unit = '%',
  persist,
  stackBelow,
  onStackedChange,
  className,
  style,
  ref,
  children,
  ...props
}: RootProps) {
  const min = unit === '%' ? Math.min(100, Math.max(0, minSize)) : Math.max(0, minSize);
  const max = unit === '%' ? Math.min(100, Math.max(min, maxSize)) : Math.max(min, maxSize);
  const clamp = useCallback(
    (value: number) => round(Math.min(max, Math.max(min, value)), unit),
    [min, max, unit],
  );
  // A size chosen by resizing, or read from storage; until then the default applies.
  const [chosenSize, setChosenSize] = useState<number>();
  const size = clamp(controlledSize ?? chosenSize ?? defaultSize);

  // Read after mount, so server markup and the first client render agree. Another key brings its
  // own stored size, or the default.
  useLayoutEffect(() => {
    setChosenSize(persist ? readStoredSize(persist) : undefined);
  }, [persist]);

  const root = useRef<HTMLDivElement>(null);
  const probe = useRef<HTMLDivElement>(null);
  const rootSize = useContainerSize(root);
  // The probe is as wide as stackBelow, in the split pane's own text size, so any CSS length works.
  const threshold = useContainerSize(probe, { box: 'border-box' });
  const stacked =
    stackBelow !== undefined &&
    rootSize !== undefined &&
    threshold !== undefined &&
    rootSize.inlineSize < threshold.inlineSize;
  useStackedReport(stacked, onStackedChange);
  const stackWidth = stackBelow === undefined ? undefined : cssLength(stackBelow);

  const latest = useRef({ size, controlledSize, onSizeChange, persist, defaultSize, clamp });
  latest.current = { size, controlledSize, onSizeChange, persist, defaultSize, clamp };

  const change = useCallback((next: number, committed: boolean) => {
    const current = latest.current;
    const value = current.clamp(next);
    if (current.controlledSize === undefined) {
      setChosenSize(value);
      if (committed && current.persist) writeStoredSize(current.persist, value);
    }
    if (committed || value !== current.size) current.onSizeChange?.(value, { committed });
  }, []);

  const reset = useCallback(() => {
    const current = latest.current;
    const value = current.clamp(current.defaultSize);
    if (current.controlledSize === undefined) {
      setChosenSize(undefined);
      if (current.persist) writeStoredSize(current.persist, undefined);
    }
    current.onSizeChange?.(value, { committed: true });
  }, []);

  const context = useMemo<SplitPaneContextValue>(
    () => ({ orientation, size, min, max, unit, stacked, rootSize, change, reset }),
    [orientation, size, min, max, unit, stacked, rootSize, change, reset],
  );

  return (
    <SplitPaneContext value={context}>
      <div
        {...props}
        ref={(node) => {
          root.current = node;
          setRef(ref, node);
        }}
        className={classNames('env-split-pane', className)}
        style={{ '--env-split-pane-size': `${size}${unit}`, ...style } as CSSProperties}
        data-orientation={orientation}
        data-stacked={stacked ? '' : undefined}
        data-stack-below={stackWidth}
      >
        {children}
        {stackWidth !== undefined && (
          <>
            <div
              ref={probe}
              className="env-split-pane-probe"
              aria-hidden="true"
              style={{ inlineSize: stackWidth }}
            />
            <StackStyle name="env-split-pane" stackBelow={stackWidth} rules={stackRules} />
          </>
        )}
      </div>
    </SplitPaneContext>
  );
}

/** One of the two panes. It scrolls on its own when the split pane has a size of its own. */
function Pane({ label, id, className, ...props }: PaneProps) {
  const generated = useId();
  return (
    <div
      {...props}
      id={id ?? generated}
      className={classNames('env-split-pane-pane', className)}
      {...(label !== undefined && { role: 'region', 'aria-label': label })}
    />
  );
}

/** The root font size in pixels, read after mount; 16 on the server and in the first render. */
function useRemPixels() {
  const [pixels, setPixels] = useState(16);
  useLayoutEffect(() => {
    setPixels(Number.parseFloat(getComputedStyle(document.documentElement).fontSize) || 16);
  }, []);
  return pixels;
}

/**
 * The handle between the panes: a focusable separator that the pointer drags and the arrow keys
 * move, which names the first pane in aria-controls. A double click returns it to the default
 * size. A stacked split pane has none.
 */
function ResizeHandle({ label, className, onDoubleClick, ref, ...props }: ResizeHandleProps) {
  const context = useContext(SplitPaneContext);
  const messages = useMessages('splitPane', splitPane);
  const handle = useRef<HTMLDivElement>(null);
  const [controls, setControls] = useState<string>();
  const remPixels = useRemPixels();
  const formatters = useFormatters();
  // The pane before the handle is the one it sizes.
  useLayoutEffect(() => {
    const previous = handle.current?.previousElementSibling;
    setControls(previous?.id || undefined);
  }, [context?.stacked]);
  if (!context) throw new Error('SplitPane.ResizeHandle must be inside SplitPane.Root.');
  if (context.stacked) return null;
  const { orientation, size, min, max, unit, rootSize, change, reset } = context;
  const axis = orientation === 'horizontal' ? 'inline' : 'block';
  // A rem size moves as a share of the root, so the handle follows the pointer exactly; its value
  // is then the first pane's share of the root in percent.
  const extent = rootSize && (axis === 'inline' ? rootSize.inlineSize : rootSize.blockSize);
  const toShare =
    unit === 'rem' && extent ? (rem: number) => ((rem * remPixels) / extent) * 100 : undefined;
  const fromShare = (share: number) =>
    toShare && extent ? (share * extent) / 100 / remPixels : share;
  // In rem, the value says the size too, as the share alone would change with the window.
  const valueText = toShare
    ? (share: number) =>
        messages.remValue({
          share: formatters
            .number({ style: 'percent', maximumFractionDigits: 0 })
            .format(share / 100),
          size: formatters
            .number({ maximumFractionDigits: 1 })
            .format(round(fromShare(share), unit)),
        })
    : undefined;
  return (
    <InternalResizeHandle
      {...props}
      ref={(node) => {
        handle.current = node;
        setRef(ref, node);
      }}
      axis={axis}
      unit="%"
      value={toShare ? toShare(size) : size}
      min={toShare ? toShare(min) : min}
      max={toShare ? Math.min(100, toShare(max)) : max}
      step={toShare ? toShare(1) : 2}
      largeStep={toShare ? toShare(5) : 10}
      onChange={(value, { committed }) => change(fromShare(value), committed)}
      valueText={valueText}
      label={label ?? messages.resize}
      aria-controls={controls}
      className={classNames('env-split-pane-handle', className)}
      onDoubleClick={(event) => {
        onDoubleClick?.(event);
        if (!event.defaultPrevented) reset();
      }}
    />
  );
}

const RootPart = /* @__PURE__ */ withDisplayName(Root, 'SplitPane.Root');
const PanePart = /* @__PURE__ */ withDisplayName(Pane, 'SplitPane.Pane');
const ResizeHandlePart = /* @__PURE__ */ withDisplayName(ResizeHandle, 'SplitPane.ResizeHandle');
export { RootPart as Root, PanePart as Pane, ResizeHandlePart as ResizeHandle };
