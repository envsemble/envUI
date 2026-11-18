'use client';

import { useCallback, useLayoutEffect, useRef, useState, type RefObject } from 'react';

export function usePlaneHover({
  scene,
  markPlaneHoveredRef,
}: {
  scene: RefObject<HTMLDivElement | null>;
  markPlaneHoveredRef: RefObject<(key: number | null) => void>;
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
    markPlaneHoveredRef.current = (key) => {
      hoverKeys.current.tree = key;
      paintHover();
    };
  }, [markPlaneHoveredRef, paintHover]);
  const markPlanesThatMountAfresh = paintHover;
  useLayoutEffect(markPlanesThatMountAfresh);
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
