'use client';

import { useLayoutEffect, useMemo, useRef, useState } from 'react';
import type { TreeItem } from '../Tree.js';
import { treeMotion, type TreeMotion } from './treeRows.js';

/** No rows arriving. */
const noValues: ReadonlySet<string> = new Set();

/**
 * The rows that arrive with new items fade in from their starting style; the first rows, and rows
 * that only scroll into view, show at once. Where a row expands or collapses, its rows instead grow
 * or shrink as one group, as an accordion's panel does, kept until the group has closed. The same
 * rows passed again, as a new list, keep the change that is playing. Give `rowsElement` to the
 * element that holds the rows.
 */
export function useTreeTransitions<Item extends TreeItem>(items: readonly Item[]) {
  const rowsElement = useRef<HTMLDivElement>(null);
  const shownItems = useRef<readonly Item[] | null>(null);
  const lastChange = useRef<{ arriving: ReadonlySet<string>; motion: TreeMotion<Item> | null }>({
    arriving: noValues,
    motion: null,
  });
  const { arriving, motion } = useMemo(() => {
    const before = shownItems.current;
    if (!before) return lastChange.current;
    const same =
      before.length === items.length &&
      before.every((item, index) => item.value === items[index]!.value);
    if (same) return lastChange.current;
    const motion = treeMotion(before, items);
    if (motion) return { arriving: noValues, motion };
    const values = new Set(before.map((item) => item.value));
    return {
      arriving: new Set(items.filter((item) => !values.has(item.value)).map((item) => item.value)),
      motion: null,
    };
  }, [items]);
  useLayoutEffect(() => {
    lastChange.current = { arriving, motion };
  }, [arriving, motion]);
  useLayoutEffect(() => {
    shownItems.current = items;
  }, [items]);
  useLayoutEffect(function arrive() {
    const rows = rowsElement.current?.querySelectorAll('.env-tree-item[data-starting-style]');
    if (!rows?.length) return;
    void getComputedStyle(rows[0]!).opacity;
    for (const row of rows) row.removeAttribute('data-starting-style');
  });

  // A motion renders first from where the rows were, then moves to where they go, and ends once its
  // transitions have finished: at once under a reduced-motion preference.
  const [movingMotion, setMovingMotion] = useState<TreeMotion<Item> | null>(null);
  const [settledMotion, setSettledMotion] = useState<TreeMotion<Item> | null>(null);
  const activeMotion = motion && motion !== settledMotion ? motion : null;
  const moving = activeMotion !== null && activeMotion === movingMotion;
  useLayoutEffect(() => {
    const element = rowsElement.current;
    if (!activeMotion || !element) return;
    // Reading the style makes the browser take the starting positions before they change.
    void getComputedStyle(element).getPropertyValue('--env-tree-shift');
    if (!moving) {
      setMovingMotion(activeMotion);
      return;
    }
    const group = element.querySelector('.env-tree-group');
    const transitions = [...element.getAnimations(), ...(group?.getAnimations() ?? [])];
    let current = true;
    const settle = () => {
      if (current) setSettledMotion(activeMotion);
    };
    void Promise.all(transitions.map((transition) => transition.finished)).then(settle, settle);
    return () => {
      current = false;
    };
  }, [activeMotion, moving]);

  return {
    rowsElement,
    /** The values of the rows arriving with these items. */
    arriving,
    /** The expansion or collapse playing, if any. */
    motion: activeMotion,
    /** Whether the motion moves the rows to where they go, after a render where they were. */
    moving,
  };
}
