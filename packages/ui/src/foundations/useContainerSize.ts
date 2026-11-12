'use client';

import { useLayoutEffect, useState, type RefObject } from 'react';
import { pixelsOf } from '../internal/dom/lengths.js';

/** An element's size along its own writing mode, in CSS pixels. */
export interface ContainerSize {
  /** The size along the line: the width in horizontal text, the height in vertical text. */
  inlineSize: number;
  /** The size across the lines: the height in horizontal text, the width in vertical text. */
  blockSize: number;
}

export interface ContainerSizeOptions {
  /**
   * Which box to measure: content-box, inside the padding and the scrollbar, or border-box, the
   * element's whole box with its padding and border.
   * @default 'content-box'
   */
  box?: 'content-box' | 'border-box';
}

/** The element's size now, as a ResizeObserver would report it. */
function measure(element: Element, box: 'content-box' | 'border-box'): ContainerSize {
  const style = getComputedStyle(element);
  let width: number;
  let height: number;
  if (element instanceof HTMLElement) {
    if (box === 'border-box') {
      width = element.offsetWidth;
      height = element.offsetHeight;
    } else {
      width = element.clientWidth - pixelsOf(style.paddingLeft) - pixelsOf(style.paddingRight);
      height = element.clientHeight - pixelsOf(style.paddingTop) - pixelsOf(style.paddingBottom);
    }
  } else {
    const rect = element.getBoundingClientRect();
    width = rect.width;
    height = rect.height;
  }
  const vertical = !style.writingMode.startsWith('horizontal') && style.writingMode !== '';
  return vertical
    ? { inlineSize: Math.max(0, height), blockSize: Math.max(0, width) }
    : { inlineSize: Math.max(0, width), blockSize: Math.max(0, height) };
}

/** Whether an element is rendered: one with display: none, or inside one, has no box to measure. */
const rendered = (element: Element) => element.getClientRects().length > 0;

/**
 * The size of an element, kept up to date as it changes: its inline and block size in CSS pixels,
 * along its writing mode, from a ResizeObserver. It is undefined on the server and until the
 * element is measured, which happens before the browser paints it; an element that stops being
 * rendered, such as one in a hidden tab panel, keeps its last size until it shows again.
 *
 * Pass a ref object, read once the element mounts, or the element itself, such as one kept in
 * state by a callback ref. Prefer a container query (`@container`) where only styles change.
 *
 *   const panel = useRef<HTMLDivElement>(null);
 *   const size = useContainerSize(panel);
 *   const narrow = size !== undefined && size.inlineSize < 640;
 */
export function useContainerSize<T extends Element>(
  target: RefObject<T | null> | T | null,
  options: ContainerSizeOptions = {},
): ContainerSize | undefined {
  const { box = 'content-box' } = options;
  const [size, setSize] = useState<ContainerSize>();

  useLayoutEffect(() => {
    const element = target && 'current' in target ? target.current : target;
    if (!element) return;
    const update = (next: ContainerSize) =>
      setSize((previous) =>
        previous?.inlineSize === next.inlineSize && previous.blockSize === next.blockSize
          ? previous
          : next,
      );
    // Measured at once, so the first paint already has the size.
    if (rendered(element)) update(measure(element, box));
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(([entry]) => {
      if (!entry || !rendered(element)) return;
      const sizes = box === 'border-box' ? entry.borderBoxSize : entry.contentBoxSize;
      const first = sizes?.[0];
      update(
        first
          ? { inlineSize: first.inlineSize, blockSize: first.blockSize }
          : measure(element, box),
      );
    });
    observer.observe(element, { box });
    return () => observer.disconnect();
  }, [target, box]);

  return size;
}
