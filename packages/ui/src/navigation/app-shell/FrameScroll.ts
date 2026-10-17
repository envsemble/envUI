'use client';

import { createContext } from 'react';

/** What a frame, AppShell.Root or WindowFrame.Root, tells the content inside it. */
export interface AppShellContextValue {
  /**
   * The element that scrolls the page content: AppShell.Main or WindowFrame.Content where a region
   * scrolls under the bar, else the scrolling element of the frame's document. Read or restore
   * scroll positions on it. It is null until that region is attached; the function changes once
   * it is, so effects that depend on it run again, and every copy of it returns the current
   * element, including one kept from an earlier render.
   */
  getScrollElement: () => HTMLElement | null;
  /**
   * Where sticky content sticks, in pixels: the current --env-frame-sticky-top, the header's size
   * while the document scrolls and 0 where a region scrolls under the bar. Read it to scroll an
   * element into view below the header.
   */
  getStickyTop: () => number;
  /** document: the document scrolls under a sticky header. main: a region scrolls under it. */
  scroll: 'document' | 'main';
}

export const AppShellContext = createContext<AppShellContextValue | null>(null);

/**
 * The resolved length of a frame variable at an element, in pixels: custom properties compute to
 * their text, such as calc(3.25rem + 1px), so a probe lays it out.
 */
export function readFrameLength(element: HTMLElement | null, property: string): number {
  if (!element) return 0;
  const probe = element.ownerDocument.createElement('div');
  probe.style.cssText = `position:absolute;visibility:hidden;pointer-events:none;inset-block-start:0;inline-size:0;block-size:var(${property}, 0px)`;
  element.append(probe);
  // The used size, with its fractions, and unaffected by a scaled ancestor.
  const size = parseFloat(getComputedStyle(probe).blockSize) || 0;
  probe.remove();
  return size;
}
