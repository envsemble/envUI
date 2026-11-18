import { useLayoutEffect } from 'react';
import { prefersReducedMotion } from '../shared/ReducedMotion';
import { rootMotionDuration, rootMotionEasing } from '../shared/RootMotionTokens';

function leavingLayer(element: HTMLElement) {
  const page = element.closest<HTMLElement>('.site-main');
  if (!page) return undefined;
  let layer = page.querySelector<HTMLElement>(':scope > .site-loading-leaving-layer');
  if (!layer) {
    layer = document.createElement('div');
    layer.className = 'site-loading-leaving-layer';
    layer.setAttribute('aria-hidden', 'true');
    layer.inert = true;
    page.append(layer);
  }
  return layer;
}

interface Look {
  box: DOMRect;
  backgroundColor: string;
  borderRadius: string;
  boxShadow: string;
  times: (CSSNumberish | null)[];
}

const skeletons = new Set<HTMLElement>();

const crossfadeMotion = () => ({
  leave: { duration: rootMotionDuration('fast'), easing: rootMotionEasing('ease-exit') },
  enter: { duration: rootMotionDuration('medium'), easing: rootMotionEasing('ease-enter') },
});

let measured: { looks: Map<HTMLElement, Look>; layers: Map<HTMLElement, DOMRect> } | undefined;

const cacheCrossfadeTokensWhileMeasuring = () => void crossfadeMotion();

function lookOf(element: HTMLElement): Look {
  const style = getComputedStyle(element);
  return {
    box: element.getBoundingClientRect(),
    backgroundColor: style.backgroundColor,
    borderRadius: style.borderRadius,
    boxShadow: style.boxShadow,
    times: element.getAnimations({ subtree: true }).map((animation) => animation.currentTime),
  };
}

function measureAsItLeaves(element: HTMLElement, layer: HTMLElement) {
  if (!measured) {
    const batch = { looks: new Map<HTMLElement, Look>(), layers: new Map<HTMLElement, DOMRect>() };
    for (const skeleton of skeletons)
      if (skeleton.isConnected && seen(skeleton)) batch.looks.set(skeleton, lookOf(skeleton));
    batch.layers.set(layer, layer.getBoundingClientRect());
    cacheCrossfadeTokensWhileMeasuring();
    measured = batch;
    queueMicrotask(() => (measured = undefined));
  }
  let at = measured.layers.get(layer);
  if (!at) {
    at = layer.getBoundingClientRect();
    measured.layers.set(layer, at);
  }
  return { look: measured.looks.get(element) ?? lookOf(element), at };
}

let pulses: (() => void)[] | undefined;
function pulseTogether(pulse: () => void) {
  if (!pulses) {
    const batch: (() => void)[] = [];
    pulses = batch;
    queueMicrotask(() => {
      pulses = undefined;
      for (const each of batch) each();
    });
  }
  pulses.push(pulse);
}

function leaveInPlace(element: HTMLElement) {
  const layer = leavingLayer(element);
  if (!layer) return undefined;
  const {
    look: { box, times, ...fill },
    at,
  } = measureAsItLeaves(element, layer);
  if (!box.width || !box.height) return undefined;
  const copy = element.cloneNode(true) as HTMLElement;
  for (const node of [copy, ...copy.querySelectorAll('[id]')]) node.removeAttribute('id');
  copy.classList.replace('site-loading', 'site-loading-leaving');
  copy.removeAttribute('data-site-part');
  copy.removeAttribute('aria-busy');
  Object.assign(copy.style, {
    position: 'absolute',
    margin: '0',
    boxSizing: 'border-box',
    inlineSize: `${box.width}px`,
    blockSize: `${box.height}px`,
    minInlineSize: '0',
    minBlockSize: '0',
    maxInlineSize: 'none',
    ...fill,
  });
  let gone = false;
  const remove = () => {
    gone = true;
    copy.remove();
  };
  const timer = window.setTimeout(remove, leaveLongestMs);
  return {
    place() {
      copy.style.left = `${box.left - at.left}px`;
      copy.style.top = `${box.top - at.top}px`;
      layer.append(copy);
      pulseTogether(() => {
        const animations = copy.getAnimations({ subtree: true });
        if (animations.length === times.length)
          animations.forEach((animation, index) => (animation.currentTime = times[index] ?? null));
      });
    },
    fade() {
      window.clearTimeout(timer);
      if (gone) return;
      if (!copy.isConnected || prefersReducedMotion()) return remove();
      copy
        .animate([{ opacity: 1 }, { opacity: 0 }], { ...crossfadeMotion().leave, fill: 'forwards' })
        .finished.then(remove, remove);
    },
  };
}

const leaveLongestMs = 2000;

function whenPlaced(room: HTMLElement, then: () => void) {
  const watch = new MutationObserver(() => {
    if (room.dataset.placed === undefined) return;
    watch.disconnect();
    window.clearTimeout(timer);
    then();
  });
  watch.observe(room, { attributes: true, attributeFilter: ['data-placed'] });
  const timer = window.setTimeout(() => {
    watch.disconnect();
    then();
  }, leaveLongestMs);
}

const seen = (element: HTMLElement) =>
  element.classList.contains('site-loading-stage') ||
  (element.classList.contains('site-loading-subject') && element.dataset.shown !== undefined);

export const arrivedEvent = 'site-arrived';

const arrive = (part: Element) => part.dispatchEvent(new Event(arrivedEvent, { bubbles: true }));

export function useArrival(skeleton: { current: HTMLElement | null }) {
  useLayoutEffect(() => {
    const element = skeleton.current;
    const parent = element?.parentElement;
    if (!element || !parent) return;
    skeletons.add(element);
    return () => {
      const before = new Set(parent.children);
      const leaving = element.isConnected && seen(element) ? leaveInPlace(element) : undefined;
      skeletons.delete(element);
      queueMicrotask(() => {
        if (!parent.isConnected) return;
        const arrived = [...parent.children].filter(
          (child) => !before.has(child) && !child.classList.contains('site-loading'),
        );
        const room = parent.closest<HTMLElement>('.catalogue-open-example:not([data-placed])');
        leaving?.place();
        if (room) {
          whenPlaced(room, () => {
            leaving?.fade();
            arrived.forEach(arrive);
          });
          return;
        }
        leaving?.fade();
        if (prefersReducedMotion()) {
          arrived.forEach(arrive);
          return;
        }
        const { enter } = crossfadeMotion();
        for (const child of arrived)
          child.animate([{ opacity: 0 }, { opacity: 1 }], enter).finished.then(
            () => arrive(child),
            () => undefined,
          );
      });
    };
  }, [skeleton]);
}
