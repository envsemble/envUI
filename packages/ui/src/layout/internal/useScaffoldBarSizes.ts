'use client';

import { useEffect } from 'react';
import type { ScaffoldProps } from '../Scaffold.js';
import '../../styles/Base.css';
import '../../styles/Scaffold.css';

/**
 * The bars' heights, which CSS can't know where a top bar wraps or is a window's title bar, or
 * whatever a bar's labels take: the top bar's for what sticks under it, and, where the document
 * scrolls, both as the document's scroll padding, so what scrolls into view, such as an element
 * taking focus, keeps clear of the bars (WCAG 2.4.11). A bar that hides measures 0. Until script
 * runs, Scaffold.css estimates them.
 */
export function useScaffoldBarSizes(
  root: HTMLDivElement | null,
  scroll: NonNullable<ScaffoldProps['scroll']>,
  hasTopBar: boolean,
  hasBar: boolean,
) {
  useEffect(() => {
    if (!root || (!hasTopBar && !hasBar)) return;
    const html = root.ownerDocument.documentElement;
    const topBarRegion = root.querySelector<HTMLElement>(':scope > .env-scaffold-top-bar');
    const barSlot = root.querySelector<HTMLElement>(
      ':scope > .env-scaffold-navigation > .env-scaffold-bar',
    );
    const publish = () => {
      const top = topBarRegion?.offsetHeight ?? 0;
      root.style.setProperty('--env-scaffold-top-bar-size', `${top}px`);
      if (scroll !== 'document') return;
      html.style.setProperty('--env-scaffold-scroll-top', `${top}px`);
      html.style.setProperty('--env-scaffold-scroll-bottom', `${barSlot?.offsetHeight ?? 0}px`);
    };
    publish();
    const observer = new ResizeObserver(publish);
    for (const region of [topBarRegion, barSlot]) if (region) observer.observe(region);
    return () => {
      observer.disconnect();
      root.style.removeProperty('--env-scaffold-top-bar-size');
      html.style.removeProperty('--env-scaffold-scroll-top');
      html.style.removeProperty('--env-scaffold-scroll-bottom');
    };
  }, [root, scroll, hasTopBar, hasBar]);
}
