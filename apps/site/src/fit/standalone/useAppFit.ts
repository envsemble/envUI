import { useLayoutEffect, type RefObject } from 'react';
import { remPixels } from '@envui-internal/internal/dom/lengths';
import { pixelTolerance, remeasure } from '../../shared/Remeasure';

/**
 * Lays out the canvas of an application's tile to fill its stage, less the frame's margin
 * (`--catalogue-app-margin`), at its own size, or at `--catalogue-app-scale` on a narrow card.
 * `least` is the tile's least width, in rem: where that is wider than the card, the canvas is cut
 * off at its end (AppTile.css). It lays out again when the stage resizes, and marks the canvas
 * shown (`data-fitted`) once laid out.
 */
export function useAppFit(
  stage: RefObject<HTMLElement | null>,
  canvas: RefObject<HTMLElement | null>,
  on: boolean,
  least = 0,
) {
  useLayoutEffect(() => {
    const stageElement = stage.current;
    const canvasElement = canvas.current;
    if (!on || !stageElement || !canvasElement) return;
    const fit = () => fitApp(stageElement, canvasElement, least);
    return remeasure(fit, { first: 'now', resize: [stageElement] }).stop;
  }, [stage, canvas, on, least]);
}

/** Lays a canvas out over its stage, as described at useAppFit. */
function fitApp(stage: HTMLElement, canvas: HTMLElement, least: number) {
  const rem = remPixels();
  const style = getComputedStyle(canvas);
  const margin = (parseFloat(style.getPropertyValue('--catalogue-app-margin')) || 0) * rem;
  const width = stage.clientWidth - 2 * margin;
  const height = stage.clientHeight - 2 * margin;
  if (width <= 0 || height <= 0) return;
  const scale = parseFloat(style.getPropertyValue('--catalogue-app-scale')) || 1;
  // A tile wider than the card is cut off at its end and fades out there, like a cropped
  // screenshot.
  if (least * rem * scale > width + pixelTolerance) canvas.dataset.cut = 'end';
  else delete canvas.dataset.cut;
  canvas.style.setProperty('--catalogue-app-least', `${least}rem`);
  canvas.style.inlineSize = `${width / scale}px`;
  canvas.style.blockSize = `${height / scale}px`;
  canvas.style.minBlockSize = '0';
  canvas.style.transform = `translate(${margin}px, ${margin}px) scale(${scale})`;
  canvas.dataset.fitted = '';
}
