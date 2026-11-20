'use client';

import { useEffect } from 'react';
import type { ScaffoldProps } from '../../Scaffold.js';
import '../../../styles/Base.css';
import '../../../styles/Scaffold.css';

export function useBarSizes(
  root: HTMLDivElement | null,
  scroll: NonNullable<ScaffoldProps['scroll']>,
  {
    hasTopBar,
    hasBar,
    hasBottomBar,
  }: { hasTopBar: boolean; hasBar: boolean; hasBottomBar: boolean },
) {
  useEffect(
    function publishBarSizesCssCannotKnow() {
      if (!root || (!hasTopBar && !hasBar && !hasBottomBar)) return;
      const html = root.ownerDocument.documentElement;
      const topBarRegion = root.querySelector<HTMLElement>(':scope > .env-scaffold-top-bar');
      const barSlot = root.querySelector<HTMLElement>(
        ':scope > .env-scaffold-navigation > .env-scaffold-bar',
      );
      const bottomBarRegion = root.querySelector<HTMLElement>(':scope > .env-scaffold-bottom-bar');
      const publish = () => {
        const top = topBarRegion?.offsetHeight ?? 0;
        const bar = barSlot?.offsetHeight ?? 0;
        root.style.setProperty('--_scaffold-top-bar-size', `${top}px`);
        root.style.setProperty('--_scaffold-bar-size', `${bar}px`);
        root.style.setProperty(
          '--_scaffold-bottom-size',
          `${bar + (bottomBarRegion?.offsetHeight ?? 0)}px`,
        );
        const documentScrollPaddingKeepsFocusClearOfBars = scroll === 'document';
        if (!documentScrollPaddingKeepsFocusClearOfBars) return;
        html.style.setProperty('--_scaffold-scroll-top', `${top}px`);
        html.style.setProperty(
          '--_scaffold-scroll-bottom',
          `${bar + (bottomBarRegion?.offsetHeight ?? 0)}px`,
        );
      };
      publish();
      const observer = new ResizeObserver(publish);
      for (const region of [topBarRegion, barSlot, bottomBarRegion])
        if (region) observer.observe(region);
      return () => {
        observer.disconnect();
        root.style.removeProperty('--_scaffold-top-bar-size');
        root.style.removeProperty('--_scaffold-bar-size');
        root.style.removeProperty('--_scaffold-bottom-size');
        html.style.removeProperty('--_scaffold-scroll-top');
        html.style.removeProperty('--_scaffold-scroll-bottom');
      };
    },
    [root, scroll, hasTopBar, hasBar, hasBottomBar],
  );
}
