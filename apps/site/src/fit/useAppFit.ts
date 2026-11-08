import { useLayoutEffect, type RefObject } from 'react';
import { remPixels } from '../shared/Lengths';

/**
 * Lays the canvas of an application's tile out over its stage, less the margin the frame keeps
 * (`--catalogue-app-margin`), at its own size, or `--catalogue-app-scale` on a narrow card. A tile
 * no narrower than `least` rem is cut off at its end where that is wider than the card
 * (AppTile.css). It follows the stage's size, and shows the canvas once it is laid out.
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
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(stageElement);
    return () => observer.disconnect();
  }, [stage, canvas, on, least]);
}

/** Lays a canvas out over its stage, as useAppFit says. */
function fitApp(stage: HTMLElement, canvas: HTMLElement, least: number) {
  const rem = remPixels();
  const style = getComputedStyle(canvas);
  const margin = (parseFloat(style.getPropertyValue('--catalogue-app-margin')) || 0) * rem;
  const width = stage.clientWidth - 2 * margin;
  const height = stage.clientHeight - 2 * margin;
  if (width <= 0 || height <= 0) return;
  const scale = parseFloat(style.getPropertyValue('--catalogue-app-scale')) || 1;
  // Wider than the card, it is cut off at its end, fading out there, as a screenshot is cropped.
  if (least * rem * scale > width + 0.5) canvas.dataset.cut = 'end';
  else delete canvas.dataset.cut;
  canvas.style.setProperty('--catalogue-app-least', `${least}rem`);
  canvas.style.inlineSize = `${width / scale}px`;
  canvas.style.blockSize = `${height / scale}px`;
  canvas.style.minBlockSize = '0';
  canvas.style.transform = `translate(${margin}px, ${margin}px) scale(${scale})`;
  canvas.dataset.fitted = '';
}
