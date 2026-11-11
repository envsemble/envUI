'use client';

import { useCallback, useLayoutEffect, useRef, useState, type RefObject } from 'react';

/**
 * The 3D view's hovered planes, marked on the planes directly, so hovering renders none of them:
 * the plane under the pointer, and the node the tree's pointer rests on through `highlightRef`.
 * Returns the node under the pointer, for the hover card, and the function that sets it.
 */
export function usePlaneHover({
  scene,
  highlightRef,
}: {
  /** The element that holds the planes. */
  scene: RefObject<HTMLDivElement | null>;
  /** Set to what marks a node's plane as hovered from outside the view. */
  highlightRef: RefObject<(key: number | null) => void>;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const hoverKeys = useRef<{ pointer: number | null; tree: number | null }>({
    pointer: null,
    tree: null,
  });
  const paintHover = useCallback(() => {
    const element = scene.current;
    if (!element) return;
    const { pointer: under, tree } = hoverKeys.current;
    for (const plane of Array.from(element.querySelectorAll<HTMLElement>('[data-hovered]')))
      if (Number(plane.dataset.plane) !== under && Number(plane.dataset.plane) !== tree)
        delete plane.dataset.hovered;
    for (const key of [under, tree])
      if (key !== null) {
        const plane = element.querySelector<HTMLElement>(`[data-plane="${key}"]`);
        if (plane) plane.dataset.hovered = '';
      }
  }, [scene]);
  useLayoutEffect(() => {
    highlightRef.current = (key) => {
      hoverKeys.current.tree = key;
      paintHover();
    };
  }, [highlightRef, paintHover]);
  // Planes that mount afresh, such as after Only the selected, take the mark too.
  useLayoutEffect(paintHover);
  const hoveredRef = useRef(hovered);
  hoveredRef.current = hovered;
  const hover = (key: number | null) => {
    if (key === hoveredRef.current) return;
    hoverKeys.current.pointer = key;
    paintHover();
    setHovered(key);
  };
  return { hovered, hoveredRef, hover };
}
