import { useLayoutEffect, type RefObject } from 'react';
import { pixelTolerance, remeasure, type Change } from '../../shared/Remeasure';

/**
 * Draws a do or don't figure's example smaller where needed so it fits its stage, the way a tile
 * fits its example into its window.
 *
 * `square` stage: the example lays out in a square box, at first the stage's size. When it needs
 * more space (taller or wider), the box grows to what it needs and is drawn at the scale that
 * brings it back to the stage's size (`--site-verdict-scale`), so nothing is cut off. A wider box
 * lets the example lay out wider, so it gets no taller. The box only grows: an animated figure
 * that grows for a moment while playing keeps the scale it reached, rather than resizing on every
 * loop. When the stage's width changes, it starts again from the stage's size.
 *
 * The box covers the whole stage, so a dialog's backdrop covers the stage. Because the box has a
 * transform, it is the containing block for what opens in it.
 *
 * `fit` stage (an example shown open or playing outside a figure): as tall as the example rather
 * than square. The box lays out as wide as the stage, wider only where a part cannot be narrower,
 * and is drawn smaller to the stage's width. Negative margins give back the space the transform
 * leaves, so the box takes only its drawn size.
 */
export function useVerdictFit(
  stage: RefObject<HTMLElement | null>,
  box: RefObject<HTMLElement | null>,
  { on, shape }: { on: boolean; shape: 'square' | 'fit' },
) {
  useLayoutEffect(() => {
    const stageElement = stage.current;
    const boxElement = box.current;
    if (!on || !stageElement || !boxElement || typeof ResizeObserver === 'undefined') return;
    // `side`: the stage's width. `room`: the box's width, which the example lays out in before
    // it is drawn smaller.
    let side = 0;
    let room = 0;
    const fit = shape === 'fit';
    const set = (next: number) => {
      room = next;
      boxElement.style.inlineSize = `${next}px`;
      if (fit) boxElement.style.marginInlineEnd = `${side - next}px`;
      else boxElement.style.minBlockSize = `${next}px`;
      boxElement.style.setProperty('--site-verdict-scale', String(side / next));
    };
    // For a `fit` stage, a negative bottom margin gives back the height the scale removes.
    const settle = () => {
      if (fit) boxElement.style.marginBlockEnd = `${boxElement.offsetHeight * (side / room - 1)}px`;
    };
    const measure = (changed: ReadonlySet<Change>) => {
      // Observe children that render later, such as an example whose module loads.
      if (changed.has('mutation')) for (const child of boxElement.children) fits.observe(child);
      const width = stageElement.clientWidth;
      if (!width) return;
      if (Math.abs(width - side) > pixelTolerance) {
        side = width;
        set(width);
        settle();
        return;
      }
      // What the example needs: the box's height (the box grows to fit its content), and its
      // widest child plus the box's padding, for a part wider than the space inside the padding,
      // such as a button that cannot wrap.
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
      if (needed > room + pixelTolerance) set(needed);
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
