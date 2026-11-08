import { useLayoutEffect, useRef, type RefObject } from 'react';
import { headingEvent } from '../motion/MustShow';
import { markRunsOn } from './Crop';
import { fit } from './Fit';
import { newFitting, type FitKind } from './Fitting';

/** How a picture is fitted to its stage (useFit). */
export interface FitOptions extends Partial<Pick<FitKind, 'ownSize' | 'legible'>> {
  /** Whether it is fitted at all: its picture is shown. */
  on: boolean;
  /** Whether the window it lays out in counts whole, as a gallery's does. */
  whole: boolean;
  /** Whether it is a page's own tile, drawn at its window's scale. */
  tile: boolean;
  /** Whether it plays now, which draws it out for what it opens. */
  playing: boolean;
}

/**
 * Scales the picture down until what it shows fits its stage, and centres it there: CSS can't
 * size a box to what its content measures. It follows the stage's width, the picture as it loads
 * and resizes, and the overlays as they open, are placed and finish their transitions: each change
 * fits it again in the next frame, however late it comes, so no timing decides whether it fits.
 * A page's own tile is drawn at its window's scale. At rest it is centred on what it paints, and a
 * gallery's tile framed as it plays, with what its pointer heads to in view (onCourse). As it
 * plays, its view stays where it is, so what happens in it, such as notifications stacking, happens
 * in place; it moves only when something would leave the stage, easing just far enough to keep it
 * in. In a gallery, it is drawn out once for all its animation acts on and opens (playFit), and
 * eases back to centre the still at its scale once the tile rests.
 *
 * Fit.ts fits it once; this hook fits it again as anything that changes it does.
 */
export function useFit(
  stage: RefObject<HTMLElement | null>,
  canvas: RefObject<HTMLElement | null>,
  { on, whole, tile, playing, ownSize = false, legible = false }: FitOptions,
) {
  const playingNow = useRef(playing);
  const refit = useRef<(() => void) | null>(null);
  useLayoutEffect(() => {
    playingNow.current = playing;
    // Rested, it is centred again.
    refit.current?.();
  }, [playing]);
  useLayoutEffect(() => {
    const stageElement = stage.current;
    const canvasElement = canvas.current;
    if (!on || !stageElement || !canvasElement) return;
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => fit(fitting));
    };
    refit.current = update;
    const fitting = newFitting(
      stageElement,
      canvasElement,
      { whole, tile, ownSize, legible },
      playingNow,
      update,
    );
    const { resize, view } = fitting;
    resize.observe(stageElement);
    resize.observe(canvasElement);
    // The example renders once its module loads, and its overlays open into a canvas that keeps
    // its size; a popup is placed by its style a frame or two later, without changing size. The
    // canvas's own attributes are the fit's; what is added to it or removed from it, such as the
    // example as its module loads, is the picture's, and fits it again.
    // As a tile plays, only what settles moves its view: what is added or removed, a transition or
    // an animation that ends, a resize. Not each step of a motion, such as a notification sliding
    // in from the edge, nor a popup placed again as the view moves.
    const changes = new MutationObserver((records) => {
      const added = records.some((record) => record.type === 'childList');
      if (tile && playingNow.current && !added) return;
      if (added || records.some((record) => record.target !== canvasElement)) update();
    });
    changes.observe(canvasElement, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['style', 'class', 'hidden'],
    });
    // A region that scrolls as the tile plays fades at its foot while its content runs on past it.
    const scrolled = (event: Event) => markRunsOn([event.target as Element]);
    canvasElement.addEventListener('scroll', scrolled, true);
    // An overlay that opens with a transition measures its final box once it ends.
    canvasElement.addEventListener('transitionend', update);
    canvasElement.addEventListener('animationend', update);
    // As the pointer heads somewhere else, the view keeps where it goes in the stage.
    canvasElement.addEventListener(headingEvent, update);
    void document.fonts?.ready.then(update);
    // An overlay may size to the window, such as a sheet as tall as it.
    window.addEventListener('resize', update);
    update();
    return () => {
      window.removeEventListener('resize', update);
      canvasElement.removeEventListener('scroll', scrolled, true);
      canvasElement.removeEventListener('transitionend', update);
      canvasElement.removeEventListener('animationend', update);
      canvasElement.removeEventListener(headingEvent, update);
      for (const property of [
        'inline-size',
        'block-size',
        'min-block-size',
        '--catalogue-canvas-scale',
      ])
        canvasElement.style.removeProperty(property);
      canvasElement.parentElement?.style.removeProperty('--catalogue-crop-top');
      cancelAnimationFrame(frame);
      cancelAnimationFrame(view.frame);
      changes.disconnect();
      resize.disconnect();
      refit.current = null;
    };
  }, [stage, canvas, on, whole, tile, ownSize, legible]);
}
