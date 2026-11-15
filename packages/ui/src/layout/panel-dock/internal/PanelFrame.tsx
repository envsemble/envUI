'use client';

import {
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type FocusEvent,
  type ReactNode,
} from 'react';
import { useResize } from '../../../internal/resize/useResize.js';
import { Column } from '../../Layout.js';
import { PanelDockPanelContext, type PanelDockPanelContextValue } from './PanelDockPanelContext.js';
import { pixels, rems, type HeightBounds, type Placement } from './dockLayout.js';
import type { PanelDockMode, PanelDockPanel } from '../panelDockTypes.js';
import { useEntrance } from './useEntrance.js';
import { flag } from '../../../internal/flag.js';
import '../../../styles/Base.css';
import '../../../styles/PanelDock.css';

const arrowKeyResizeStepPx = 16;
const largeResizeStepPx = 64;

const shareOfDockRoomPercent = (height: number, room: number) => Math.round((height / room) * 100);

interface PanelFrameProps {
  panel: PanelDockPanel;
  placement: Placement;
  stackedPlacement: Placement | undefined;
  stacked: boolean;
  height: number | undefined;
  bounds: HeightBounds | undefined;
  content: ReactNode;
  resizeLabel: string;
  changeMode: (id: string, mode: PanelDockMode) => void;
  close: (id: string) => void;
  onActivate: () => void;
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
  const [dragPreviewHeight, setDragPreviewHeight] = useState<number>();
  const [stickyHeaderSize, setStickyHeaderSize] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const shownHeight = dragPreviewHeight ?? height;
  const layoutRead = stackedPlacement === undefined;
  const placementWithEntrance = layoutRead ? placement : undefined;
  useEntrance(frame, placementWithEntrance, placement !== 'hidden');
  const hiddenInEitherLayout =
    placement === 'hidden' && (stackedPlacement ?? 'hidden') === 'hidden';
  const context = useMemo<PanelDockPanelContextValue>(
    () => ({
      mode,
      stacked,
      changeMode: (next) => changeMode(id, next),
      close: () => close(id),
      reportHeaderSize: setStickyHeaderSize,
      scrolled,
    }),
    [id, mode, stacked, changeMode, close, scrolled],
  );

  const resizable = placement === 'row' && bounds !== undefined;
  useLayoutEffect(() => {
    if (!resizable) setDragPreviewHeight(undefined);
  }, [resizable]);
  const growsAsTopEdgeMovesUp = true;
  const { handleProps } = useResize({
    axis: 'block',
    reverse: growsAsTopEdgeMovesUp,
    value: shownHeight ?? 0,
    min: bounds?.min ?? 0,
    max: bounds?.max ?? 0,
    step: arrowKeyResizeStepPx,
    largeStep: largeResizeStepPx,
    disabled: !resizable,
    valueText:
      bounds && bounds.room > 0
        ? (value) => `${shareOfDockRoomPercent(value, bounds.room)}%`
        : undefined,
    onChange: (value, { committed }) => {
      const next = Math.round(value);
      if (!committed) {
        setDragPreviewHeight(next);
        return;
      }
      setDragPreviewHeight(undefined);
      const cancelledDragEndsWhereItBegan = next === height;
      if (!cancelledDragEndsWhereItBegan) onResize(next);
    },
  });

  function noteFocus(event: FocusEvent<HTMLElement>) {
    const target = event.target;
    const restorableInContent =
      target instanceof HTMLElement &&
      target.parentElement?.closest('.env-panel-dock-content') &&
      !target.closest('.env-panel-dock-controls');
    if (restorableInContent) onFocusContent(target);
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
          inert={hiddenInEitherLayout}
          data-panel-id={id}
          data-mode={mode}
          data-placement={placement}
          data-env-ssr-placement={stackedPlacement}
          data-active={flag(panel.active)}
          data-resizing={flag(dragPreviewHeight !== undefined)}
          style={{
            '--_panel-dock-panel-width': rems(panel.preferredWidth),
            '--_panel-dock-panel-min-width': rems(panel.minWidth),
            '--_panel-dock-panel-max-width': rems(panel.maxWidth),
            '--_panel-dock-panel-height': pixels(shownHeight),
          }}
          onPointerDownCapture={onActivate}
          onFocus={noteFocus}
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
      <div
        className="env-panel-dock-content"
        tabIndex={-1}
        onScroll={(event) => setScrolled(event.currentTarget.scrollTop > 0)}
        style={
          stickyHeaderSize > 0
            ? { '--_panel-dock-header-size': `${stickyHeaderSize}px` }
            : undefined
        }
      >
        <PanelDockPanelContext value={context}>{content}</PanelDockPanelContext>
      </div>
    </Column>
  );
}
