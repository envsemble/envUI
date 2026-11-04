import { useLayoutEffect, type RefObject } from 'react';

/**
 * Draws a do or don't figure's example smaller where it must to fit its stage, as a tile
 * fits its example into its window: the example lays out in a square box, at first as large as the
 * stage, and where it needs more room, taller or wider, the box grows to what it needs and is drawn
 * at the scale that brings it back to the stage's size, so nothing is cut off. A wider box lets
 * the example lay out wider, so it is no taller than before, and the box only grows: an animated
 * figure that grows for a moment as it plays keeps the scale it reached, rather than drawing
 * itself larger and smaller on every loop. At another stage width it measures afresh.
 *
 * The box covers the whole stage, so a dialog's backdrop covers the stage, and as it is drawn with a
 * transform, it is the containing block of what opens in it.
 *
 * A `fit` stage, which shows its example open or playing in no figure, is as tall as the example
 * rather than square: the box lays out as wide as the stage, wider only where a part can't be
 * narrower, then drawn smaller to the stage's width, and keeps the room it takes drawn so, its
 * margins taking back what the transform leaves.
 */
export function useVerdictFit(
  stage: RefObject<HTMLElement | null>,
  box: RefObject<HTMLElement | null>,
  on = true,
  shape: 'square' | 'fit' = 'square',
) {
  useLayoutEffect(() => {
    const stageElement = stage.current;
    const boxElement = box.current;
    if (!on || !stageElement || !boxElement || typeof ResizeObserver === 'undefined') return;
    // The stage's side, and the box's: what the example lays out in, before it is drawn smaller.
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
    // The room the box's height takes back, drawn smaller.
    const settle = () => {
      if (fit) boxElement.style.marginBlockEnd = `${boxElement.offsetHeight * (side / room - 1)}px`;
    };
    let frame = 0;
    const measure = () => {
      const width = stageElement.clientWidth;
      if (!width) return;
      if (Math.abs(width - side) > 0.5) {
        side = width;
        set(width);
        settle();
        return;
      }
      // What the example needs: the box's height, which it grows to, and its widest part with the
      // box's padding, where a part, such as a button that can't wrap, is wider than the room
      // inside the padding.
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
      if (needed > room + 0.5) set(needed);
      settle();
    };
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(measure);
    };
    measure();
    const observer = new ResizeObserver(update);
    observer.observe(stageElement);
    observer.observe(boxElement);
    for (const child of boxElement.children) observer.observe(child);
    // What renders later, such as an example whose module loads, is measured once it is there.
    const changes = new MutationObserver(() => {
      for (const child of boxElement.children) observer.observe(child);
      update();
    });
    changes.observe(boxElement, { childList: true });
    void document.fonts?.ready.then(update);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      changes.disconnect();
      boxElement.style.inlineSize = '';
      boxElement.style.minBlockSize = '';
      boxElement.style.marginInlineEnd = '';
      boxElement.style.marginBlockEnd = '';
      boxElement.style.removeProperty('--site-verdict-scale');
    };
  }, [stage, box, on, shape]);
}
