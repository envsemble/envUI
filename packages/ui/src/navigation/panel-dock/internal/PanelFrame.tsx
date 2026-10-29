'use client';

import {
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type FocusEvent,
  type ReactNode,
} from 'react';
import { useResize } from '../../../internal/useResize.js';
import { Column } from '../../../foundations/Layout.js';
import {
  PanelDockPanelContext,
  type PanelDockMode,
  type PanelDockPanelContextValue,
} from './PanelDockPanelContext.js';
import { pixels, type HeightBounds, type Placement } from './dockLayout.js';
import type { PanelDockPanel } from '../Root.js';
import { useEntrance } from './useEntrance.js';
import { flag } from '../../../internal/flag.js';
import '../../../styles/Base.css';
import '../../../styles/PanelDock.css';

/** How far an arrow key changes a panel's height, in pixels; with Shift, or Page Up and Down. */
const resizeStep = 16;
const resizeLargeStep = 64;

interface PanelFrameProps {
  panel: PanelDockPanel;
  placement: Placement;
  /**
   * Until the dock reads its layout, the panel's placement in a stacked dock, which the dock's
   * container query shows where it is narrow.
   */
  stackedPlacement: Placement | undefined;
  stacked: boolean;
  /** The panel's height in pixels; before the dock measures itself, the requested one, if any. */
  height: number | undefined;
  /** Resize bounds in pixels; only open panels in the row are resized. */
  bounds: HeightBounds | undefined;
  content: ReactNode;
  resizeLabel: string;
  changeMode: (id: string, mode: PanelDockMode) => void;
  close: (id: string) => void;
  onActivate: () => void;
  /**
   * Called with the element that takes focus in the panel's content, including popups it opened,
   * and with null as focus leaves.
   */
  onFocusWithin: (element: EventTarget | null) => void;
  onFocusContent: (target: HTMLElement) => void;
  onResize: (height: number) => void;
}

/** One panel: a labelled region with its content, and a resize handle along its top edge. */
export function PanelFrame({
  panel,
  placement,
  stackedPlacement,
  stacked,
  height,
  bounds,
  content,
  resizeLabel,
  changeMode,
  close,
  onActivate,
  onFocusWithin,
  onFocusContent,
  onResize,
}: PanelFrameProps) {
  const { id, mode } = panel;
  const frameId = useId();
  const frame = useRef<HTMLElement>(null);
  // The height while the top edge is dragged; it is reported once the drag ends.
  const [preview, setPreview] = useState<number>();
  // The block size of a PanelDock.Header sticking to the top of the content, in pixels.
  const [headerSize, setHeaderSize] = useState(0);
  // Whether the content has scrolled from its top, where a fill then marks the header, which
  // takes it from the panel's context wherever it sits in the content.
  const [scrolled, setScrolled] = useState(false);
  const shownHeight = preview ?? height;
  // A panel whose placement the dock has not read yet is in place as CSS shows it, without an
  // entrance of its own.
  useEntrance(
    frame,
    stackedPlacement === undefined ? placement : undefined,
    placement !== 'hidden',
  );
  // Hidden from people in either layout until the dock reads which one shows; where only the
  // stacked one hides the panel, its container query already hides it from sight and from
  // assistive technology.
  const hidden = placement === 'hidden' && (stackedPlacement ?? 'hidden') === 'hidden';
  const context = useMemo<PanelDockPanelContextValue>(
    () => ({
      mode,
      stacked,
      changeMode: (next) => changeMode(id, next),
      close: () => close(id),
      reportHeaderSize: setHeaderSize,
      scrolled,
    }),
    [id, mode, stacked, changeMode, close, scrolled],
  );

  // The top edge resizes only an open panel in the row. When it goes during a drag, as when the
  // panel is maximized or the dock stacks, the drag ends there, without a new height, as a
  // cancelled one does.
  const resizable = placement === 'row' && bounds !== undefined;
  useLayoutEffect(() => {
    if (!resizable) setPreview(undefined);
  }, [resizable]);
  const { handleProps } = useResize({
    axis: 'block',
    // The panel stands on the bottom edge, so it grows as its top edge moves up.
    reverse: true,
    value: shownHeight ?? 0,
    min: bounds?.min ?? 0,
    max: bounds?.max ?? 0,
    step: resizeStep,
    largeStep: resizeLargeStep,
    disabled: !resizable,
    // Read as the share of the room in the dock.
    valueText:
      bounds && bounds.room > 0
        ? (value) => `${Math.round((value / bounds.room) * 100)}%`
        : undefined,
    onChange: (value, { committed }) => {
      const next = Math.round(value);
      if (!committed) {
        setPreview(next);
        return;
      }
      setPreview(undefined);
      // A cancelled drag ends at the height it began with, which is no change.
      if (next !== height) onResize(next);
    },
  });

  function noteFocus(event: FocusEvent<HTMLElement>) {
    const target = event.target;
    // Restoring a panel returns to an element in its content, not to the window control that
    // minimized it, nor to the content area, which a press on a control focuses in some browsers.
    if (
      target instanceof HTMLElement &&
      target.parentElement?.closest('.env-panel-dock-content') &&
      !target.closest('.env-panel-dock-controls')
    )
      onFocusContent(target);
    onFocusWithin(target);
    onActivate();
  }

  return (
    <Column
      render={
        <section
          ref={frame}
          id={frameId}
          className="env-panel-dock-panel"
          aria-label={panel.title}
          tabIndex={-1}
          inert={hidden}
          data-panel-id={id}
          data-mode={mode}
          data-placement={placement}
          data-env-ssr-placement={stackedPlacement}
          data-active={flag(panel.active)}
          data-resizing={flag(preview !== undefined)}
          style={
            {
              '--env-panel-dock-panel-width': pixels(panel.preferredWidth),
              '--env-panel-dock-panel-min-width': pixels(panel.minWidth),
              '--env-panel-dock-panel-max-width': pixels(panel.maxWidth),
              '--env-panel-dock-panel-height': pixels(shownHeight),
            } as CSSProperties
          }
          onPointerDownCapture={onActivate}
          onFocus={noteFocus}
          // Focus moving within the panel, or into a popup it opened, is followed by its focus event.
          onBlur={() => onFocusWithin(null)}
        />
      }
    >
      {resizable && shownHeight !== undefined && (
        <div
          {...handleProps}
          aria-label={resizeLabel}
          aria-controls={frameId}
          className="env-panel-dock-resize-handle"
        />
      )}
      {/* Pressing the content focuses it, so the keyboard scrolls it; it is not a tab stop of its
          own, as some browsers would make a scrolling element. */}
      <div
        className="env-panel-dock-content"
        tabIndex={-1}
        onScroll={(event) => setScrolled(event.currentTarget.scrollTop > 0)}
        style={
          headerSize > 0
            ? ({ '--env-panel-dock-header-size': `${headerSize}px` } as CSSProperties)
            : undefined
        }
      >
        <PanelDockPanelContext value={context}>{content}</PanelDockPanelContext>
      </div>
    </Column>
  );
}
