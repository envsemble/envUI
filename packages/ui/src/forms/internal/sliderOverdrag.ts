// A slider's stretch as a pointer drags past either end, as a rubber band.
import { prefersReducedMotion } from '../../internal/reducedMotion.js';

/**
 * The most a slider stretches, as a fraction of its length, and, so that a wide one stays calm, at
 * most half its height.
 */
const stretchMost = 0.06;
/** How readily the stretch gives at first: at a pointer's first pixels past the end, about half. */
const stretchGive = 0.55;

/**
 * How far the slider stretches, in pixels, for a pointer this far past its end: a rubber band's
 * curve, which gives a little over half the distance at first and less the further it goes,
 * approaching the reach but never reaching it, and always short of the pointer.
 */
function rubberBand(past: number, reach: number): number {
  if (!(past > 0) || !(reach > 0)) return 0;
  return reach * (1 - 1 / (1 + (stretchGive * past) / reach));
}

/**
 * Follows a pointer that presses the slider's control and drags past either end: the control's
 * --env-slider-stretch is the fraction it stretches by, and --env-slider-stretch-origin the side it
 * stays fixed on, the one away from the pointer, physical, so either direction works. The stretch
 * is measured once a frame, at most, and follows at once (--env-slider-stretch-spring, 0s); a release
 * sets it back to 0, and the stylesheet springs it back.
 * Under reduced motion it never stretches. Returns the cleanup.
 */
export function followOverdrag(control: HTMLElement): () => void {
  const owner = control.ownerDocument;
  const view = owner.defaultView;
  if (!view) return () => {};
  let drag: { id: number; left: number; right: number; width: number; reach: number } | null = null;
  let pointerX = 0;
  let frame = 0;
  const stretch = (fraction: number) =>
    control.style.setProperty('--env-slider-stretch', String(Math.round(fraction * 1e5) / 1e5));
  const apply = () => {
    frame = 0;
    if (!drag) return;
    const pastRight = pointerX - drag.right;
    const pastLeft = drag.left - pointerX;
    const past = Math.max(pastRight, pastLeft, 0);
    if (past > 0) {
      control.style.setProperty('--env-slider-stretch-origin', pastRight > 0 ? 'left' : 'right');
      // Past the end, the stretch follows the pointer at once, until the release springs it back.
      control.style.setProperty('--env-slider-stretch-spring', '0s');
    }
    stretch(rubberBand(past, drag.reach) / drag.width);
  };
  const move = (event: PointerEvent) => {
    if (!drag || event.pointerId !== drag.id) return;
    // A move without a button means the release went to something that kept it.
    if (event.buttons === 0) return stop();
    pointerX = event.clientX;
    if (!frame) frame = view.requestAnimationFrame(apply);
  };
  const end = (event: Event) => {
    if (drag && (!('pointerId' in event) || (event as PointerEvent).pointerId === drag.id)) stop();
  };
  const listen = () => {
    owner.addEventListener('pointermove', move, true);
    owner.addEventListener('pointerup', end, true);
    owner.addEventListener('pointercancel', end, true);
    control.addEventListener('lostpointercapture', end);
    view.addEventListener('blur', end);
  };
  const stop = () => {
    drag = null;
    if (frame) view.cancelAnimationFrame(frame);
    frame = 0;
    owner.removeEventListener('pointermove', move, true);
    owner.removeEventListener('pointerup', end, true);
    owner.removeEventListener('pointercancel', end, true);
    control.removeEventListener('lostpointercapture', end);
    view.removeEventListener('blur', end);
    // Both in one change, as the release may be measured before the next frame.
    control.style.removeProperty('--env-slider-stretch-spring');
    stretch(0);
  };
  const down = (event: PointerEvent) => {
    if (drag || event.button !== 0 || !event.isPrimary) return;
    if (prefersReducedMotion(view)) return;
    // The box as it would be unstretched, as a press can come while the slider still springs back:
    // its stretch so far, and the side it stretches from, give its length and where it starts.
    const now = Number.parseFloat(
      getComputedStyle(control).getPropertyValue('--env-slider-stretch'),
    );
    const s = Number.isFinite(now) ? now : 0;
    const box = control.getBoundingClientRect();
    const width = box.width / (1 + s);
    const height = box.height / (1 - s / 2);
    if (!(width > 0)) return;
    const fromRight = control.style.getPropertyValue('--env-slider-stretch-origin') === 'right';
    const left = fromRight ? box.right - width : box.left;
    const reach = Math.min(width * stretchMost, height / 2);
    drag = { id: event.pointerId, left, right: left + width, width, reach };
    pointerX = event.clientX;
    listen();
  };
  control.addEventListener('pointerdown', down);
  return () => {
    control.removeEventListener('pointerdown', down);
    if (drag) stop();
  };
}
