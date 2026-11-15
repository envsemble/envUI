import { useLayoutEffect, type RefObject } from 'react';
import { pixelTolerance, remeasure, type Change } from '../../shared/Remeasure';

export function useVerdictFit(
  stage: RefObject<HTMLElement | null>,
  box: RefObject<HTMLElement | null>,
  { on, shape }: { on: boolean; shape: 'square' | 'fit' },
) {
  useLayoutEffect(() => {
    const stageElement = stage.current;
    const boxElement = box.current;
    if (!on || !stageElement || !boxElement || typeof ResizeObserver === 'undefined') return;
    let stageWidth = 0;
    let boxWidth = 0;
    const fit = shape === 'fit';
    const set = (next: number) => {
      boxWidth = next;
      boxElement.style.inlineSize = `${next}px`;
      if (fit) boxElement.style.marginInlineEnd = `${stageWidth - next}px`;
      else boxElement.style.minBlockSize = `${next}px`;
      boxElement.style.setProperty('--site-verdict-scale', String(stageWidth / next));
    };
    const settle = () => {
      if (fit)
        boxElement.style.marginBlockEnd = `${boxElement.offsetHeight * (stageWidth / boxWidth - 1)}px`;
    };
    const measure = (changed: ReadonlySet<Change>) => {
      if (changed.has('mutation')) for (const child of boxElement.children) fits.observe(child);
      const width = stageElement.clientWidth;
      if (!width) return;
      if (Math.abs(width - stageWidth) > pixelTolerance) {
        stageWidth = width;
        set(width);
        settle();
        return;
      }
      const style = getComputedStyle(boxElement);
      const padding = parseFloat(style.paddingLeft) + parseFloat(style.paddingRight);
      const widest = Math.max(
        0,
        ...[...boxElement.children].map((child) =>
          child instanceof HTMLElement ? Math.max(child.offsetWidth, child.scrollWidth) : 0,
        ),
      );
      const tall = boxElement.offsetHeight;
      const wide = Math.max(widest + padding, boxElement.scrollWidth);
      const needed = Math.ceil(fit ? wide : Math.max(tall, wide));
      if (needed > boxWidth + pixelTolerance) set(needed);
      settle();
    };
    const fits = remeasure(measure, {
      first: 'now',
      resize: [stageElement, boxElement, ...boxElement.children],
      mutation: { target: boxElement, options: { childList: true } },
      fonts: true,
    });
    return () => {
      fits.stop();
      boxElement.style.inlineSize = '';
      boxElement.style.minBlockSize = '';
      boxElement.style.marginInlineEnd = '';
      boxElement.style.marginBlockEnd = '';
      boxElement.style.removeProperty('--site-verdict-scale');
    };
  }, [stage, box, on, shape]);
}
