import { prefersReducedMotion } from '../../internal/motion/reducedMotion.js';

const stretchMostOfLength = 0.06;
const stretchGiveAtFirst = 0.55;

function rubberBand(past: number, reach: number): number {
  if (!(past > 0) || !(reach > 0)) return 0;
  return reach * (1 - 1 / (1 + (stretchGiveAtFirst * past) / reach));
}

const followAtOnceUntilReleaseSpringsBack = '0s';

function unstretchedBoxWhileStillSpringingBack(control: HTMLElement) {
  const now = Number.parseFloat(getComputedStyle(control).getPropertyValue('--_slider-stretch'));
  const s = Number.isFinite(now) ? now : 0;
  const box = control.getBoundingClientRect();
  const width = box.width / (1 + s);
  const height = box.height / (1 - s / 2);
  const fromRight = control.style.getPropertyValue('--_slider-stretch-origin') === 'right';
  const left = fromRight ? box.right - width : box.left;
  return { left, width, height };
}

export function followOverdrag(control: HTMLElement): () => void {
  const owner = control.ownerDocument;
  const view = owner.defaultView;
  if (!view) return () => {};
  let drag: { id: number; left: number; right: number; width: number; reach: number } | null = null;
  let pointerX = 0;
  let frame = 0;
  const stretch = (fraction: number) =>
    control.style.setProperty('--_slider-stretch', String(Math.round(fraction * 1e5) / 1e5));
  const apply = () => {
    frame = 0;
    if (!drag) return;
    const pastRight = pointerX - drag.right;
    const pastLeft = drag.left - pointerX;
    const past = Math.max(pastRight, pastLeft, 0);
    if (past > 0) {
      control.style.setProperty('--_slider-stretch-origin', pastRight > 0 ? 'left' : 'right');
      control.style.setProperty('--_slider-stretch-spring', followAtOnceUntilReleaseSpringsBack);
    }
    stretch(rubberBand(past, drag.reach) / drag.width);
  };
  const move = (event: PointerEvent) => {
    if (!drag || event.pointerId !== drag.id) return;
    const releasedWhereSomethingKeptTheEvent = event.buttons === 0;
    if (releasedWhereSomethingKeptTheEvent) return stop();
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
    springBackAtOnce();
  };
  const springBackAtOnce = () => {
    control.style.removeProperty('--_slider-stretch-spring');
    stretch(0);
  };
  const down = (event: PointerEvent) => {
    if (drag || event.button !== 0 || !event.isPrimary) return;
    if (prefersReducedMotion(view)) return;
    const { left, width, height } = unstretchedBoxWhileStillSpringingBack(control);
    if (!(width > 0)) return;
    const reach = Math.min(width * stretchMostOfLength, height / 2);
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

export function followDrag(control: HTMLElement, slider: HTMLElement): () => void {
  const owner = control.ownerDocument;
  const view = owner.defaultView;
  let pointer: number | null = null;
  const move = (event: PointerEvent) => {
    if (event.pointerId !== pointer) return;
    const releasedWhereSomethingKeptTheEvent = event.buttons === 0;
    if (releasedWhereSomethingKeptTheEvent) return stop();
    slider.style.setProperty('--_slider-glide', '0s');
  };
  const end = (event: Event) => {
    if (!('pointerId' in event) || (event as PointerEvent).pointerId === pointer) stop();
  };
  const stop = () => {
    pointer = null;
    owner.removeEventListener('pointermove', move, true);
    owner.removeEventListener('pointerup', end, true);
    owner.removeEventListener('pointercancel', end, true);
    control.removeEventListener('lostpointercapture', end);
    view?.removeEventListener('blur', end);
    slider.style.removeProperty('--_slider-glide');
  };
  const down = (event: PointerEvent) => {
    if (pointer !== null || event.button !== 0 || !event.isPrimary) return;
    pointer = event.pointerId;
    owner.addEventListener('pointermove', move, true);
    owner.addEventListener('pointerup', end, true);
    owner.addEventListener('pointercancel', end, true);
    control.addEventListener('lostpointercapture', end);
    view?.addEventListener('blur', end);
  };
  control.addEventListener('pointerdown', down);
  return () => {
    control.removeEventListener('pointerdown', down);
    if (pointer !== null) stop();
  };
}
