import { useLayoutEffect } from 'react';
import { prefersReducedMotion } from '@envui-internal/internal/motion/reducedMotion';
import { rootMotionDuration, rootMotionEasing } from '../shared/RootMotionTokens';

/**
 * The layer over a page that holds the copies of skeletons on their way out (leaveInPlace): over
 * the whole scrolling page, which it scrolls with, and clipped to it, so a copy never adds to the
 * page's length; out of the page's flow, so it changes no part's layout, as a copy among the part's
 * own siblings would, such as which of them is the last. Made the first time it is needed.
 */
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

/** What a leaving skeleton's copy keeps of it: its box, fill and corners, and its pulse's time. */
interface Look {
  box: DOMRect;
  backgroundColor: string;
  borderRadius: string;
  boxShadow: string;
  times: (CSSNumberish | null)[];
}

/** The skeletons in the page that leave as copies (`seen`), which are measured together. */
const skeletons = new Set<HTMLElement>();

/**
 * The looks of every skeleton in the page that would leave as a copy, measured together as the
 * first of them leaves in a commit, and kept until the commit is over. React removes each skeleton
 * that leaves right after its cleanup, so measuring each one as it leaves would lay the page out
 * again for every one, a long pause on a page where dozens land at once; measured together, the
 * page is laid out once.
 */
let looks: Map<HTMLElement, Look> | undefined;

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

/** The look of a skeleton as it leaves, measured with the others that may leave in its commit. */
function lookAsItLeaves(element: HTMLElement) {
  if (!looks) {
    const measured = new Map<HTMLElement, Look>();
    for (const skeleton of skeletons)
      if (skeleton.isConnected && seen(skeleton)) measured.set(skeleton, lookOf(skeleton));
    looks = measured;
    // After the commit's cleanups, which run together, and before the next commit's.
    queueMicrotask(() => (looks = undefined));
  }
  return looks.get(element) ?? lookOf(element);
}

/** The motion of a crossfade, from the root's motion tokens. */
interface Motion {
  leave: KeyframeAnimationOptions;
  enter: KeyframeAnimationOptions;
}

/**
 * What the crossfades after one commit share of what they read of the page, each in a microtask
 * of its own: the leaving layer's box, read once, as placing a copy changes the layout inside the
 * layer but not the layer's own box; the motion tokens, read once; and the copies' pulses, which
 * take up their skeletons' times once every copy is in, as reading a copy's animations works out
 * its style. Read in each crossfade, after the copy before it went in, each would work out the
 * page again, a long pause on a page where dozens of parts land at once.
 */
let together:
  { layers: Map<HTMLElement, DOMRect>; motion?: Motion; pulses: (() => void)[] } | undefined;
function crossfadingTogether() {
  if (!together) {
    const batch = { layers: new Map<HTMLElement, DOMRect>(), pulses: [] as (() => void)[] };
    together = batch;
    // After the crossfades of the commit, each in a microtask queued before this one.
    queueMicrotask(() => {
      together = undefined;
      for (const pulse of batch.pulses) pulse();
    });
  }
  return together;
}

/** The leaving layer's box, as the crossfades after one commit read it (crossfadingTogether). */
function layerBox(layer: HTMLElement) {
  const { layers } = crossfadingTogether();
  let box = layers.get(layer);
  if (!box) {
    box = layer.getBoundingClientRect();
    layers.set(layer, box);
  }
  return box;
}

/** The crossfade's motion, as the crossfades after one commit read it (crossfadingTogether). */
function crossfadeMotion() {
  const batch = crossfadingTogether();
  batch.motion ??= {
    leave: { duration: rootMotionDuration('fast'), easing: rootMotionEasing('ease-exit') },
    enter: { duration: rootMotionDuration('medium'), easing: rootMotionEasing('ease-enter') },
  };
  return batch.motion;
}

/**
 * A skeleton that leaves while it shows, kept as a copy where it was, unseen by assistive
 * technology and no longer counted as loading, over what takes its place, until that shows: then
 * it fades out as what it stood for fades in, in the same frame, so the stage is never seen empty
 * between them. Measured as it leaves, while still in place (lookAsItLeaves), and drawn as it was,
 * its fill and corners as its place gave them, its pulse going on where it was; `place` lays the
 * copy over the same box in the page's leaving layer, and `fade` fades it out in the fast time and
 * removes it, at once with motion reduced. A skeleton outside the page, or not laid out, leaves no
 * copy.
 */
function leaveInPlace(element: HTMLElement) {
  const layer = leavingLayer(element);
  if (!layer) return undefined;
  const { box, times, ...fill } = lookAsItLeaves(element);
  if (!box.width || !box.height) return undefined;
  // A clone of an element is one.
  const copy = element.cloneNode(true) as HTMLElement;
  for (const node of [copy, ...copy.querySelectorAll('[id]')]) node.removeAttribute('id');
  // No longer a part that loads, for the page and the tests (`.site-loading`).
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
  // However what it waits for goes, the copy goes too.
  const timer = window.setTimeout(remove, leaveLongest);
  return {
    place() {
      const at = layerBox(layer);
      copy.style.left = `${box.left - at.left}px`;
      copy.style.top = `${box.top - at.top}px`;
      layer.append(copy);
      crossfadingTogether().pulses.push(() => {
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

/** How long, in ms, a skeleton's copy may wait for what took its place to show. */
const leaveLongest = 2000;

/**
 * Runs `then` once an open example's room shows, made for its overlays (OpenExample.tsx), or once
 * the wait is over.
 */
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
  }, leaveLongest);
}

/**
 * Whether a figure's subject's skeleton is seen (StageSkeleton): once it shows, or as a stage,
 * which is there from the first frame. Only such a skeleton, a shape with no content of its own,
 * stays as a copy as it leaves; any other, such as a code block's, which is the part it stands for
 * over placeholder text, gives way to it at once, as it fades in.
 */
const seen = (element: HTMLElement) =>
  element.classList.contains('site-loading-stage') ||
  (element.classList.contains('site-loading-subject') && element.dataset.shown !== undefined);

/**
 * The event, bubbling, that a part which took a skeleton's place receives once it shows in full
 * (useArrival): as it fades in, it is drawn see-through, so what measures which of its words
 * show, such as a device figure's fit, measures again then.
 */
export const arrivedEvent = 'site-arrived';

/** Tells a part that it shows in full (arrivedEvent). */
const arrive = (part: Element) => part.dispatchEvent(new Event(arrivedEvent, { bubbles: true }));

/**
 * Crossfades a skeleton with what takes its place in its parent, once, as it leaves: the skeleton
 * fades out in the fast time as it leaves the page, and the parts the parent didn't hold before
 * fade in in the medium one, entering, in the same frame (leaveInPlace). In an open example's room
 * that isn't made yet, which shows as a whole once its overlays rest open, the skeleton stays
 * until the room shows and fades in. With motion reduced, it is all at once. Each part that
 * arrives is sent `arrivedEvent` once it shows in full: as it finishes fading in, or as its room
 * shows, else at once.
 */
export function useArrival(skeleton: { current: HTMLElement | null }) {
  useLayoutEffect(() => {
    const element = skeleton.current;
    const parent = element?.parentElement;
    if (!element || !parent) return;
    skeletons.add(element);
    return () => {
      const before = new Set(parent.children);
      // Now, while it is still in place: React removes it after this.
      const leaving = element.isConnected && seen(element) ? leaveInPlace(element) : undefined;
      skeletons.delete(element);
      // Once React has put what it stands for in its place, before the page paints.
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
          child
            .animate([{ opacity: 0 }, { opacity: 1 }], enter)
            // Cancelled, as the part leaves again, it has nothing to tell.
            .finished.then(
              () => arrive(child),
              () => undefined,
            );
      });
    };
  }, [skeleton]);
}
