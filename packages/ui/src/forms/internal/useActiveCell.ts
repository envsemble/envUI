'use client';

import { useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react';
import { isRightToLeft } from '../../internal/dom/direction.js';

export function useActiveCell({
  chosen,
  initial,
  clamp,
  isUnavailable,
  onChoose,
  moves,
}: {
  chosen: number | undefined;
  initial: () => number;
  clamp: (cell: number) => number;
  isUnavailable: (cell: number) => boolean;
  onChoose: (cell: number) => void;
  moves: (
    active: number,
    event: KeyboardEvent<HTMLElement>,
    rtl: boolean,
  ) => Record<string, number>;
}) {
  const grid = useRef<HTMLTableElement>(null);
  const focusActiveAfterRender = useRef(false);
  const [activeState, setActiveState] = useState(() => chosen ?? initial());
  const [trackedChosen, setTrackedChosen] = useState(chosen);
  if (trackedChosen !== chosen) {
    setTrackedChosen(chosen);
    if (chosen !== undefined) setActiveState(chosen);
  }
  const active = clamp(activeState);

  useLayoutEffect(() => {
    if (!focusActiveAfterRender.current) return;
    focusActiveAfterRender.current = false;
    grid.current?.querySelector<HTMLElement>('td[tabindex="0"]')?.focus();
  });

  function moveTo(cell: number, focus: boolean) {
    const next = clamp(cell);
    const alreadyActive = next === active;
    if (alreadyActive) return;
    focusActiveAfterRender.current = focus;
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
    focusCell: (cell: number) => {
      if (cell !== active) setActiveState(cell);
    },
  };
}
