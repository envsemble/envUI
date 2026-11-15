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
import { tooltipDelay } from '../../internal/popup/TooltipPopup.js';
import { flag } from '../../internal/flag.js';

const focusTipPointerSlackPixels = 4;

function dayCellFrom(target: EventTarget | null) {
  return target instanceof Element ? target.closest<HTMLElement>('td[data-day]') : null;
}

export function useHeatmapTooltip(
  grid: RefObject<HTMLTableElement | null>,
  onFocusDay: (day: number) => void,
) {
  const [tip, setTip] = useState<{
    day: number;
    anchor: HTMLElement;
    open: boolean;
    openedByFocus: boolean;
    offset: number;
  } | null>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const popup = useRef<HTMLDivElement>(null);
  const focusFromMousePress = useRef(false);
  useEffect(() => () => clearTimeout(hoverTimer.current), []);

  function show(cell: HTMLElement, openedByFocus = false) {
    clearTimeout(hoverTimer.current);
    const table = grid.current;
    const gapBetweenDays = table
      ? Number.parseFloat(getComputedStyle(table).borderSpacing) || 0
      : 0;
    const onePixelIntoTheGap = Math.max(0, gapBetweenDays - 1);
    setTip({
      day: Number(cell.dataset.day),
      anchor: cell,
      open: true,
      openedByFocus,
      offset: onePixelIntoTheGap,
    });
  }

  function movedOntoTooltip(target: EventTarget | null) {
    return target instanceof Node && Boolean(popup.current?.contains(target));
  }

  function hide() {
    clearTimeout(hoverTimer.current);
    setTip((current) => current && { ...current, open: false });
  }

  const focusTipOpen = Boolean(tip?.open && tip.openedByFocus);
  useEffect(
    function closeFocusTipWhenPointerLeavesDays() {
      if (!focusTipOpen) return;
      const document = grid.current?.ownerDocument;
      let origin: { x: number; y: number } | undefined;
      const move = (event: globalThis.PointerEvent) => {
        if (event.pointerType !== 'mouse' || grid.current?.contains(event.target as Node)) return;
        origin ??= { x: event.clientX, y: event.clientY };
        const distance = Math.hypot(event.clientX - origin.x, event.clientY - origin.y);
        if (distance > focusTipPointerSlackPixels) hide();
      };
      document?.addEventListener('pointermove', move);
      return () => document?.removeEventListener('pointermove', move);
    },
    [focusTipOpen, grid],
  );

  const tipOpen = Boolean(tip?.open);
  useEffect(
    function escapeHidesTipOnly() {
      if (!tipOpen) return;
      const view = grid.current?.ownerDocument.defaultView;
      const escape = (event: globalThis.KeyboardEvent) => {
        if (event.key !== 'Escape' || event.defaultPrevented || event.isComposing) return;
        if (modifiedEscapeBelongsElsewhere(event)) return;
        event.preventDefault();
        event.stopPropagation();
        hide();
      };
      view?.addEventListener('keydown', escape, true);
      return () => view?.removeEventListener('keydown', escape, true);
    },
    [tipOpen, grid],
  );

  useEffect(() => {
    const page = grid.current?.ownerDocument;
    const releasedAnywhereOrCancelled = () => {
      focusFromMousePress.current = false;
    };
    page?.addEventListener('pointerup', releasedAnywhereOrCancelled, true);
    page?.addEventListener('pointercancel', releasedAnywhereOrCancelled, true);
    return () => {
      page?.removeEventListener('pointerup', releasedAnywhereOrCancelled, true);
      page?.removeEventListener('pointercancel', releasedAnywhereOrCancelled, true);
    };
  }, [grid]);

  const gridHandlers = {
    onPointerOver(event: PointerEvent<HTMLTableElement>) {
      if (event.pointerType === 'touch') return;
      const cell = dayCellFrom(event.target);
      if (!cell) return;
      clearTimeout(hoverTimer.current);
      if (tip?.open) show(cell);
      else hoverTimer.current = setTimeout(() => show(cell), tooltipDelay);
    },
    onPointerDown(event: PointerEvent<HTMLTableElement>) {
      focusFromMousePress.current = event.pointerType === 'mouse';
    },
    onPointerLeave(event: PointerEvent<HTMLTableElement>) {
      if (!movedOntoTooltip(event.relatedTarget)) hide();
    },
    onFocus(event: FocusEvent<HTMLTableElement>) {
      const cell = dayCellFrom(event.target);
      const likeHover = focusFromMousePress.current;
      focusFromMousePress.current = false;
      if (!cell) return;
      onFocusDay(Number(cell.dataset.day));
      show(cell, !likeHover);
    },
    onBlur(event: FocusEvent<HTMLTableElement>) {
      if (grid.current?.contains(event.relatedTarget)) return;
      const pointerRestsOnDaysOrTooltip =
        grid.current?.matches(':hover') || popup.current?.matches(':hover');
      if (!pointerRestsOnDaysOrTooltip) hide();
    },
  };

  const onOpenChange: BaseTooltip.Root.Props['onOpenChange'] = (open, details) => {
    const key = details.reason === 'escape-key' ? details.event : undefined;
    if (key && modifiedEscapeBelongsElsewhere(key)) {
      details.cancel();
      details.allowPropagation();
      return;
    }
    const pressOnADayMovesTheTip = details.event && dayCellFrom(details.event.target);
    if (open || pressOnADayMovesTheTip) return;
    hide();
  };

  const popupProps = {
    ref: popup,
    'data-focus-opened': flag(tip?.openedByFocus),
    onPointerLeave: (event: PointerEvent<HTMLDivElement>) => {
      const target = event.relatedTarget;
      const backOnTheDays = target instanceof Node && grid.current?.contains(target);
      if (!backOnTheDays) hide();
    },
  };

  return { tip, gridHandlers, onOpenChange, popupProps };
}

function modifiedEscapeBelongsElsewhere(escape: {
  ctrlKey: boolean;
  altKey: boolean;
  metaKey: boolean;
}) {
  return escape.ctrlKey || escape.altKey || escape.metaKey;
}
