'use client';

import { useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { isRightToLeft } from '../../internal/dom/direction.js';

/**
 * The active cell of a grid of dates to choose one from, such as Calendar's days or MonthPicker's
 * months, numbered in order: the grid's one tab stop, which follows the chosen cell when that
 * changes and stays within the bounds. The arrow keys and the others in `moves` move it, and Enter
 * or Space chooses it; a key that moves it takes focus with it.
 */
export function useActiveCell({
  chosen,
  initial,
  clamp,
  isUnavailable,
  onChoose,
  moves,
}: {
  /** The chosen cell, if any. */
  chosen: number | undefined;
  /** The active cell while none is chosen, such as today's. */
  initial: () => number;
  /** Keeps a cell within the grid's bounds. */
  clamp: (cell: number) => number;
  /** Whether a cell is out of bounds, which can't be chosen. */
  isUnavailable: (cell: number) => boolean;
  /** Takes a cell people chose. */
  onChoose: (cell: number) => void;
  /** Where each key takes the active cell, with the arrow keys following the text direction. */
  moves: (
    active: number,
    event: KeyboardEvent<HTMLElement>,
    rtl: boolean,
  ) => Record<string, number>;
}) {
  const grid = useRef<HTMLTableElement>(null);
  const focusActive = useRef(false);
  const [activeState, setActiveState] = useState(() => chosen ?? initial());
  const [trackedChosen, setTrackedChosen] = useState(chosen);
  if (trackedChosen !== chosen) {
    setTrackedChosen(chosen);
    if (chosen !== undefined) setActiveState(chosen);
  }
  const active = clamp(activeState);

  useLayoutEffect(() => {
    if (!focusActive.current) return;
    focusActive.current = false;
    grid.current?.querySelector<HTMLElement>('td[tabindex="0"]')?.focus();
  });

  function moveTo(cell: number, focus: boolean) {
    const next = clamp(cell);
    // A key that keeps the cell, such as Home on the row's first, has nothing to render, so it
    // leaves no request behind that would take focus back at some later render.
    if (next === active) return;
    focusActive.current = focus;
    setActiveState(next);
  }

  function choose(cell: number) {
    if (isUnavailable(cell)) return;
    setActiveState(cell);
    onChoose(cell);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTableElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      choose(active);
      return;
    }
    const next = moves(active, event, isRightToLeft(event.currentTarget))[event.key];
    if (next === undefined) return;
    event.preventDefault();
    moveTo(next, true);
  }

  return {
    active,
    grid,
    moveTo,
    choose,
    handleKeyDown,
    /** Makes a cell that takes focus, such as by a click, the active one. */
    focusCell: (cell: number) => {
      if (cell !== active) setActiveState(cell);
    },
  };
}
