'use client';

import {
  useEffect,
  useRef,
  useState,
  type FocusEvent,
  type PointerEvent,
  type RefObject,
} from 'react';
import type { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import { tooltipDelay } from '../../internal/TooltipPopup.js';
import { flag } from '../../internal/flag.js';

/** How far, in px, the pointer moves away from the days before a tooltip focus opened closes. */
const focusTipSlack = 4;

/** The day cell an event's target is in, if any. */
function cellFrom(target: EventTarget | null) {
  return target instanceof Element ? target.closest<HTMLElement>('td[data-day]') : null;
}

/**
 * CalendarHeatmap's one tooltip, which serves every day: it follows the hovered or focused day and
 * leaves no portal at rest. A closing tooltip keeps its day and anchor while it fades. `onFocusDay`
 * receives the day focus moves to. Returns the tooltip, the grid's and the popup's handlers.
 */
export function useHeatmapTooltip(
  grid: RefObject<HTMLTableElement | null>,
  onFocusDay: (day: number) => void,
) {
  const [tip, setTip] = useState<{
    day: number;
    anchor: HTMLElement;
    open: boolean;
    /** Shown for the focused day rather than the hovered one. */
    focused: boolean;
    /** The gap between days, which the tooltip keeps from its day. */
    offset: number;
  } | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const popup = useRef<HTMLDivElement>(null);
  // A mouse press focuses its day as a hover would, so that tooltip takes the pointer too; keyboard
  // focus and taps open one that takes none.
  const mousePress = useRef(false);
  useEffect(() => () => clearTimeout(hoverTimer.current), []);

  function show(cell: HTMLElement, focused = false) {
    clearTimeout(hoverTimer.current);
    // The tooltip meets its day across the gap between days, so the pointer reaches it from the
    // day without crossing another day. It reaches a pixel into the gap, so rounding its position
    // never leaves a sliver of the next day showing.
    const table = grid.current;
    const gap = table ? Number.parseFloat(getComputedStyle(table).borderSpacing) || 0 : 0;
    const offset = Math.max(0, gap - 1);
    setTip({ day: Number(cell.dataset.day), anchor: cell, open: true, focused, offset });
  }

  /** Whether the pointer moved onto the tooltip, which keeps it open on its day. */
  function intoTooltip(target: EventTarget | null) {
    return target instanceof Node && Boolean(popup.current?.contains(target));
  }

  function hide() {
    clearTimeout(hoverTimer.current);
    setTip((current) => current && { ...current, open: false });
  }

  // A tooltip opened by focus closes once the pointer moves away from the days, so it never stays
  // over what people reach for next. Moves of a few pixels, or none, as when the page scrolls under
  // a resting pointer, keep it.
  const focusTipOpen = Boolean(tip?.open && tip.focused);
  useEffect(() => {
    if (!focusTipOpen) return;
    const document = grid.current?.ownerDocument;
    let origin: { x: number; y: number } | undefined;
    const move = (event: globalThis.PointerEvent) => {
      if (event.pointerType !== 'mouse' || grid.current?.contains(event.target as Node)) return;
      origin ??= { x: event.clientX, y: event.clientY };
      if (Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > focusTipSlack) hide();
    };
    document?.addEventListener('pointermove', move);
    return () => document?.removeEventListener('pointermove', move);
  }, [focusTipOpen, grid]);

  // Escape hides an open tooltip wherever focus is, such as on a dialog's close button while the
  // pointer rests on the tooltip, and goes no further, so an enclosing dialog stays open. With Ctrl,
  // Alt or Meta it leaves the tooltip and goes on, so an enclosing dialog closes.
  const tipOpen = Boolean(tip?.open);
  useEffect(() => {
    if (!tipOpen) return;
    const view = grid.current?.ownerDocument.defaultView;
    const escape = (event: globalThis.KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented || event.isComposing) return;
      // Escape with a modifier belongs to whatever handles it.
      if (event.ctrlKey || event.altKey || event.metaKey) return;
      event.preventDefault();
      event.stopPropagation();
      hide();
    };
    view?.addEventListener('keydown', escape, true);
    return () => view?.removeEventListener('keydown', escape, true);
  }, [tipOpen, grid]);

  // A press ends wherever its pointer is released, also outside the grid, or when it is cancelled.
  useEffect(() => {
    const page = grid.current?.ownerDocument;
    const release = () => {
      mousePress.current = false;
    };
    page?.addEventListener('pointerup', release, true);
    page?.addEventListener('pointercancel', release, true);
    return () => {
      page?.removeEventListener('pointerup', release, true);
      page?.removeEventListener('pointercancel', release, true);
    };
  }, [grid]);

  const gridHandlers = {
    onPointerOver(event: PointerEvent<HTMLTableElement>) {
      if (event.pointerType === 'touch') return;
      const cell = cellFrom(event.target);
      if (!cell) return;
      clearTimeout(hoverTimer.current);
      if (tip?.open) show(cell);
      else hoverTimer.current = setTimeout(() => show(cell), tooltipDelay);
    },
    onPointerDown(event: PointerEvent<HTMLTableElement>) {
      mousePress.current = event.pointerType === 'mouse';
    },
    onPointerLeave(event: PointerEvent<HTMLTableElement>) {
      if (!intoTooltip(event.relatedTarget)) hide();
    },
    onFocus(event: FocusEvent<HTMLTableElement>) {
      // A tap focuses its day too, so touch shows the value on tap.
      const cell = cellFrom(event.target);
      const byMouse = mousePress.current;
      mousePress.current = false;
      if (!cell) return;
      onFocusDay(Number(cell.dataset.day));
      show(cell, !byMouse);
    },
    onBlur(event: FocusEvent<HTMLTableElement>) {
      if (grid.current?.contains(event.relatedTarget)) return;
      // A tooltip the pointer rests on stays, on the days or on the tooltip itself.
      if (!grid.current?.matches(':hover') && !popup.current?.matches(':hover')) hide();
    },
  };

  const onOpenChange: BaseTooltip.Root.Props['onOpenChange'] = (open, details) => {
    // Escape with a modifier belongs to whatever handles it.
    const key = details.reason === 'escape-key' ? details.event : undefined;
    if (key && (key.ctrlKey || key.altKey || key.metaKey)) {
      details.cancel();
      details.allowPropagation();
      return;
    }
    // Presses on the days move the tooltip rather than closing it.
    if (open || (details.event && cellFrom(details.event.target))) return;
    hide();
  };

  const popupProps = {
    ref: popup,
    'data-focus-opened': flag(tip?.focused),
    onPointerLeave: (event: PointerEvent<HTMLDivElement>) => {
      // Back on the days, the day under the pointer takes the tooltip.
      if (!grid.current?.contains(event.relatedTarget as Node | null)) hide();
    },
  };

  return { tip, gridHandlers, onOpenChange, popupProps };
}
